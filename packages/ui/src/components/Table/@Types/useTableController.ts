import { useEffect, useMemo, useRef, useState } from "react"
import { clamp } from "../@utils/table"

// * 서버 정렬 조건(정렬 기준 key + 방향) 타입
export type ServerTableSort = {
  key: string
  direction: "ASC" | "DESC"
}

// * 서버 필터 조건(필터 대상 key + 연산자 + 값) 타입
export type ServerTableFilter = {
  key: string
  operator?: string
  value?: unknown
}

// * 서버 제어형 테이블 쿼리(페이지/사이즈/검색/정렬/필터) 타입
export type ServerTableQuery = {
  page: number
  rowsPerPage: number
  keyword: string
  sort?: ServerTableSort
  filters?: ServerTableFilter[]
}

// * 테이블 페이지네이션 관련 외부 설정(컨트롤/옵션/총합/호환 핸들러) 타입
type TableConfig = {
  page?: number
  rowsPerPage?: number
  rowsPerPageOptions?: number[]
  totalCount?: number
  handleOnRowsPerPageChange?: (e: any) => void
}

// * useTableController 훅 입력 파라미터(제어/이벤트/검색/정렬/필터/쿼리 통지) 타입
type Params = {
  disabled?: boolean

  tableConfig?: TableConfig

  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void

  controlledKeyword?: string
  onKeywordChange?: (keyword: string) => void

  sort?: ServerTableSort
  filters?: ServerTableFilter[]

  onQueryChange?: (q: ServerTableQuery) => void
  searchDebounceMs?: number

  maxRowsPerPageLimit?: number
}

// * 입력 value를 delayMs 만큼 지연해 반영하는 debounce 유틸 훅
const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

/**---------------------------------------------------------------------------/
 *
 * ! useTableController
 *
 * * 서버 제어형 Table의 “페이지네이션/페이지크기/검색 키워드” 상태를 통합 관리하고, 변경 시 서버 쿼리(시그니처) 이벤트를 발행하는 컨트롤러 훅
 * * page/rowsPerPage/keyword는 controlled + uncontrolled를 혼합 지원하며, 최종적으로 안전한 값(safePage/rowsPerPage)으로 정규화됨
 * * keyword는 debounce 후 서버 쿼리에 반영되며, 쿼리 시그니처가 바뀔 때만 `onQueryChange`를 호출
 *
 * * 동작 규칙
 *   * rowsPerPageOptions
 *     * 기본 옵션은 `[10, 25, 50, 100]`
 *     * `maxRowsPerPageLimit`(기본 200) 이하의 양수/유효 숫자만 남기고, 모두 제거되면 `[min(100, limit)]`로 fallback
 *   * rowsPerPage/page 제어 방식
 *     * `tableConfig.rowsPerPage`가 number면 rowsPerPage는 controlled, 아니면 내부 state로 관리
 *     * `tableConfig.page`가 number면 page는 controlled, 아니면 내부 state로 관리
 *   * 값 정규화/가드
 *     * rowsPerPage는 `clamp(1..maxRowsPerPageLimit)`로 강제
 *     * page는 최소 1 보장, totalCount 기반 pageCount 산출 후 `safePage = clamp(page, 1, pageCount)`
 *   * pageCount 변화 시 보정
 *     * `pageCount`가 바뀌어 `safePage`가 범위를 벗어나면, controlled면 `onPageChange(next)` 호출 / uncontrolled면 내부 page를 보정
 *
 * * 이벤트 처리 방식
 *   * setPage(nextPage)
 *     * disabled면 차단
 *     * `next = clamp(nextPage, 1, pageCount)` 계산 후 `onPageChange(next)` 호출
 *     * page uncontrolled인 경우에만 내부 state 업데이트
 *   * setRowsPerPage(nextRowsPerPage)
 *     * disabled면 차단
 *     * `nextRp`를 limit 범위로 정규화 후 `tableConfig.handleOnRowsPerPageChange`(DOM 이벤트 형태)와 `onRowsPerPageChange(nextRp)` 호출
 *     * rowsPerPage uncontrolled인 경우에만 내부 state 업데이트
 *     * rowsPerPage 변경 시 page는 항상 1로 리셋(외부 콜백 호출 + uncontrolled면 내부 state도 갱신)
 *   * setKeyword(next)
 *     * disabled면 차단
 *     * `onKeywordChange(next)` 호출
 *     * keyword uncontrolled인 경우에만 내부 keyword state 업데이트
 *     * keyword 변경 시 page는 항상 1로 리셋(외부 콜백 호출 + uncontrolled면 내부 state도 갱신)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 해당 훅은 UI 스타일을 직접 다루지 않으며, 계산된 값(rowsPerPageOptions/fromTo 등)을 뷰 레이어로 전달하는 역할만 수행
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `tableConfig.totalCount`를 기준으로 `pageCount`를 계산(없으면 0으로 간주)
 *     * `sort/filters`는 서버 쿼리 구성요소로 포함되며, 훅 내부에서 가공하지 않고 그대로 전달
 *     * `searchDebounceMs`(기본 300ms)로 keyword를 debounce 후 서버 쿼리에 반영
 *   * 내부 계산 로직
 *     * `fromTo`: `safePage/rowsPerPage/totalCount`로 표시 구간(from/to)을 계산
 *     * `onQueryChange`: `{ page, rowsPerPage, keyword(debounced), sort, filters }`를 JSON stringify 시그니처로 비교하여 중복 호출을 방지
 *
 * @module useTableController
 * 서버 제어형 Table에서 페이지/페이지크기/검색 키워드 변경을 표준화하고, 안전한 쿼리 변경 이벤트를 발행하는 컨트롤러 훅
 *
 * @usage
 * const c = useTableController({
 *   tableConfig: { page, rowsPerPage, totalCount },
 *   sort,
 *   filters,
 *   onPageChange,
 *   onRowsPerPageChange,
 *   onKeywordChange,
 *   onQueryChange: (q) => fetch(q),
 * })
 *
/---------------------------------------------------------------------------**/
export const useTableController = ({
  disabled,
  tableConfig,
  onPageChange,
  onRowsPerPageChange,
  controlledKeyword,
  onKeywordChange,
  sort,
  filters,
  onQueryChange,
  searchDebounceMs = 300,
  maxRowsPerPageLimit = 200,
}: Params) => {
  // * rowsPerPageOptions를 최대 제한(maxRowsPerPageLimit) 내에서 안전하게 정규화
  const rowsPerPageOptions = useMemo(() => {
    const base = tableConfig?.rowsPerPageOptions?.length
      ? tableConfig.rowsPerPageOptions
      : [10, 25, 50, 100]
    const lim = Math.max(1, maxRowsPerPageLimit)
    const filtered = base.filter((n) => Number.isFinite(n) && n > 0 && n <= lim)
    return filtered.length ? filtered : [Math.min(100, lim)]
  }, [tableConfig?.rowsPerPageOptions, maxRowsPerPageLimit])

  // * uncontrolled rowsPerPage/page 기본 상태
  const [internalRowsPerPage, setInternalRowsPerPage] = useState<number>(
    Math.max(1, tableConfig?.rowsPerPage ?? rowsPerPageOptions[0] ?? 10),
  )
  const [internalPage, setInternalPage] = useState<number>(Math.max(1, tableConfig?.page ?? 1))

  // * 외부에서 값이 들어오면 controlled 로 판단
  const isControlledRowsPerPage = typeof tableConfig?.rowsPerPage === "number"
  const isControlledPage = typeof tableConfig?.page === "number"

  // * rowsPerPage 값을 controlled/uncontrolled 규약에 따라 단일 값으로 정규화 + 제한(clamp) 적용
  const rowsPerPage = useMemo(() => {
    const rp = isControlledRowsPerPage ? (tableConfig?.rowsPerPage as number) : internalRowsPerPage
    const normalized = Math.max(1, rp || rowsPerPageOptions[0] || 10)
    return clamp(normalized, 1, Math.max(1, maxRowsPerPageLimit))
  }, [
    isControlledRowsPerPage,
    tableConfig?.rowsPerPage,
    internalRowsPerPage,
    rowsPerPageOptions,
    maxRowsPerPageLimit,
  ])

  // * page 값을 controlled/uncontrolled 규약에 따라 단일 값으로 정규화
  const page = useMemo(() => {
    const p = isControlledPage ? (tableConfig?.page as number) : internalPage
    return Math.max(1, p || 1)
  }, [isControlledPage, tableConfig?.page, internalPage])

  // * keyword 값을 controlled/uncontrolled 규약에 따라 단일 값으로 정규화
  const [internalKeyword, setInternalKeyword] = useState("")
  const keyword = controlledKeyword ?? internalKeyword

  // * 서버 요청 트리거용 keyword는 debounce 값을 사용
  const debouncedKeywordForServer = useDebouncedValue(keyword ?? "", searchDebounceMs)

  // * totalCount를 음수가 되지 않도록 정규화
  const totalCount = useMemo(
    () => Math.max(0, tableConfig?.totalCount ?? 0),
    [tableConfig?.totalCount],
  )

  // * totalCount/rowsPerPage 기반 pageCount 계산(최소 1)
  const pageCount = useMemo(() => {
    if (totalCount <= 0) return 1
    return Math.max(1, Math.ceil(totalCount / rowsPerPage))
  }, [totalCount, rowsPerPage])

  // * 현재 page를 유효 범위(1..pageCount)로 보정한 안전 값
  const safePage = useMemo(() => clamp(page, 1, pageCount), [page, pageCount])

  // * pageCount 변경으로 인해 page가 범위를 벗어나면 자동 보정
  useEffect(() => {
    const next = clamp(safePage, 1, pageCount)
    if (next === safePage) return
    if (onPageChange) onPageChange(next)
    else setInternalPage(next)
  }, [pageCount])

  // * 현재 페이지 기준 표시용 from/to 범위를 계산
  const fromTo = useMemo(() => {
    if (totalCount <= 0) return { from: 0, to: 0 }
    const from = (safePage - 1) * rowsPerPage + 1
    const to = Math.min(totalCount, safePage * rowsPerPage)
    return { from, to }
  }, [totalCount, safePage, rowsPerPage])

  // * 페이지 변경(비활성/페이지 범위/controlled 규약을 지켜 반영)
  const setPage = (nextPage: number) => {
    if (disabled) return
    const next = clamp(nextPage, 1, pageCount)
    onPageChange?.(next)
    if (!isControlledPage) setInternalPage(next)
  }

  // * rowsPerPage 변경(비활성/제한/호환 핸들러 호출/페이지 1로 리셋)
  const setRowsPerPage = (nextRowsPerPage: number) => {
    if (disabled) return

    const nextRp = clamp(Math.max(1, nextRowsPerPage), 1, Math.max(1, maxRowsPerPageLimit))

    tableConfig?.handleOnRowsPerPageChange?.({ target: { value: nextRp } as any } as any)
    onRowsPerPageChange?.(nextRp)

    if (!isControlledRowsPerPage) setInternalRowsPerPage(nextRp)

    const nextPage = 1
    onPageChange?.(nextPage)
    if (!isControlledPage) setInternalPage(nextPage)
  }

  // * keyword 변경(비활성/controlled 규약 반영/페이지 1로 리셋)
  const setKeyword = (next: string) => {
    if (disabled) return
    onKeywordChange?.(next)
    if (controlledKeyword === undefined) setInternalKeyword(next)

    const nextPage = 1
    onPageChange?.(nextPage)
    if (!isControlledPage) setInternalPage(nextPage)
  }

  // * 동일 쿼리 중복 전송 방지를 위한 시그니처 ref
  const lastQueryRef = useRef<string>("")

  useEffect(() => {
    // * onQueryChange가 없으면 쿼리 통지 생략
    if (!onQueryChange) return

    // * 서버로 전달할 단일 쿼리 오브젝트 구성
    const q: ServerTableQuery = {
      page: safePage,
      rowsPerPage,
      keyword: String(debouncedKeywordForServer ?? ""),
      sort,
      filters,
    }

    // * 직전 쿼리와 동일하면 통지하지 않음
    const sig = JSON.stringify(q)
    if (sig === lastQueryRef.current) return

    lastQueryRef.current = sig
    onQueryChange(q)
  }, [onQueryChange, safePage, rowsPerPage, debouncedKeywordForServer, sort, filters])

  return {
    rowsPerPageOptions,
    rowsPerPage,
    page: safePage,
    pageCount,
    totalCount,
    fromTo,
    keyword,
    setPage,
    setRowsPerPage,
    setKeyword,
  }
}

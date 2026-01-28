import { JSX, useEffect, useMemo, useRef, useState } from "react"
import Pagination from "../Pagination/Pagination"
import { Typography } from "../Typography/Typography"
import type {
  ColumnProps,
  ServerTableQuery,
  SortDirection,
  TableProps,
  VirtualizedOptions,
} from "./@Types/table"
import TableContainer from "./_internal/TableContainer"
import TableHead from "./_internal/TableHead"
import TableRow from "./_internal/TableRow"
import TableTd from "./_internal/TableTd"
import TableTh from "./_internal/TableTh"
import TableTr from "./_internal/TableTr"
import Flex from "../Flex/Flex"
import TableTotalRows from "./_internal/TableTotalRows"
import TableRowsPerPage from "./_internal/TableRowsPerPage"
import TableSummaryRow from "./_internal/TableSummaryRow"
import Box from "../Box/Box"
import { theme } from "../../tokens/theme"
import type { ExportType } from "./_internal/TableExport"

import { clamp, clampRowsPerPage, parseWidthToPx } from "./@utils/table"
import TableToolBar from "./_internal/TableToolbar"

/**---------------------------------------------------------------------------/
 *
 * ! Table
 *
 * * 서버 제어형 Table의 “헤더/바디/요약행/툴바/페이지네이션”을 단일 컴포넌트로 합성해 제공
 * * 단일 진실원천(Single Source of Truth)은 `query`이며, 모든 사용자 액션은 `onQueryChange`로만 외부에 반영
 * * 컬럼 폭은 내부 state(`colPx`)로 관리하며, 드래그 리사이즈를 RAF로 스로틀링하여 성능을 보정
 * * 바디는 scrollLeft를 추적해 헤더를 translateX로 동기화하고, 옵션에 따라 virtualization(windowing)을 적용
 *
 * * 동작 규칙
 *   * 서버 제어 계약
 *     * `query(page/rowsPerPage/keyword/sort/filters)`가 렌더링 기준이며, 변경은 `emitQuery(partial)`로만 발생
 *     * `emitQuery`는 disabled면 차단하고, page/rowsPerPage/keyword를 정규화한 뒤 `onQueryChange(next)` 호출
 *   * 초기/외부 변경 보정(useEffect)
 *     * `safePage/pageCount` 및 `safeRowsPerPage` 계산 후, 입력 query가 범위를 벗어나면 `onQueryChange`로 보정 값을 즉시 반영
 *   * rowsPerPage 정규화
 *     * `rowsPerPageOptions`는 [10,25,50,100] 기본값을 lim(200) 이하 유효값만 남김
 *     * `rowsPerPage`는 `clampRowsPerPage`로 1..200 범위를 강제
 *   * page 정규화
 *     * totalCount 기반 pageCount를 산출하고 `safePage = clamp(page, 1, pageCount)`로 보정
 *
 * * 이벤트 처리 방식
 *   * 검색: 툴바 `onSearchChange(v)` → `emitQuery({ keyword: v, page: 1 })`
 *   * 페이지 이동: Pagination `onPageChange(p)` → `emitQuery({ page: p })`
 *   * rowsPerPage 변경: `emitQuery({ rowsPerPage: clampRowsPerPage(rp), page: 1 })`
 *   * 정렬: Header에서 컬럼별 `col.onSortChange(col.key, nextDirection)`를 호출(컬럼 정의가 외부 쿼리로 연결)
 *   * export: `handleExport(type)`에서 현재 query/컨텍스트를 합쳐 `onExport(type, ctx)` 호출(서버 job 전제)
 *   * row click/actions: view-only 이벤트로 TableRow에 위임(테이블 내부 상태 변경 없음)
 *   * disabled: emitQuery/resize/export 등 주요 인터랙션을 차단하고, 하위 컴포넌트에도 disabled를 전달
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 헤더 동기화: body의 `scrollLeft`를 추적해 headerInner에 `translateX(-scrollLeft)` 적용
 *   * 스크롤/리사이즈 추적: bodyScrollRef의 scroll/ResizeObserver를 RAF로 스로틀링하여 상태 업데이트
 *   * 컬럼 폭: `colPx`를 px 문자열로 변환해 `gridColumns` 생성, rowActions가 있으면 action 컬럼(80px)을 추가
 *   * sticky header: `TableHead`에 sticky/top을 전달(실제 sticky 동작은 TableHead가 책임)
 *   * 요약행(sticky bottom): summaryRow가 enabled + data 존재 시 `TableSummaryRow`를 바디 하단에 렌더링하고 stickyBottom 활성화
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(주요)
 *     * `query` + `onQueryChange`는 필수적인 서버 제어 인터페이스
 *     * `totalCount`는 pageCount/fromTo/label 계산의 기준
 *     * `columnConfig`는 헤더 렌더/정렬/초기 폭 산출의 기준
 *     * `data`는 현재 페이지의 표시 데이터(virtualized 시 windowing slice 대상)
 *   * 내부 계산 로직(주요)
 *     * `safeTotalCount/safeRowsPerPageOptions/safeRowsPerPage/pageCount/safePage`로 경계값을 보정
 *     * virtualization: scrollTop/viewportH/rowHeight/overscan으로 {start,end,padTop,padBottom} 범위를 계산
 *     * `rowKey`: row.id/key/_id/rowId 우선, 없으면 `${tableKey}_${index}` fallback
 *     * export ctx: exportContext(객체) + query(page/rowsPerPage/keyword/sort/filters) 병합 후 onExport 호출
 *
 * @module Table
 * 서버 제어형 데이터 테이블(리사이즈/가상화/툴바/요약행/페이지네이션)을 제공하는 상위 컴포넌트
 *
 * @usage
 * <Table
 *   tableKey="users"
 *   columnConfig={columns}
 *   data={rows}
 *   query={query}
 *   totalCount={total}
 *   onQueryChange={setQuery}
 *   pagination="Table"
 *   virtualized={{ enabled: true, rowHeight: 32, overscan: 6 }}
 * />
 *
/---------------------------------------------------------------------------**/

const Table = <T extends Record<string, unknown>>(props: TableProps<T>): JSX.Element => {
  const {
    tableKey,
    columnConfig,
    data = [],

    // * server-controlled (single source of truth)
    query,
    totalCount,
    rowsPerPageOptions = [10, 25, 50, 100],
    onQueryChange,

    // * view-only row events
    onRowClick,
    rowActions,

    // * layout
    sticky = true,
    height = 300,
    emptyRowText,
    disabled = false,
    pagination,
    totalRows = true,
    rowsPer = true,
    summaryRow,
    customTableHeader,

    // * toolbar
    toolbar,

    // * export (server job only)
    exportEnabled = false,
    exportItems,
    excludeExportTypes,
    onExport,
    exportContext,

    // * virtualization
    virtualized,

    ...baseProps
  } = props

  // * totalCount를 음수가 되지 않도록 안전하게 정규화
  const safeTotalCount = useMemo(() => Math.max(0, Number(totalCount ?? 0) || 0), [totalCount])

  // * rowsPerPageOptions를 운영 제한(최대 200) 내에서 정규화
  const safeRowsPerPageOptions = useMemo(() => {
    const lim = 200
    const out = (rowsPerPageOptions ?? [])
      .filter((n) => Number.isFinite(n) && n > 0 && n <= lim)
      .map((n) => Math.floor(n))
    return out.length ? out : [Math.min(100, lim)]
  }, [rowsPerPageOptions])

  // * query.rowsPerPage를 기본 옵션 및 최대 제한 기준으로 안전하게 정규화
  const safeRowsPerPage = useMemo(() => {
    const fallback = safeRowsPerPageOptions[0] ?? 10
    return clampRowsPerPage(query?.rowsPerPage ?? fallback, 200)
  }, [query?.rowsPerPage, safeRowsPerPageOptions])

  // * totalCount/rowsPerPage 기반 페이지 수 계산(최소 1)
  const pageCount = useMemo(() => {
    if (safeTotalCount <= 0) return 1
    return Math.max(1, Math.ceil(safeTotalCount / safeRowsPerPage))
  }, [safeTotalCount, safeRowsPerPage])

  // * query.page 값을 유효 범위(1..pageCount)로 보정한 안전 페이지 값
  const safePage = useMemo(
    () => clamp(Math.max(1, Number(query?.page ?? 1) || 1), 1, pageCount),
    [query?.page, pageCount],
  )

  // * query 기본 값(page/rowsPerPage/keyword)을 정규화해 서버 제어 계약을 유지
  useEffect(() => {
    const nextKeyword = String(query?.keyword ?? "")
    if (
      (query?.page ?? 1) !== safePage ||
      (query?.rowsPerPage ?? 0) !== safeRowsPerPage ||
      (query?.keyword ?? "") !== nextKeyword
    ) {
      onQueryChange({
        ...query,
        page: safePage,
        rowsPerPage: safeRowsPerPage,
        keyword: nextKeyword,
      })
    }
  }, [safePage, safeRowsPerPage])

  // * 부분 변경(partial)을 받아 서버 쿼리를 안전하게 정규화하고 onQueryChange로 단일 통지
  const emitQuery = (partial: Partial<ServerTableQuery>) => {
    if (disabled) return

    const next: ServerTableQuery = {
      ...query,
      page: partial.page ?? query.page,
      rowsPerPage: partial.rowsPerPage ?? query.rowsPerPage,
      keyword: partial.keyword ?? query.keyword,
      sort: partial.sort ?? query.sort,
      filters: partial.filters ?? query.filters,
    }

    const normalizedRowsPerPage = clampRowsPerPage(next.rowsPerPage, 200)
    const normalizedPage = clamp(
      Math.max(1, next.page || 1),
      1,
      Math.max(1, Math.ceil(safeTotalCount / normalizedRowsPerPage) || 1),
    )

    onQueryChange({
      ...next,
      page: normalizedPage,
      rowsPerPage: normalizedRowsPerPage,
      keyword: String(next.keyword ?? ""),
    })
  }

  // ---------------------------------------------------------------------------
  // * Column widths + drag resize (RAF)
  // ---------------------------------------------------------------------------

  // * 컬럼 width를 px 단위 배열로 관리(초기값은 columnConfig.width 또는 기본 160)
  const [colPx, setColPx] = useState<number[]>(() =>
    (columnConfig as ColumnProps<T>[]).map((c) => parseWidthToPx(c.width as any) ?? 160),
  )

  // * 컬럼 개수가 변경되면 기존 폭을 최대한 유지하면서 신규 컬럼 폭을 보정
  useEffect(() => {
    setColPx((prev) => {
      if (prev.length === columnConfig.length) return prev
      return (columnConfig as ColumnProps<T>[]).map(
        (c, i) => prev[i] ?? parseWidthToPx(c.width as any) ?? 160,
      )
    })
  }, [columnConfig])

  // * 드래그 상태(활성/컬럼 인덱스/시작 좌표/시작 폭)를 ref로 유지
  const dragRef = useRef<{ active: boolean; colIndex: number; startX: number; startW: number }>({
    active: false,
    colIndex: -1,
    startX: 0,
    startW: 0,
  })

  // * 리사이즈 업데이트를 RAF로 묶기 위한 ref
  const rafResizeRef = useRef<number | null>(null)
  const pendingResizeRef = useRef<{ colIndex: number; width: number } | null>(null)

  // * mousemove/mouseup을 전역에 바인딩해 컬럼 드래그 리사이즈를 처리
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.startX
      const nextW = clamp(dragRef.current.startW + dx, 60, 2000)

      pendingResizeRef.current = { colIndex: dragRef.current.colIndex, width: nextW }
      if (rafResizeRef.current !== null) return

      rafResizeRef.current = window.requestAnimationFrame(() => {
        rafResizeRef.current = null
        const pending = pendingResizeRef.current
        if (!pending) return
        setColPx((prev) => {
          const next = [...prev]
          next[pending.colIndex] = pending.width
          return next
        })
      })
    }

    const onUp = () => {
      if (!dragRef.current.active) return
      dragRef.current.active = false
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      if (rafResizeRef.current !== null) {
        window.cancelAnimationFrame(rafResizeRef.current)
        rafResizeRef.current = null
      }
    }
  }, [])

  // * 특정 컬럼의 리사이즈를 시작하는 핸들러 생성기
  const startResize = (colIndex: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { active: true, colIndex, startX: e.clientX, startW: colPx[colIndex] ?? 160 }
  }

  // * 현재 컬럼 폭(px) 기반 grid-template-columns 문자열 생성(+ rowActions가 있으면 action columns 추가)
  const gridColumns = useMemo(() => {
    const base = colPx.map((w) => `${w}px`).join(" ")
    const actionCols = (rowActions?.length ?? 0) > 0 ? rowActions!.map(() => `80px`).join(" ") : ""
    return actionCols ? `${base} ${actionCols}` : base
  }, [colPx, rowActions])

  // ---------------------------------------------------------------------------
  // * Scroll sync (header translateX) + virtualization range
  // ---------------------------------------------------------------------------

  // * 바디 스크롤 요소 ref
  const bodyScrollRef = useRef<HTMLDivElement | null>(null)

  // * 스크롤 이벤트를 RAF로 묶어 상태 업데이트 비용을 제한
  const rafScrollRef = useRef<number | null>(null)

  // * header/body 동기화를 위한 scrollLeft, virtualization 계산을 위한 scrollTop/viewportH 상태
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportH, setViewportH] = useState(0)

  // * body 스크롤 및 리사이즈 변경을 추적해 scroll 상태를 동기화
  useEffect(() => {
    const el = bodyScrollRef.current
    if (!el) return

    const sync = () => {
      setScrollLeft(el.scrollLeft)
      setScrollTop(el.scrollTop)
      setViewportH(el.clientHeight)
    }

    sync()

    const onScroll = () => {
      if (rafScrollRef.current !== null) return
      rafScrollRef.current = window.requestAnimationFrame(() => {
        rafScrollRef.current = null
        sync()
      })
    }

    el.addEventListener("scroll", onScroll, { passive: true })

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => sync())
      ro.observe(el)
    } else {
      window.addEventListener("resize", sync)
    }

    return () => {
      el.removeEventListener("scroll", onScroll as any)
      if (ro) ro.disconnect()
      else window.removeEventListener("resize", sync)
      if (rafScrollRef.current !== null) {
        window.cancelAnimationFrame(rafScrollRef.current)
        rafScrollRef.current = null
      }
    }
  }, [])

  // * virtualization이 enabled일 때만 가상 스크롤 옵션을 활성화
  const vOpt: VirtualizedOptions | undefined = virtualized?.enabled ? virtualized : undefined
  const rowHeight = vOpt?.rowHeight ?? 0
  const overscan = vOpt?.overscan ?? 6
  const totalRowsCount = data?.length ?? 0

  // * 스크롤/뷰포트/rowHeight 기준으로 가상 렌더 구간 및 padding 계산
  const virtualRange = useMemo(() => {
    if (!vOpt || rowHeight <= 0) return { start: 0, end: totalRowsCount, padTop: 0, padBottom: 0 }

    const start = clamp(
      Math.floor(scrollTop / rowHeight) - overscan,
      0,
      Math.max(0, totalRowsCount),
    )
    const visibleCount = Math.ceil(viewportH / rowHeight) + overscan * 2
    const end = clamp(start + visibleCount, 0, Math.max(0, totalRowsCount))
    const padTop = start * rowHeight
    const padBottom = Math.max(0, (totalRowsCount - end) * rowHeight)

    return { start, end, padTop, padBottom }
  }, [vOpt, rowHeight, overscan, scrollTop, viewportH, totalRowsCount])

  // * 가상 스크롤 사용 시 slice로 visibleRows만 추출
  const visibleRows = useMemo(() => {
    if (!vOpt) return data ?? []
    return (data ?? []).slice(virtualRange.start, virtualRange.end)
  }, [vOpt, data, virtualRange.start, virtualRange.end])

  // * 컬럼 sort 플래그/방향을 TableTh에 전달할 값으로 정규화
  const getSortValue = (colSort?: boolean, colSortDirection?: SortDirection) => {
    if (!colSort) return undefined
    return colSortDirection ?? "ASC"
  }

  // * export 요청 시 서버 작업용 ctx를 구성해 onExport로 전달
  const handleExport = (type: ExportType) => {
    if (!exportEnabled || disabled) return
    if (!onExport) return

    const baseCtx =
      exportContext && typeof exportContext === "object"
        ? (exportContext as Record<string, unknown>)
        : ({} as Record<string, unknown>)

    onExport(
      type as any,
      {
        ...baseCtx,
        page: safePage,
        rowsPerPage: safeRowsPerPage,
        keyword: String(query.keyword ?? ""),
        sort: query.sort,
        filters: query.filters,
      } as any,
    )
  }

  // * summary row 표시 여부(서버 집계 데이터가 있을 때만)
  const summaryEnabled = Boolean(summaryRow?.enabled && (summaryRow as any)?.data?.length)
  const summaryRowHeight = 32

  // * 페이지네이션 라벨 생성을 위한 from/to 계산
  const fromTo = useMemo(() => {
    if (safeTotalCount <= 0) return { from: 0, to: 0 }
    const from = (safePage - 1) * safeRowsPerPage + 1
    const to = Math.min(safeTotalCount, safePage * safeRowsPerPage)
    return { from, to }
  }, [safeTotalCount, safePage, safeRowsPerPage])

  // * Pagination에 표시할 라벨 문자열 계산
  const paginationLabel = useMemo(
    () => `${fromTo.from}–${fromTo.to} of ${safeTotalCount}`,
    [fromTo.from, fromTo.to, safeTotalCount],
  )

  // * header를 body scrollLeft에 맞춰 translateX로 동기화하기 위한 style
  const headerInnerStyle: React.CSSProperties = useMemo(
    () => ({
      transform: `translateX(${-scrollLeft}px)`,
      willChange: "transform",
    }),
    [scrollLeft],
  )

  // * 헤더 렌더러(스크롤 동기화 + sortable/resizable 헤더 구성)
  const renderHeader = () => {
    return (
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <div style={headerInnerStyle}>
          <TableHead sticky={sticky} top={"0px"}>
            {customTableHeader ?? null}
            <TableTr columns={gridColumns} disabled={disabled}>
              {(columnConfig as ColumnProps<T>[]).map((col, idx) => {
                const sortValue = getSortValue(col.sort, col.sortDirection)
                const sortEnabled = !disabled && col.sort && col.onSortChange

                return (
                  <TableTh
                    key={`${tableKey}_th_${String(col.title)}_${idx}`}
                    align={col.textAlign as any}
                    sort={sortEnabled ? sortValue : undefined}
                    onSortChange={
                      sortEnabled
                        ? (nextDirection) => col.onSortChange?.(col.key as keyof T, nextDirection)
                        : undefined
                    }
                    resizable={!disabled}
                    onResizeStart={startResize(idx)}
                    sx={{ userSelect: "none" }}
                  >
                    {col.title}
                  </TableTh>
                )
              })}

              {(rowActions?.length ?? 0) > 0
                ? rowActions!.map((a) => (
                    <TableTh
                      key={`${tableKey}_th_action_${a.key}`}
                      align="center"
                      sx={{ userSelect: "none" }}
                    >
                      {""}
                    </TableTh>
                  ))
                : null}
            </TableTr>
          </TableHead>
        </div>
      </Box>
    )
  }

  // * 바디 영역에서 데이터 행만 렌더링(가상 스크롤 padding 포함)
  const renderBodyRowsOnly = () => {
    // * 데이터가 없으면 empty row(단일 행 colSpan) 렌더링
    if ((data ?? []).length === 0) {
      return (
        <TableTr columns={gridColumns} disabled={disabled}>
          <TableTd
            colSpan={(columnConfig?.length ?? 0) + (rowActions?.length ?? 0)}
            align="center"
            disabled={disabled}
          >
            <Typography
              text={emptyRowText ?? "검색 결과가 없습니다."}
              align="center"
              sx={{ display: "inline-block" }}
            />
          </TableTd>
        </TableTr>
      )
    }

    return (
      <>
        {vOpt ? <div style={{ height: virtualRange.padTop }} /> : null}

        {(visibleRows ?? []).map((row, ri) => {
          // * virtualization 사용 시 실제 index를 보정
          const realIndex = vOpt ? virtualRange.start + ri : ri

          // * row key 후보를 순서대로 탐색(없으면 index 기반 fallback)
          const keyCandidate: any =
            (row as any)?.id ?? (row as any)?.key ?? (row as any)?._id ?? (row as any)?.rowId
          const rowKey =
            keyCandidate !== undefined && keyCandidate !== null
              ? String(keyCandidate)
              : `${tableKey}_${realIndex}`

          return (
            <TableRow
              key={`${tableKey}_row_${rowKey}`}
              columnConfig={columnConfig as any}
              data={row as any}
              index={realIndex}
              tableKey={tableKey}
              disabled={disabled}
              columns={gridColumns}
              onRowClick={onRowClick as any}
              rowActions={rowActions as any}
            />
          )
        })}

        {vOpt ? <div style={{ height: virtualRange.padBottom }} /> : null}
      </>
    )
  }

  // * 툴바 렌더 여부를 기능 플래그 기준으로 결정
  const shouldRenderToolbar =
    Boolean(toolbar?.searchEnabled) ||
    Boolean(toolbar?.filterEnabled) ||
    Boolean(toolbar?.columnVisibilityEnabled) ||
    Boolean(exportEnabled && onExport && (exportItems?.length ?? 0) > 0)

  return (
    <>
      {/* * 툴바 렌더링(검색/필터/컬럼표시/내보내기) */}
      {shouldRenderToolbar ? (
        <TableToolBar
          {...(toolbar as any)}
          disabled={disabled}
          title={toolbar?.title}
          searchValue={String(query.keyword ?? "")}
          onSearchChange={(v) => emitQuery({ keyword: v, page: 1 })}
          exportEnabled={exportEnabled}
          exportItems={exportItems as any}
          excludeExportTypes={excludeExportTypes as any}
          onExport={onExport ? (type: any, ctx: unknown) => handleExport(type) : undefined}
          exportContext={exportContext}
        />
      ) : null}

      {/* * 테이블 컨테이너 + 헤더/바디(스크롤) + summary row */}
      <TableContainer {...baseProps}>
        <Flex
          direction="column"
          height={height}
          width={"100%"}
          sx={{
            minHeight: 0,
            background: theme.colors.grayscale.white,
          }}
        >
          {renderHeader()}

          <Box
            ref={bodyScrollRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            <Box>
              {renderBodyRowsOnly()}

              {/* * summary row는 서버 집계 데이터가 있을 때만 stickyBottom으로 렌더링 */}
              {summaryEnabled ? (
                <TableSummaryRow
                  tableKey={tableKey}
                  columns={columnConfig as any}
                  rows={[] as any}
                  config={summaryRow as any}
                  disabled={disabled}
                  gridColumns={gridColumns}
                  stickyBottom
                  rowHeight={summaryRowHeight}
                />
              ) : null}
            </Box>
          </Box>
        </Flex>
      </TableContainer>

      {/* * 하단 패널( rowsPerPage / totalRows / pagination ) */}
      <Flex
        align="center"
        justify="space-between"
        mt={2}
        p={"2px 5px"}
        bgColor={theme.colors.grayscale.white}
        sx={{
          position: "relative",
          borderRadius: theme.borderRadius[4],
          border: `1px solid ${theme.colors.border.default}`,
        }}
      >
        <Flex align="center" gap={4}>
          {/* * rowsPerPage 선택 UI */}
          {rowsPer ? (
            <TableRowsPerPage
              rowsPerPage={safeRowsPerPage}
              rowsPerPageOptions={safeRowsPerPageOptions}
              onRowsPerPageChange={(rp) =>
                emitQuery({ rowsPerPage: clampRowsPerPage(rp, 200), page: 1 })
              }
              disabled={disabled}
              maxRowsPerPageLimit={200}
            />
          ) : null}

          {/* * 총 행 수 표시 */}
          {totalRows ? <TableTotalRows ml={4} totalRows={safeTotalCount} /> : null}
        </Flex>

        {/* * 페이지네이션 UI */}
        {pagination ? (
          <Pagination
            type={pagination as any}
            disabled={disabled}
            count={safeTotalCount}
            page={safePage}
            pageCount={pageCount}
            onPageChange={(p) => emitQuery({ page: p })}
            labelDisplayedRows={() => paginationLabel}
            showPrevNextButtons
            showFirstLastButtons
          />
        ) : null}
      </Flex>
    </>
  )
}

export default Table

import { useEffect, useMemo, useRef, useState } from "react"
import Badge from "../../Badge/Badge"
import Button from "../../Button/Button"
import CheckBoxGroup from "../../CheckBoxGroup/CheckBoxGroup"
import Divider from "../../Divider/Divider"
import Flex from "../../Flex/Flex"
import IconButton from "../../IconButton/IconButton"
import Popper from "../../Popper/Popper"
import Skeleton from "../../Skeleton/Skeleton"

export type ColumnVisibilityItem = {
  key: string
  title: string
  hideable?: boolean
}

export type TableColumnVisibleProps = {
  disabled?: boolean
  columnVisibilityEnabled?: boolean
  columns?: ColumnVisibilityItem[]
  visibleColumnKeys?: string[]
  defaultVisibleColumnKeys?: string[]
  onVisibleColumnKeysChange?: (keys: string[]) => void
  onHiddenColumnKeysChange?: (hiddenKeys: string[], hiddenColumns: ColumnVisibilityItem[]) => void

  columnsSkeletonEnabled?: boolean
  columnsSkeletonCount?: number
  onBeforeOpen?: () => void
}
/**---------------------------------------------------------------------------/

* ! TableColumnVisible
*
* * 테이블 컬럼 표시/숨김을 제어하는 Popper 기반 유틸 컴포넌트
* * hideable !== false 인 컬럼만 대상으로 체크박스 목록을 구성
* * 숨김 컬럼 개수(hiddenCount)를 Badge로 표시
* * 컬럼 선택 UI는 CheckBoxGroup(allCheck)로 제공하며,
*   * 개별 컬럼 토글
*   * 전체 보기/숨기기(전부 표시 ↔ 전부 숨김)
*   * 초기화(기본값으로 복원)
*   동작을 지원
*
* * 열림 상태 관리
*   * columnsOpen 내부 state로 Popper 오픈/클로즈 제어
*   * canColumnsOpen: columnVisibilityEnabled && !disabled 조건 가드
*   * toggleColumns: 열기 직전 onBeforeOpen 훅 호출 후 open 토글
*   * anchorRef가 아직 연결되지 않은 타이밍 보정용 requestAnimationFrame 재시도(useEffect)
*
* * visible keys 계산
*   * hideableColumns → allHideableKeys 추출
*   * effectiveVisibleKeys:
*     - defaultVisibleColumnKeys가 있으면 그것을 우선 fallback으로 사용
*     - visibleColumnKeys가 “length > 0”일 때만 controlled 값으로 사용
*     - 그 외 fallback(기본값 또는 전체 hideable) 적용
*
* * Skeleton 처리
*   * shouldShowColumnsSkeleton:
*     - columnVisibilityEnabled && columnsSkeletonEnabled
*     - disabled 이거나, onVisibleColumnKeysChange 미제공(비인터랙티브) 이거나,
*       columns가 비어있으면 스켈레톤 렌더링
*   * columnsSkeletonCount 만큼 체크박스 형태의 로딩 UI 구성
*
* * 숨김 컬럼 이벤트 emit
*   * emitHidden(nextVisibleKeys):
*     - nextVisibleKeys 기준으로 hiddenKeys/allHideableKeys 차집합 계산
*     - hiddenColumns를 실제 컬럼 메타데이터로 함께 전달
*   * setVisibleKeys(keys):
*     - onVisibleColumnKeysChange 콜백 호출
*     - onHiddenColumnKeysChange가 있으면 hiddenKeys/hiddenColumns 추가 emit
*
* * 액션 버튼
*   * handleToggleAllColumns:
*     - 숨김이 존재하면 전체 표시(allHideableKeys)
*     - 숨김이 없으면 전체 숨김([])
*   * handleResetColumns:
*     - defaultVisibleColumnKeys가 있으면 그 값으로
*     - 없으면 전체 표시(allHideableKeys)
*
* @module TableColumnVisible
* 테이블 컬럼의 표시/숨김 상태를 체크박스로 관리하는 컴포넌트입니다.
* - hideable 컬럼만 대상으로 동작하며, 숨김 컬럼 수를 Badge로 안내합니다.
* - 외부 상태 동기화는 onVisibleColumnKeysChange를 통해 수행하고,
*   필요 시 onHiddenColumnKeysChange로 숨김 목록/메타데이터를 함께 받을 수 있습니다.
*
* @usage
* <TableColumnVisible
*   columns={cols}
*   visibleColumnKeys={visible}
*   onVisibleColumnKeysChange={setVisible}
*   onHiddenColumnKeysChange={(hiddenKeys, hiddenCols) => ...}
* />
*
* <TableColumnVisible
*   columns={cols}
*   defaultVisibleColumnKeys={["name","age"]}
*   onVisibleColumnKeysChange={setVisible}
* />

/---------------------------------------------------------------------------**/

const TableColumnVisible = ({
  disabled,
  columnVisibilityEnabled = true,
  columns = [],
  visibleColumnKeys,
  defaultVisibleColumnKeys,
  onVisibleColumnKeysChange,

  onHiddenColumnKeysChange,

  columnsSkeletonEnabled = true,
  columnsSkeletonCount = 6,
  onBeforeOpen,
}: TableColumnVisibleProps) => {
  const [columnsOpen, setColumnsOpen] = useState(false)
  const columnsAnchorRef = useRef<HTMLButtonElement | null>(null)

  // * 컬럼 표시 기능 활성/disabled 상태에 따른 오픈 가능 여부
  const canColumnsOpen = useMemo(
    () => Boolean(columnVisibilityEnabled && !disabled),
    [columnVisibilityEnabled, disabled],
  )

  // * 외부에서 visible keys 변경 핸들러를 제공한 경우에만 인터랙션 허용
  const isColumnsInteractive = Boolean(onVisibleColumnKeysChange)

  // * hideable !== false 인 컬럼만 표시/숨김 대상에 포함
  const hideableColumns = useMemo(
    () => (columns ?? []).filter((c) => c.hideable !== false),
    [columns],
  )

  // * 숨김 가능 컬럼의 전체 key 목록
  const allHideableKeys = useMemo(() => hideableColumns.map((c) => c.key), [hideableColumns])

  // * visibleColumnKeys가 비어있어도(=전부 숨김) 유효한 값으로 취급 가능한 구조로 유지
  const effectiveVisibleKeys = useMemo(() => {
    const fallback = defaultVisibleColumnKeys?.length ? defaultVisibleColumnKeys : allHideableKeys
    return (visibleColumnKeys?.length ? visibleColumnKeys : fallback) ?? []
  }, [visibleColumnKeys, defaultVisibleColumnKeys, allHideableKeys])

  // * 데이터/핸들러 부재 또는 disabled 상태에서 스켈레톤 노출 여부 계산
  const shouldShowColumnsSkeleton = useMemo(() => {
    if (!columnVisibilityEnabled) return false
    if (!columnsSkeletonEnabled) return false
    if (disabled) return true
    return !isColumnsInteractive || (columns?.length ?? 0) === 0
  }, [
    columnVisibilityEnabled,
    columnsSkeletonEnabled,
    disabled,
    isColumnsInteractive,
    columns?.length,
  ])

  // * 숨겨진 컬럼 개수(배지 표시용) 계산
  const hiddenCount = useMemo(() => {
    if (!columnVisibilityEnabled) return 0
    if (!allHideableKeys.length) return 0
    const v = new Set(effectiveVisibleKeys)
    let count = 0
    allHideableKeys.forEach((k) => {
      if (!v.has(k)) count += 1
    })
    return count
  }, [columnVisibilityEnabled, allHideableKeys, effectiveVisibleKeys])

  // * Popper open 시 anchor ref가 늦게 세팅되는 케이스를 보정
  useEffect(() => {
    if (!columnsOpen) return
    if (columnsAnchorRef.current) return
    const id = requestAnimationFrame(() => {
      if (columnsAnchorRef.current) setColumnsOpen(true)
    })
    return () => cancelAnimationFrame(id)
  }, [columnsOpen])

  // * visible keys 변경 시 hidden keys/columns를 계산해 외부로 전달
  const emitHidden = (nextVisibleKeys: string[]) => {
    if (!onHiddenColumnKeysChange) return
    if (!allHideableKeys.length) {
      onHiddenColumnKeysChange([], [])
      return
    }

    const visibleSet = new Set(nextVisibleKeys)
    const hiddenKeys = allHideableKeys.filter((k) => !visibleSet.has(k))
    const hiddenColumns = hideableColumns.filter((c) => hiddenKeys.includes(c.key))
    onHiddenColumnKeysChange(hiddenKeys, hiddenColumns)
  }

  // * visible keys 업데이트 + hidden 결과 동기화
  const setVisibleKeys = (keys: string[]) => {
    onVisibleColumnKeysChange?.(keys)
    emitHidden(keys)
  }

  // * 전체 보기/숨기기 토글(숨김 존재 시 전체 표시, 아니면 전부 숨김)
  const handleToggleAllColumns = () => {
    if (disabled) return
    if (!isColumnsInteractive) return
    if (shouldShowColumnsSkeleton) return

    const hasHidden = allHideableKeys.some((k) => !effectiveVisibleKeys.includes(k))
    setVisibleKeys(hasHidden ? allHideableKeys : [])
  }

  // * 초기값(defaultVisibleColumnKeys 또는 allHideableKeys)으로 복구
  const handleResetColumns = () => {
    if (disabled) return
    if (!isColumnsInteractive) return
    if (shouldShowColumnsSkeleton) return

    const reset = defaultVisibleColumnKeys?.length ? defaultVisibleColumnKeys : allHideableKeys
    setVisibleKeys(reset)
  }

  // * 컬럼 팝오버 토글(열릴 때 onBeforeOpen 훅 호출)
  const toggleColumns = () => {
    if (!canColumnsOpen) return
    onBeforeOpen?.()
    setColumnsOpen((v) => !v)
  }

  // * columnVisibilityEnabled=false면 렌더링 자체를 생략
  if (!columnVisibilityEnabled) return null

  return (
    <Flex align="center" gap={6}>
      <Badge
        content={hiddenCount > 0 ? hiddenCount : undefined}
        showZero={false}
        status="info"
        placement="top-right"
      >
        <IconButton
          icon="ViewColumn"
          disabled={disabled}
          disableInteraction={false}
          toolTip="컬럼 표시"
          onClick={toggleColumns}
          ref={(node: any) => {
            columnsAnchorRef.current = node
          }}
        />
      </Badge>

      {columnsOpen && !!columnsAnchorRef.current && (
        <Popper open anchorRef={columnsAnchorRef as any} placement="bottom-end" offsetY={8}>
          <Flex direction="column">
            <Flex direction="column" gap={6} p={10} sx={{ minWidth: 280 }}>
              <Flex direction="column" gap={2} sx={{ maxHeight: 260, overflowY: "auto" }}>
                {shouldShowColumnsSkeleton ? (
                  <Flex direction="column" gap={10} p={2}>
                    {Array.from({ length: Math.max(3, columnsSkeletonCount) }).map((_, i) => (
                      <Flex key={`col_skel_${i}`} align="center" gap={10}>
                        <Skeleton variant="rectangular" width={16} height={16} />
                        <Skeleton variant="text" width="70%" />
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <CheckBoxGroup
                    direction="vertical"
                    allCheck
                    allCheckText="전체 보기/숨기기"
                    value={effectiveVisibleKeys}
                    data={hideableColumns.map((c) => ({ text: c.title, value: c.key }))}
                    onChange={(next) => {
                      if (disabled) return
                      if (!isColumnsInteractive) return
                      setVisibleKeys(next as string[])
                    }}
                    disabled={disabled || !isColumnsInteractive}
                  />
                )}
              </Flex>
            </Flex>

            <Divider direction="horizontal" thickness="1px" />

            <Flex align="center" justify="space-between" p={10}>
              <Button
                text="전체 보기/숨기기"
                variant="text"
                color="normal"
                disabled={disabled || !isColumnsInteractive || shouldShowColumnsSkeleton}
                onClick={handleToggleAllColumns}
              />
              <Button
                text="초기화"
                variant="text"
                color="secondary"
                disabled={disabled || !isColumnsInteractive || shouldShowColumnsSkeleton}
                onClick={handleResetColumns}
              />
            </Flex>
          </Flex>
        </Popper>
      )}
    </Flex>
  )
}

export default TableColumnVisible

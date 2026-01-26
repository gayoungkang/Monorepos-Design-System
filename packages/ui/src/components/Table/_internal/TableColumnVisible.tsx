import { useEffect, useMemo, useRef, useState } from "react"
import Badge from "../../Badge/Badge"
import IconButton from "../../IconButton/IconButton"
import Popper from "../../Popper/Popper"
import { Typography } from "../../Typography/Typography"
import Flex from "../../Flex/Flex"
import CheckBoxGroup from "../../CheckBoxGroup/CheckBoxGroup"
import Skeleton from "../../Skeleton/Skeleton"
import { theme } from "../../../tokens/theme"

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
 *
 * ! TableColumnVisible
 *
 * * 테이블 툴바에서 컬럼 표시/숨김(visibility)을 제어하는 팝오버 컴포넌트
 * * columnVisibilityEnabled=false 인 경우 렌더링하지 않음(null 반환)
 *
 * * 상태/참조
 *   * open: Popper 열림/닫힘 상태
 *   * anchorRef: Popper 기준이 되는 IconButton DOM 참조
 *
 * * 컬럼 대상/키 계산
 *   * hideableColumns: columns 중 hideable !== false 인 항목만 추출(숨김 가능 컬럼)
 *   * allHideableKeys: hideableColumns의 key 목록
 *   * fallbackVisible: defaultVisibleColumnKeys가 있으면 사용, 없으면 allHideableKeys로 폴백
 *   * effectiveVisibleKeys: visibleColumnKeys가 주어지면 controlled, 아니면 fallbackVisible 사용
 *   * visibleSet: effectiveVisibleKeys를 Set으로 변환하여 hidden 계산 최적화
 *   * hiddenKeys: allHideableKeys 중 visibleSet에 없는 키(=숨김 컬럼 키)
 *   * hiddenColumns: hideableColumns 중 hiddenKeys에 포함되는 컬럼 메타
 *
 * * 외부 통지(onHiddenColumnKeysChange)
 *   * hiddenKeys/hiddenColumns 변화 시 useEffect로 상위에 즉시 전달
 *   * (컨트롤드/언컨트롤드 모두에서 숨김 결과를 동기화하기 위한 훅)
 *
 * * 트리거/배지
 *   * Badge: 숨김 컬럼 개수(hiddenKeys.length)를 배지로 표시(0이면 표시 안 함)
 *   * IconButton 클릭 시 open 토글
 *   * 닫힘 → 열림 전환 시 onBeforeOpen을 1회 호출(다른 UI 정리 용도)
 *
 * * Popper 내용
 *   * placement="bottom-end"로 우측 하단 기준 배치
 *   * onClose로 외부 클릭/닫기 이벤트 처리(setOpen(false))
 *   * columnsSkeletonEnabled=true 이면 스켈레톤 목록을 렌더링(실제 체크 UI 비활성화)
 *   * columnsSkeletonEnabled=false 이면 CheckBoxGroup으로 visible 키 목록을 편집
 *     - value: effectiveVisibleKeys
 *     - onChange: 선택된 keys를 onVisibleColumnKeysChange로 상위 전달
 *
 * @module TableColumnVisible
 * 테이블 컬럼 표시/숨김을 팝오버 UI로 제공하며, 숨김 결과를 상위로 동기화합니다.
 *
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
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement | null>(null)

  // * hideable !== false 인 컬럼만 노출 대상에 포함
  const hideableColumns = useMemo(
    () => (columns ?? []).filter((c) => c.hideable !== false),
    [columns],
  )

  // * hideable 컬럼의 전체 key 목록
  const allHideableKeys = useMemo(() => hideableColumns.map((c) => c.key), [hideableColumns])

  // * visibleColumnKeys 미제공 시 기본 visible 키(fallback) 계산
  const fallbackVisible = useMemo(() => {
    if (defaultVisibleColumnKeys?.length) return defaultVisibleColumnKeys
    return allHideableKeys
  }, [defaultVisibleColumnKeys, allHideableKeys])

  // * controlled/uncontrolled visible 키 결정(=부모가 주면 그것을 우선 사용)
  const effectiveVisibleKeys = visibleColumnKeys !== undefined ? visibleColumnKeys : fallbackVisible

  // * 현재 visible 키 집합(숨김 계산에 사용)
  const visibleSet = useMemo(() => new Set(effectiveVisibleKeys ?? []), [effectiveVisibleKeys])

  // * 숨김 키/컬럼 계산
  const hiddenKeys = useMemo(
    () => allHideableKeys.filter((k) => !visibleSet.has(k)),
    [allHideableKeys, visibleSet],
  )

  const hiddenColumns = useMemo(
    () => hideableColumns.filter((c) => hiddenKeys.includes(c.key)),
    [hideableColumns, hiddenKeys],
  )

  // * 숨김 결과를 외부로 동기화
  useEffect(() => {
    onHiddenColumnKeysChange?.(hiddenKeys, hiddenColumns)
  }, [hiddenKeys, hiddenColumns, onHiddenColumnKeysChange])

  // * 컬럼 표시 기능 비활성화 시 렌더링하지 않음
  if (!columnVisibilityEnabled) return null

  const hiddenCount = hiddenKeys.length

  // * 팝오버 토글 핸들러(열기 직전 onBeforeOpen 실행)
  const handleToggle = () => {
    if (disabled) return
    if (!open) onBeforeOpen?.()
    setOpen((v) => !v)
  }

  // * 팝오버 닫기 핸들러
  const handleClose = () => setOpen(false)

  // * visible 키 변경 핸들러(그룹 체크박스)
  const handleVisibleKeysChange = (keys: unknown) => {
    onVisibleColumnKeysChange?.(keys as string[])
  }

  return (
    <Flex align="center" gap={6}>
      <Badge
        content={hiddenCount > 0 ? hiddenCount : undefined}
        showZero={false}
        status="info"
        placement="top-right"
      >
        <IconButton
          ref={anchorRef as any}
          icon="ViewColumn"
          disabled={disabled}
          disableInteraction={false}
          toolTip="컬럼 표시"
          onClick={handleToggle}
        />
      </Badge>

      <Popper
        anchorRef={anchorRef}
        open={open}
        placement="bottom-end"
        onClose={handleClose}
        width="auto"
        height="360px"
      >
        <Flex
          direction="column"
          gap={10}
          p={12}
          sx={{ width: 280, background: theme.colors.grayscale.white }}
        >
          <Typography variant="b1Bold" text="표시할 컬럼 선택" />

          {/* * columnsSkeletonEnabled=true면 skeleton을 표시하고, false면 실제 체크박스 UI 렌더 */}
          {columnsSkeletonEnabled ? (
            <Flex direction="column" gap={8}>
              {Array.from({ length: columnsSkeletonCount }).map((_, i) => (
                <Skeleton key={`col_vis_skel_${i}`} height={18} />
              ))}
            </Flex>
          ) : (
            <CheckBoxGroup
              direction="vertical"
              value={effectiveVisibleKeys ?? []}
              data={hideableColumns.map((c) => ({ text: c.title, value: c.key }))}
              disabled={disabled}
              onChange={handleVisibleKeysChange}
            />
          )}
        </Flex>
      </Popper>
    </Flex>
  )
}

export default TableColumnVisible

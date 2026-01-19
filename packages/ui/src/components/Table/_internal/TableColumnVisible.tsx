import { useEffect, useMemo, useRef, useState } from "react"
import Badge from "../../Badge/Badge"
import Button from "../../Button/Button"
import CheckBoxGroup from "../../CheckBoxGroup/CheckBoxGroup"
import Divider from "../../Divider/Divider"
import Flex from "../../Flex/Flex"
import IconButton from "../../IconButton/IconButton"
import Popper from "../../Popper/Popper"
import Skeleton from "../../Skeleton/Skeleton"
import { styled } from "../../../tokens/customStyled"
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
  columnsSkeletonEnabled?: boolean
  columnsSkeletonCount?: number
  onBeforeOpen?: () => void
}

const TableColumnVisible = ({
  disabled,
  columnVisibilityEnabled = true,
  columns = [],
  visibleColumnKeys,
  defaultVisibleColumnKeys,
  onVisibleColumnKeysChange,
  columnsSkeletonEnabled = true,
  columnsSkeletonCount = 6,
  onBeforeOpen,
}: TableColumnVisibleProps) => {
  const [columnsOpen, setColumnsOpen] = useState(false)
  const columnsAnchorRef = useRef<HTMLButtonElement | null>(null)

  const canColumnsOpen = useMemo(
    () => Boolean(columnVisibilityEnabled && !disabled),
    [columnVisibilityEnabled, disabled],
  )

  const isColumnsInteractive = Boolean(onVisibleColumnKeysChange)

  const hideableColumns = useMemo(
    () => (columns ?? []).filter((c) => c.hideable !== false),
    [columns],
  )

  const allHideableKeys = useMemo(() => hideableColumns.map((c) => c.key), [hideableColumns])

  const effectiveVisibleKeys = useMemo(() => {
    const fallback = defaultVisibleColumnKeys?.length ? defaultVisibleColumnKeys : allHideableKeys
    return (visibleColumnKeys?.length ? visibleColumnKeys : fallback) ?? []
  }, [visibleColumnKeys, defaultVisibleColumnKeys, allHideableKeys])

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

  useEffect(() => {
    if (!columnsOpen) return
    if (columnsAnchorRef.current) return
    const id = requestAnimationFrame(() => {
      if (columnsAnchorRef.current) setColumnsOpen(true)
    })
    return () => cancelAnimationFrame(id)
  }, [columnsOpen])

  const setVisibleKeys = (keys: string[]) => {
    onVisibleColumnKeysChange?.(keys)
  }

  const handleToggleAllColumns = () => {
    if (disabled) return
    if (!isColumnsInteractive) return
    if (shouldShowColumnsSkeleton) return

    const hasHidden = allHideableKeys.some((k) => !effectiveVisibleKeys.includes(k))
    setVisibleKeys(hasHidden ? allHideableKeys : [])
  }

  const handleResetColumns = () => {
    if (disabled) return
    if (!isColumnsInteractive) return
    if (shouldShowColumnsSkeleton) return

    const reset = defaultVisibleColumnKeys?.length ? defaultVisibleColumnKeys : allHideableKeys
    setVisibleKeys(reset)
  }

  const toggleColumns = () => {
    if (!canColumnsOpen) return
    onBeforeOpen?.()
    setColumnsOpen((v) => !v)
  }

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
                color="secondary"
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

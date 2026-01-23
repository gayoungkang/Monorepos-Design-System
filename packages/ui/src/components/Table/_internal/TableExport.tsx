// _internal/TableExport.tsx
import { useMemo, useRef, useState } from "react"
import IconButton from "../../IconButton/IconButton"
import Popper from "../../Popper/Popper"
import Flex from "../../Flex/Flex"
import { Typography } from "../../Typography/Typography"
import Button from "../../Button/Button"
import { theme } from "../../../tokens/theme"

export type DefaultExportType = "excel" | "csv" | "pdf" | "print"
export type ExportType<TExtraExportType extends string = never> =
  | DefaultExportType
  | TExtraExportType

export type ExportItem<T extends string> = {
  type: T
  label: string
  icon?: string
}

export type TableExportProps<TExtraExportType extends string = never> = {
  disabled?: boolean
  exportEnabled?: boolean
  exportItems?: ExportItem<ExportType<TExtraExportType>>[]
  excludeExportTypes?: ExportType<TExtraExportType>[]
  onExport?: (type: ExportType<TExtraExportType>) => void
  onBeforeOpen?: () => void
}

const TableExport = <TExtraExportType extends string = never>({
  disabled,
  exportEnabled = true,
  exportItems,
  excludeExportTypes,
  onExport,
  onBeforeOpen,
}: TableExportProps<TExtraExportType>) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement | null>(null)

  const filteredItems = useMemo(() => {
    const items = exportItems ?? []
    if (!excludeExportTypes?.length) return items
    const ex = new Set(excludeExportTypes)
    return items.filter((it) => !ex.has(it.type as any))
  }, [exportItems, excludeExportTypes])

  if (!exportEnabled) return null
  if (!onExport) return null
  if (!filteredItems.length) return null

  const toggle = () => {
    if (disabled) return
    if (!open) onBeforeOpen?.()
    setOpen((v) => !v)
  }

  const handleExport = (type: ExportType<TExtraExportType>) => {
    if (disabled) return
    onExport?.(type)
    setOpen(false)
  }

  return (
    <Flex align="center" gap={6}>
      <IconButton
        ref={anchorRef as any}
        icon="Download"
        disabled={disabled}
        disableInteraction={false}
        toolTip="내보내기"
        onClick={toggle}
      />

      <Popper anchorRef={anchorRef} open={open} placement="bottom-end" width="auto" height="340px">
        <Flex
          direction="column"
          gap={10}
          p={12}
          sx={{ width: 220, background: theme.colors.grayscale.white }}
        >
          <Typography variant="b1Bold" text="내보내기" />

          <Flex direction="column" gap={8}>
            {filteredItems.map((it) => (
              <Button
                key={`export_${String(it.type)}`}
                text={it.label}
                variant="text"
                color="normal"
                onClick={() => handleExport(it.type)}
                sx={{ justifyContent: "flex-start", padding: "8px 10px" }}
              />
            ))}
          </Flex>
        </Flex>
      </Popper>
    </Flex>
  )
}

export default TableExport

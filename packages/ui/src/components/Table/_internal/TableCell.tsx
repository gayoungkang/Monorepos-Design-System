// _internal/TableCell.tsx
import { JSX, ReactNode, useMemo, useRef, useState } from "react"
import { Typography } from "../../Typography/Typography"
import type { ColumnProps } from "../@Types/table"
import { theme } from "../../../tokens/theme"
import { Tooltip } from "../../Tooltip/Tooltip"

type OverflowTooltipTextProps = {
  text: string
  disabled?: boolean
}

const OverflowTooltipText = ({ text, disabled }: OverflowTooltipTextProps): JSX.Element => {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [open, setOpen] = useState(false)

  const onEnter = () => {
    const el = ref.current
    if (!el) return
    const isOverflow = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1
    setOpen(isOverflow)
  }

  const onLeave = () => setOpen(false)

  const content = (
    <Typography
      variant="b1Regular"
      text={text}
      color={disabled ? theme.colors.text.disabled : theme.colors.text.primary}
      sx={{ display: "inline-block", minWidth: 0, maxWidth: "100%" }}
    />
  )

  return (
    <span
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ display: "inline-block", minWidth: 0, maxWidth: "100%" }}
    >
      {open ? <Tooltip content={text}>{content}</Tooltip> : content}
    </span>
  )
}

export const renderDisabledCell = (value: any): JSX.Element => {
  const txt = value === undefined || value === null || value === "" ? "-" : String(value)
  return <OverflowTooltipText text={txt} disabled />
}

export const renderCell = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
  data: T,
  index: number,
  disabled?: boolean,
): JSX.Element => {
  const rowIndex = Number.isFinite(index) ? index : 0
  const isDisabled = Boolean(disabled)

  const custom = column.render?.(data, rowIndex, { disabled: isDisabled }) as ReactNode
  if (custom !== undefined && custom !== null) {
    return <>{custom}</>
  }

  const raw = (data as any)?.[column.key as any]
  const text = raw === undefined || raw === null || raw === "" ? "-" : String(raw)

  if (isDisabled) return renderDisabledCell(text)

  return <OverflowTooltipText text={text} disabled={false} />
}

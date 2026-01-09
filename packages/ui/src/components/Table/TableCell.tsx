import { ReactNode } from "react"
import { ColumnProps } from "./@Types/table"
import Button from "../Button/Button"
import TextField from "../TextField/TextField"
import { CheckBox } from "../CheckBoxGroup/CheckBoxGroup"
import Link from "../Link/Link"

export const renderCell = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
  d: T,
  rowIndex?: number,
): ReactNode => {
  const key = column.key
  const value = d[key]
  const safeRowIndex = rowIndex ?? 0
  let checked = false

  if (column.type === "CheckBox") {
    checked = d[key] as boolean
  }

  if (column.renderCustomCell) {
    return column.renderCustomCell(d)
  }

  switch (column.type) {
    case "Button":
      return <Button text={column.title} />

    case "TextField":
      return (
        <TextField
          value={typeof value === "string" ? value : ""}
          onChange={(event) =>
            column.onChange?.({
              rowIndex: safeRowIndex,
              type: "TextField",
              changeValue: event.target.value,
              key,
            })
          }
        />
      )

    case "CheckBox":
      return (
        <CheckBox
          checked={checked}
          onChange={(next: boolean) =>
            column.onChange?.({
              rowIndex: safeRowIndex,
              type: "CheckBox",
              changeValue: next,
              key,
            })
          }
        />
      )
  }

  if (key === "custom" && column.onClick) {
    return (
      <Link
        disabled={typeof column.disabled === "function" ? column.disabled(d) : column.disabled}
        children={column.renderCellTitle ? column.renderCellTitle : column.title}
        onClick={() => {
          column.onClick?.(d, safeRowIndex)
        }}
      />
    )
  }

  return <>{(value as ReactNode) || "-"}</>
}

export const renderDisabledCell = <T extends Record<string, unknown>>(
  column: ColumnProps<T>,
): ReactNode => {
  switch (column.type) {
    case "Button":
      return <Button text={column.title} disabled />
    case "TextField":
      return <TextField disabled />
    case "CheckBox":
      return <CheckBox disabled />
    default:
      return ""
  }
}

// _internal/TableRowsPerPage.tsx
import { HTMLAttributes, ReactNode, useMemo } from "react"
import { BaseMixinProps } from "../../../tokens/baseMixin"
import { theme } from "../../../tokens/theme"
import Flex from "../../Flex/Flex"
import { Typography } from "../../Typography/Typography"
import Select from "../../Select/Select"

export type TableRowsPerPageProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    rowsPerPage: number
    rowsPerPageOptions?: number[]
    onRowsPerPageChange?: (rowsPerPage: number) => void
    label?: ReactNode
    disabled?: boolean
    maxRowsPerPageLimit?: number
  }

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

const TableRowsPerPage = ({
  rowsPerPage,
  rowsPerPageOptions = [10, 25, 50, 100],
  onRowsPerPageChange,
  label = "페이지당 행 수:",
  disabled,
  maxRowsPerPageLimit = 200,
  ...baseProps
}: TableRowsPerPageProps) => {
  const safeLimit = Math.max(1, maxRowsPerPageLimit)

  const safeOptions = useMemo(() => {
    const out = rowsPerPageOptions
      .filter((n) => Number.isFinite(n) && n > 0 && n <= safeLimit)
      .map((n) => Math.floor(n))
    return out.length ? out : [Math.min(100, safeLimit)]
  }, [rowsPerPageOptions, safeLimit])

  const safeRowsPerPage = clamp(Math.max(1, rowsPerPage), 1, safeLimit)

  const options = useMemo(
    () =>
      safeOptions.map((n) => ({
        value: String(n),
        label: String(n),
      })),
    [safeOptions],
  )

  const handleChange = (v: string | undefined) => {
    if (disabled) return
    const next = Number(v ?? safeRowsPerPage)
    if (Number.isNaN(next)) return
    onRowsPerPageChange?.(clamp(Math.max(1, next), 1, safeLimit))
  }

  return (
    <Flex align="center" gap={12} width="fit-content" {...baseProps}>
      {typeof label === "string" ? (
        <Typography variant="b1Medium" color={theme.colors.text.primary} text={label} />
      ) : (
        label
      )}

      <Select
        size="S"
        width={60}
        options={options as any}
        value={String(safeRowsPerPage)}
        disabled={disabled}
        readOnly={disabled}
        onChange={handleChange as any}
        typographyProps={{ sx: { lineHeight: "inherit" } }}
      />
    </Flex>
  )
}

export default TableRowsPerPage

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
  }
/**---------------------------------------------------------------------------/
 *
 * ! TableRowsPerPage
 *
 * * 테이블 페이지네이션에서 "페이지당 행 수(rowsPerPage)" 선택 UI를 제공하는 컴포넌트
 * * rowsPerPageOptions를 Select가 요구하는 options(value/label) 형태로 변환하여 표시
 * * label은 문자열이면 Typography로 렌더링, ReactNode면 그대로 렌더링
 * * disabled=true 인 경우 Select를 disabled + readOnly로 고정하여 상호작용을 차단
 * * 값 변경 시 onRowsPerPageChange로 숫자(rowsPerPage)를 상위로 전달
 *
 * * 데이터 변환
 *   * options: rowsPerPageOptions(number[]) → { value: string; label: string }[] (useMemo 캐시)
 *   * value: rowsPerPage(number) → String(rowsPerPage)로 Select에 전달
 *   * onChange: Select value(string) → Number(v)로 변환 후 콜백 호출
 *
 * * 레이아웃
 *   * Flex(align=center, gap=12, width=fit-content)로 라벨/셀렉트 정렬
 *   * Select는 size="S", width=60 고정, typographyProps로 lineHeight 상속
 *
 * @module TableRowsPerPage
 * 페이지당 표시할 행 수를 선택하는 Select UI를 제공합니다.
 * - 옵션은 rowsPerPageOptions로 받고, 변경 값은 onRowsPerPageChange로 전달합니다.
 *
 * @usage
 * <TableRowsPerPage
 *   rowsPerPage={10}
 *   rowsPerPageOptions={[10, 25, 50]}
 *   onRowsPerPageChange={(n) => setRowsPerPage(n)}
 * />
 *
 * <TableRowsPerPage disabled rowsPerPage={25} />
 *
/---------------------------------------------------------------------------**/

const TableRowsPerPage = ({
  rowsPerPage,
  rowsPerPageOptions = [10, 25, 50, 100],
  onRowsPerPageChange,
  label = "페이지당 행 수:",
  disabled,
  ...baseProps
}: TableRowsPerPageProps) => {
  // * rowsPerPageOptions를 Select 옵션(value/label) 형태로 변환
  const options = useMemo(
    () =>
      rowsPerPageOptions.map((n) => ({
        value: String(n),
        label: String(n),
      })),
    [rowsPerPageOptions],
  )

  // * disabled 상태에서는 value 변경을 막고, Select 내부 로직에서 string | undefined가 나와도 안전하게 처리
  const handleChange = (v: string | undefined) => {
    if (disabled) return
    const next = Number(v ?? rowsPerPage)
    if (Number.isNaN(next)) return
    onRowsPerPageChange?.(next)
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
        value={String(rowsPerPage)}
        disabled={disabled}
        readOnly={disabled}
        onChange={handleChange as any}
        typographyProps={{ sx: { lineHeight: "inherit" } }}
      />
    </Flex>
  )
}

export default TableRowsPerPage

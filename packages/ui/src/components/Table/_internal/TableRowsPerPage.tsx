import { HTMLAttributes, ReactNode, useMemo } from "react"
import { BaseMixinProps } from "../../../tokens/baseMixin"
import { theme } from "../../../tokens/theme"
import Flex from "../../Flex/Flex"
import { Typography } from "../../Typography/Typography"
import Select from "../../Select/Select"
import { clamp } from "../@utils/table"

export type TableRowsPerPageProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    rowsPerPage: number
    rowsPerPageOptions?: number[]
    onRowsPerPageChange?: (rowsPerPage: number) => void
    label?: ReactNode
    disabled?: boolean
    maxRowsPerPageLimit?: number
  }
/**---------------------------------------------------------------------------/
 *
 * ! TableRowsPerPage
 *
 * * 테이블 페이지네이션에서 "페이지당 행 수" 선택 UI를 제공하는 컴포넌트
 * * rowsPerPage / onRowsPerPageChange 기반으로 rowsPerPage 값을 상위로 전달
 * * rowsPerPageOptions를 안전하게 정제(safeOptions)하여 Select 옵션으로 변환
 * * maxRowsPerPageLimit로 운영 상한을 강제하여 대규모 렌더링/가상화 가드레일을 제공
 *
 * * 값/옵션 안전 처리
 *   * safeLimit: maxRowsPerPageLimit를 최소 1 이상으로 보정
 *   * safeOptions:
 *     * rowsPerPageOptions 중 유효 숫자(>0)이며 safeLimit 이하만 필터링
 *     * 각 값은 Math.floor로 정수화
 *     * 유효 옵션이 없으면 fallback으로 [min(100, safeLimit)] 제공
 *   * safeRowsPerPage:
 *     * rowsPerPage 입력값을 1~safeLimit 범위로 clamp하여 표시값으로 사용
 *
 * * 변경 처리(handleChange)
 *   * disabled=true면 변경 차단
 *   * Select에서 받은 문자열을 숫자로 변환 후 NaN 방지
 *   * 최종 값은 1~safeLimit 범위로 clamp하여 onRowsPerPageChange에 전달
 *
 * * 렌더링
 *   * label이 string이면 Typography로 렌더, ReactNode면 그대로 렌더
 *   * Select는 disabled/readOnly를 함께 적용하여 비활성 UX를 일관되게 유지
 *
 * @module TableRowsPerPage
 * 페이지당 행 수 선택 UI를 제공하며, 옵션/선택값을 상한(maxRowsPerPageLimit) 내로 정제해 전달합니다.
 *
 * @usage
 * <TableRowsPerPage
 *   rowsPerPage={rowsPerPage}
 *   rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
 *   maxRowsPerPageLimit={200}
 *   onRowsPerPageChange={setRowsPerPage}
 * />
 *
 * <TableRowsPerPage disabled rowsPerPage={25} onRowsPerPageChange={() => {}} />
 *
/---------------------------------------------------------------------------**/

const TableRowsPerPage = ({
  rowsPerPage,
  rowsPerPageOptions = [10, 25, 50, 100],
  onRowsPerPageChange,
  label = "페이지당 행 수:",
  disabled,
  maxRowsPerPageLimit = 200,
  ...baseProps
}: TableRowsPerPageProps) => {
  // * rowsPerPage 상한을 1 이상으로 정규화(대규모 처리 가드레일)
  const safeLimit = Math.max(1, maxRowsPerPageLimit)

  // * 옵션을 limit 범위로 필터링/정규화하고, 비어있으면 fallback 옵션을 보장
  const safeOptions = useMemo(() => {
    const out = rowsPerPageOptions
      .filter((n) => Number.isFinite(n) && n > 0 && n <= safeLimit)
      .map((n) => Math.floor(n))
    return out.length ? out : [Math.min(100, safeLimit)]
  }, [rowsPerPageOptions, safeLimit])

  // * 현재 rowsPerPage 값을 limit 범위 내로 고정
  const safeRowsPerPage = clamp(Math.max(1, rowsPerPage), 1, safeLimit)

  // * Select 옵션(value/label) 형태로 변환
  const options = useMemo(
    () =>
      safeOptions.map((n) => ({
        value: String(n),
        label: String(n),
      })),
    [safeOptions],
  )

  // * Select 변경값을 number로 변환 후 clamp 적용하여 콜백 전달
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

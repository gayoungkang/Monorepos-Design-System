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

* ! TableRowsPerPage
*
* * 테이블 페이지네이션에서 페이지당 행 수 선택 UI를 제공하는 컴포넌트
* * rowsPerPage 값과 rowsPerPageOptions 기반 Select 옵션 구성
* * Select 변경 시 onRowsPerPageChange 콜백으로 숫자 값 전달
* * label은 문자열 또는 ReactNode 모두 지원
* * disabled 상태 시 Select 비활성화 및 readOnly 처리
* * Flex 레이아웃을 사용해 라벨과 Select 정렬
* * BaseMixinProps를 통해 외부 스타일 확장 지원
*
* @module TableRowsPerPage
* 테이블 상/하단에서 페이지당 표시할 행 수를 제어하는 UI 컴포넌트입니다.
* - rowsPerPageOptions가 없으면 기본값 [10, 25, 50, 100]을 사용합니다.
* - disabled가 true일 경우 사용자 변경을 차단합니다.
*
* @usage
* <TableRowsPerPage rowsPerPage={10} onRowsPerPageChange={setRows} />
* <TableRowsPerPage rowsPerPage={25} disabled />

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
        onChange={(v) => onRowsPerPageChange?.(Number(v))}
        typographyProps={{ sx: { lineHeight: "inherit" } }}
      />
    </Flex>
  )
}

export default TableRowsPerPage

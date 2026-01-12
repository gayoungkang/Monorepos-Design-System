import { ReactNode } from "react"
import { styled } from "../../tokens/customStyled"
import { BaseMixinProps } from "../../tokens/baseMixin"

export type TableTrProps<T> = BaseMixinProps & {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void
  onDoubleClick?: (row: T | null) => void
  selected?: boolean
  disabled?: boolean
  rowData?: T | null
}
/**---------------------------------------------------------------------------/

* ! TableTr
*
* * 테이블 행(<tr>)을 담당하는 컴포넌트
* * 단일 행 단위 클릭(onClick) 및 더블클릭(onDoubleClick) 이벤트 지원
* * disabled 상태일 경우 클릭/더블클릭 인터랙션 차단
* * selected 상태에 따라 hover 커서 및 배경 스타일 분기 처리
* * rowData를 함께 전달하여 더블클릭 시 해당 행 데이터 전달 지원
* * BaseMixinProps를 통해 외부 스타일 확장 지원
*
* @module TableTr
* 테이블의 단일 행을 렌더링하며, 선택 상태 및 사용자 인터랙션을 처리합니다.
* - 클릭 이벤트는 disabled가 아닐 때만 전달됩니다.
* - 더블클릭 이벤트는 rowData를 함께 전달하여 상위 로직에서 활용할 수 있습니다.
* - selected 상태에서는 hover 시 강조 배경 스타일을 적용합니다.
*
* @usage
* <TableTr selected onClick={...}>...</TableTr>
* <TableTr onDoubleClick={(row) => ...} rowData={data} />

/---------------------------------------------------------------------------**/

const TableTr = <T,>({
  onClick,
  onDoubleClick,
  children,
  selected,
  disabled,
  rowData = null,
  ...others
}: TableTrProps<T>) => {
  // * disabled 상태를 우선 적용하여 더블클릭 콜백을 rowData로 호출
  const handleDoubleClick = () => {
    if (disabled) return
    onDoubleClick?.(rowData)
  }

  // * disabled 상태를 우선 적용하여 클릭 이벤트를 전달
  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (disabled) return
    onClick?.(e)
  }

  return (
    <StyledTableTr
      selected={selected}
      disabled={disabled}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      {...others}
    >
      {children}
    </StyledTableTr>
  )
}

const StyledTableTr = styled.tr<{
  selected?: boolean
  disabled?: boolean
}>`
  display: table-row;
  word-wrap: break-word;
  white-space: pre-wrap;
  border-radius: 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  border-left: 1px solid ${({ theme }) => theme.colors.border.default};
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};

  &:hover {
    cursor: ${({ selected, disabled }) =>
      disabled ? "not-allowed" : selected ? "pointer" : "default"};
    background-color: ${({ selected, theme, disabled }) =>
      disabled ? "transparent" : selected ? theme.colors.primary[50] : "transparent"};
  }
`

export default TableTr

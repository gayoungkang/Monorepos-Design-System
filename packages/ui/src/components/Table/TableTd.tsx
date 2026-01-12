import { CSSProperties, ReactNode, forwardRef } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { Typography } from "../Typography/Typography"

export type TableTdProps = BaseMixinProps & {
  children?: ReactNode
  clickable?: boolean
  onClick?: (e: React.MouseEvent<HTMLTableCellElement>) => void
  align?: CSSProperties["textAlign"]
  colSpan?: number
  selected?: boolean
  disabled?: boolean
}
/**---------------------------------------------------------------------------/

* ! TableTd
*
* * 테이블 바디 셀(<td>)을 담당하는 컴포넌트
* * forwardRef를 통해 td DOM ref 전달 지원
* * 문자열 children 전달 시 Typography로 자동 래핑 렌더링
* * clickable 옵션에 따라 포인터 커서 및 underline 스타일 적용
* * align(textAlign) 옵션으로 셀 텍스트 정렬 제어
* * colSpan 지원으로 셀 병합 가능
* * selected 상태일 때 선택 배경 및 테두리 스타일 적용
* * disabled 상태 전달 지원 (상위 로직에서 인터랙션 차단용)
* * BaseMixinProps를 통해 외부 스타일 확장 지원
*
* @module TableTd
* 테이블의 개별 데이터 셀을 렌더링하는 컴포넌트입니다.
* - 셀 클릭(onClick) 인터랙션과 행 선택 UI를 함께 표현할 수 있습니다.
* - 문자열 콘텐츠는 Typography로 렌더링되어 텍스트 스타일 일관성을 유지합니다.
* - 선택 상태(selected)에서는 행 강조 스타일을 적용합니다.
*
* @usage
* <TableTd>Text</TableTd>
* <TableTd clickable onClick={...}>Link</TableTd>
* <TableTd align="right" colSpan={2} />

/---------------------------------------------------------------------------**/

const TableTd = forwardRef<HTMLTableCellElement, TableTdProps>(
  ({ children, clickable, onClick, align, colSpan, selected, disabled, ...others }, ref) => {
    // * td 셀을 렌더링하고, string children은 Typography로 래핑
    return (
      <StyledTableCell
        ref={ref}
        clickable={clickable}
        align={align}
        onClick={onClick}
        colSpan={colSpan}
        selected={selected}
        disabled={disabled}
        {...others}
      >
        {typeof children === "string" ? (
          <Typography text={children} sx={{ display: "inline-block" }} />
        ) : (
          children
        )}
      </StyledTableCell>
    )
  },
)

const StyledTableCell = styled.td<{
  clickable?: boolean
  selected?: boolean
  align?: CSSProperties["textAlign"]
  disabled?: boolean
}>`
  height: 30px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: 0px 8px;
  text-align: ${({ align }) => align ?? "center"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.2s ease-in-out;

  ${({ clickable }) =>
    clickable &&
    `
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  `}

  ${({ selected, theme }) =>
    selected &&
    `
    cursor: pointer;
    background-color: ${theme.colors.primary[100]};
    border: 1px solid ${theme.colors.border.default};
    border-right: 1px solid ${theme.colors.grayscale[500]};
    &:first-child {
      border-left: 1px solid ${theme.colors.border.default};
    }
    &:last-child {
      border-right: 1px solid ${theme.colors.border.default};
    }
  `}
`

TableTd.displayName = "TableTd"

export default TableTd

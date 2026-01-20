import { CSSProperties, ReactNode } from "react"
import { SortDirection } from "../@Types/table"
import { BaseMixin, BaseMixinProps } from "../../../tokens/baseMixin"
import Flex from "../../Flex/Flex"
import { Typography } from "../../Typography/Typography"
import IconButton from "../../IconButton/IconButton"
import { styled } from "../../../tokens/customStyled"

export type TableThProps = BaseMixinProps & {
  children: ReactNode
  align?: CSSProperties["textAlign"]
  sort?: SortDirection
  onSortChange?: (direction: SortDirection) => void
  resizable?: boolean
  onResizeStart?: (e: React.MouseEvent<HTMLDivElement>) => void
}

// * 현재 sort 상태를 기준으로 다음 정렬 방향을 토글(ASC <-> DESC)
const getNextSortDirection = (current?: SortDirection): SortDirection => {
  if (current === "ASC") return "DESC"
  return "ASC"
}
/**---------------------------------------------------------------------------/
 *
 * ! TableTh
 *
 * * Grid 기반 Table 헤더 셀(Header Cell)을 표현하는 컴포넌트
 * * BaseMixinProps를 확장하여 padding, margin, width, sx 등 공통 스타일 속성 지원
 *
 * * 정렬(Sort) 기능
 *   * sort 값이 존재하는 경우 정렬 아이콘(ArrowDown) 표시
 *   * 현재 정렬 상태에 따라 아이콘 회전 및 opacity로 시각적 상태 표현
 *   * 헤더 클릭 시 ASC ↔ DESC 토글(getNextSortDirection)
 *   * 정렬 변경은 onSortChange 콜백으로 상위에 위임
 *
 * * 정렬 기준 텍스트 렌더링
 *   * children이 문자열인 경우 Typography + ellipsis 처리
 *   * Flex + minWidth:0 조합으로 컬럼 폭 축소 시 말줄임 안정 처리
 *
 * * 컬럼 리사이즈 지원
 *   * resizable=true 인 경우 우측 ResizeHandle 렌더링
 *   * ResizeHandle은 absolute 포지션으로 헤더 우측에 오버레이
 *   * onResizeStart를 통해 마우스 드래그 시작 시점만 상위로 위임
 *   * 실제 컬럼 width 계산/적용 로직은 외부(Grid/Table)에서 처리
 *
 * * 레이아웃 구조
 *   * Root: position: relative 기반 컨테이너
 *   * 내부는 Flex 정렬, 우측 border 기본 적용
 *   * 마지막 헤더 셀은 border 제거
 *
 * @module TableTh
 * Grid 기반 테이블에서 컬럼 헤더를 표현하며,
 * 정렬(sort)과 컬럼 리사이즈(resize) 인터랙션을 함께 제공합니다.
 *
/---------------------------------------------------------------------------**/

const TableTh = ({
  children,
  align = "center",
  sort,
  onSortChange,
  resizable,
  onResizeStart,
  ...others
}: TableThProps) => {
  // * 정렬 아이콘 클릭 시 다음 방향으로 토글 후 onSortChange 호출
  const handleSortClick = () => {
    if (!sort) return
    const next = getNextSortDirection(sort)
    onSortChange?.(next)
  }

  return (
    <Root align={align} {...others}>
      <Flex align="center" justify={align as any} gap={4} sx={{ minWidth: 0 }}>
        {typeof children === "string" ? (
          <Typography ellipsis text={children} sx={{ display: "inline-block", minWidth: 0 }} />
        ) : (
          children
        )}

        {sort && (
          <IconButton
            icon="ArrowDown"
            onClick={handleSortClick}
            disableInteraction={false}
            sx={{
              opacity: sort === "ASC" ? 1 : 0.3,
              transform: sort === "ASC" ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s ease, opacity 0.15s ease",
            }}
          />
        )}
      </Flex>

      {/* * 컬럼 리사이즈 활성화 시 드래그 핸들 노출 */}
      {resizable && <ResizeHandle onMouseDown={onResizeStart} />}
    </Root>
  )
}

const Root = styled.div<BaseMixinProps & { align?: string }>`
  ${BaseMixin};
  position: relative;
  height: 36px;
  display: flex;
  align-items: center;
  text-align: ${({ align }) => align || "center"};
  padding: 4px 6px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};
  min-width: 0;

  &:last-child {
    border-right: none;
  }
`

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 5;

  &:hover {
    background-color: ${({ theme }) => theme.colors.grayscale[200]};
  }
`

export default TableTh

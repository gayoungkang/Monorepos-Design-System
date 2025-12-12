import { theme } from "../../tokens/theme"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { DirectionType } from "../../types"
import { styled } from "../../tokens/customStyled"

export type DividerProps = BaseMixinProps & {
  direction?: DirectionType
  thickness?: string
  color?: string
  flexItem?: boolean
}
/**
 * @module Divider
 * 구분선(구분기능)을 제공하는 컴포넌트로, 수평(horizontal) 및 수직(vertical) 구분선을 지원합니다.
 * - `horizontal` 또는 `vertical` 옵션으로 구분선의 방향 지정
 * - 구분선의 두께(`thickness`) 및 색상(`color`)을 설정 가능
 * - `flexItem`이 true일 경우, flex 컨테이너 내에서 구분선이 stretch 처리되어 컨테이너의 크기에 맞춰짐
 *
 * @props
 * - direction : 구분선의 방향 (horizontal, vertical)
 * - thickness : 구분선의 두께 (기본값: "1px")
 * - color : 구분선 색상 (기본값: `theme.colors.border.thick`)
 * - flexItem : flex 컨테이너 내에서 구분선이 stretch 될지 여부 (기본값: false)
 *
 * @상세설명
 * - `direction`을 통해 구분선의 방향을 수평(horizontal) 또는 수직(vertical)으로 설정할 수 있습니다.
 * - `thickness`는 구분선의 두께를 지정하며, `color`는 구분선의 색상을 변경할 수 있습니다.
 * - `flexItem`을 활성화하면 flexbox 환경에서 구분선이 flex 항목으로 취급되어 크기가 자동으로 조정됩니다.
 *
 * @사용법
 * <Divider direction="horizontal" thickness="2px" color="gray" />
 * <Divider direction="vertical" thickness="2px" color="gray" flexItem />
 *
 */

const Divider = ({
  direction = "horizontal",
  thickness = "1px",
  color = theme.colors.border.thick,
  flexItem = false,
  ...others
}: DividerProps) => {
  return (
    <StyledDivider
      direction={direction}
      thickness={thickness}
      color={color}
      flexItem={flexItem}
      {...others}
    />
  )
}

const StyledDivider = styled.div<DividerProps>`
  ${BaseMixin}
  background-color: ${({ color }) => color};

  ${({ direction, thickness, height }) =>
    direction === "horizontal"
      ? `
        width: 100%;
        height: ${thickness};
      `
      : `
        width: ${thickness};
        height: ${height || "auto"};
      `}

  ${({ flexItem }) => flexItem && "align-self: stretch;"}
`

export default Divider

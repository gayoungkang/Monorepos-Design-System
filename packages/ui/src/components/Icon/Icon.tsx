import { forwardRef } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { IconName } from "./icon-loader"
import { styled } from "../../tokens/customStyled"

export type IconProps = BaseMixinProps & {
  name: IconName
  size?: string | number
  color?: string
  strokeWidth?: number
}
/**
 * @module Icon
 * 다양한 아이콘을 렌더링할 수 있는 재사용 가능한 `Icon` 컴포넌트로, SVG 아이콘을 기반으로 하며
 * 아이콘 이름, 크기, 색상, 선 두께 등을 유동적으로 설정할 수 있습니다.
 *
 * - SVG 아이콘 렌더링
 * - 다양한 크기 및 색상 지원
 * - `BaseMixin`을 사용한 스타일 확장
 * - 아이콘의 크기, 색상 및 선 두께 커스터마이징
 *
 * @props
 * - name: 아이콘 이름 (필수)
 * - size: 아이콘 크기 (기본값: '24px')
 * - color: 아이콘 색상 (기본값: '' — 색상 테마 또는 사용자 정의 색상)
 * - strokeWidth: 아이콘의 선 두께 (기본값: 0)
 * - 기타 `BaseMixin` 및 `Icon`에 관련된 스타일 속성들
 *
 * @사용법
 * <Icon
 *  name="Building5Line"
 *  size="32px"
 *  color="primary"
 *  strokeWidth={2}
 * />
 */

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size, color, strokeWidth, ...others }, ref) => {
    return (
      <StyledIcon ref={ref} width={size} height={size} color={color} {...others}>
        <use
          href={`#icon-${name}`}
          fill={color ?? "currentColor"}
          stroke={color ?? "currentColor"}
          strokeWidth={strokeWidth}
        />
      </StyledIcon>
    )
  },
)

const StyledIcon = styled.svg<{ color?: string }>`
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
  color: ${({ color }) => color};
  ${BaseMixin}
`

Icon.displayName = "Icon"

export default Icon

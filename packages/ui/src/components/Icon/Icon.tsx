import { forwardRef } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { IconName } from "./icon-loader"
import { styled } from "../../tokens/customStyled"

export type IconPaintType = "auto" | "fill" | "stroke" | "both"

export type IconProps = BaseMixinProps & {
  name: IconName
  size?: string | number
  color?: string
  strokeWidth?: number
  paint?: IconPaintType
}
/**---------------------------------------------------------------------------/

* ! Icon
*
* * SVG sprite 기반 아이콘 렌더링 컴포넌트
* * IconName 타입 기반으로 icon id(#icon-{name})를 <use>로 참조
* * size(width/height) 및 color(currentColor) 제어 지원
* * paint 옵션으로 fill/stroke 적용 방식 제어 (auto / fill / stroke / both)
* * paint 값에 따라 fill/stroke 적용 여부를 분리 계산하여 <use> 속성에 반영
* * stroke 적용 시 strokeWidth 및 vectorEffect="non-scaling-stroke" 조건부 적용
* * forwardRef로 SVG ref 전달 지원
* * BaseMixin 기반 외부 스타일 확장 지원
*
* @module Icon
* SVG 스프라이트(sprite)를 사용하는 아이콘 컴포넌트입니다.
* - `name`은 스프라이트에 등록된 `#icon-{name}`를 참조합니다.
* - `paint`는 fill/stroke 적용 방식을 제어합니다.
*   - auto: fill 기본 적용(원본이 stroke 기반이어도 currentColor fill을 허용)
*   - fill: fill만 적용
*   - stroke: stroke만 적용
*   - both: fill + stroke 모두 적용
* - stroke가 적용될 때만 strokeWidth 및 vectorEffect를 함께 적용합니다.
*
* @usage
* <Icon name="CloseLine" />
* <Icon name="StarFill" paint="fill" />
* <Icon name="PenLine" paint="stroke" strokeWidth={2} />
* <Icon name="AlertLine" paint="both" />

/---------------------------------------------------------------------------**/
const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = "24px", color, strokeWidth, paint = "auto", ...others }, ref) => {
    // * paint 값에 따라 fill/stroke 적용 여부를 계산
    const isStrokeMode = paint === "stroke" || paint === "both"
    const isFillMode = paint === "fill" || paint === "both"

    // * auto는 기본적으로 fill만 적용(필요 시 아이콘 소스가 stroke를 포함할 수 있음)
    const autoFill = paint === "auto"
    const shouldApplyStroke = isStrokeMode
    const shouldApplyFill = isFillMode || autoFill

    return (
      <StyledIcon ref={ref} width={size} height={size} $color={color} $paint={paint} {...others}>
        <use
          href={`#icon-${name}`}
          fill={shouldApplyFill ? "currentColor" : "none"}
          stroke={shouldApplyStroke ? "currentColor" : undefined}
          strokeWidth={shouldApplyStroke ? strokeWidth : undefined}
          vectorEffect={shouldApplyStroke ? "non-scaling-stroke" : undefined}
        />
      </StyledIcon>
    )
  },
)

const StyledIcon = styled.svg<{ $color?: string; $paint: IconPaintType }>`
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
  color: ${({ $color }) => $color ?? "currentColor"};
  ${BaseMixin}
`

Icon.displayName = "Icon"
export default Icon

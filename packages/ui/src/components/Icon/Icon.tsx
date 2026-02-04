import { forwardRef } from "react"
import { BaseMixin, type BaseMixinProps } from "../../tokens/baseMixin"
import type { IconName } from "./icon-types"
import { styled } from "../../tokens/customStyled"

export type IconPaintType = "auto" | "fill" | "stroke" | "both"

export type IconProps = BaseMixinProps & {
  name: IconName
  size?: string | number
  color?: string
  strokeWidth?: number
  paint?: IconPaintType
  ariaLabel?: string
}

const normalizeSize = (size?: string | number) =>
  typeof size === "number" ? `${size}px` : (size ?? "24px")
/**---------------------------------------------------------------------------/
 *
 * ! Icon
 *
 * * SVG sprite(<use href="#icon-...">) 방식을 사용하는 공통 아이콘 컴포넌트
 * * `name`으로 sprite 심볼을 선택하고, `size/color/strokeWidth/paint`로 표현 방식을 제어
 * * BaseMixinProps를 통해 spacing/size/sx 등 공통 스타일 확장 및 ref 전달을 지원
 *
 * * 동작 규칙
 *   * size 정규화
 *     * number 입력 시 `${n}px`로 변환
 *     * string 입력 시 그대로 사용
 *     * 미지정 시 기본값 "24px"
 *   * paint 규칙
 *     * fill 적용: paint가 "auto" | "fill" | "both" 인 경우 `fill="currentColor"`
 *     * stroke 적용: paint가 "stroke" | "both" 인 경우 `stroke="currentColor"` 및 `strokeWidth` 적용
 *     * stroke 사용 시 `vectorEffect="non-scaling-stroke"`를 적용해 스케일 변화에도 선 두께를 유지
 *   * 심볼 참조
 *     * `href`/`xlinkHref` 모두 `#icon-${name}` 형태로 지정하여 호환성을 확보
 *
 * * 레이아웃/스타일 관련 규칙
 *   * StyledIcon
 *     * inline-block + flex-shrink:0 + vertical-align:middle로 레이아웃 안정화
 *     * color는 `$color`가 있으면 이를 사용하고, 없으면 currentColor를 유지
 *     * BaseMixin을 통해 외부 spacing/sx 등을 병합
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `name`은 IconName(sprite id)로 필수
 *     * `color`는 SVG의 currentColor로 전달되어 fill/stroke에 반영
 *     * `strokeWidth`는 stroke가 적용될 때만 의미가 있음
 *     * `paint`는 fill/stroke 적용 여부를 결정("auto"는 기본 fill 중심)
 *   * 내부 계산 로직
 *     * `applyFill/applyStroke` 플래그로 <use>의 fill/stroke 속성을 조건부로 설정
 *
 * @module Icon
 * SVG sprite 기반의 공통 아이콘 컴포넌트(색상/크기/선 두께/표현 방식 제어)
 *
 * @usage
 * <Icon name="CloseLine" />
 * <Icon name="ArrowDown" size={16} color="#333" />
 * <Icon name="Pen" paint="stroke" strokeWidth={1.5} />
 *
/---------------------------------------------------------------------------**/
const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, color, strokeWidth, paint = "auto", ariaLabel, ...others }, ref) => {
    const resolvedSize = normalizeSize(size)

    const applyFill = paint === "auto" || paint === "fill" || paint === "both"
    const applyStroke = paint === "stroke" || paint === "both"

    const a11yProps =
      ariaLabel && ariaLabel.trim()
        ? { role: "img" as const, "aria-label": ariaLabel }
        : { "aria-hidden": "true" as const }

    return (
      <StyledIcon
        ref={ref}
        width={resolvedSize}
        height={resolvedSize}
        $color={color}
        focusable="false"
        {...a11yProps}
        {...others}
      >
        <use
          href={`#icon-${name}`}
          xlinkHref={`#icon-${name}`}
          fill={applyFill ? "currentColor" : "none"}
          stroke={applyStroke ? "currentColor" : undefined}
          strokeWidth={applyStroke ? strokeWidth : undefined}
          vectorEffect={applyStroke ? "non-scaling-stroke" : undefined}
        />
      </StyledIcon>
    )
  },
)

const StyledIcon = styled.svg<{ $color?: string }>`
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  color: ${({ $color }) => $color ?? "currentColor"};
  ${BaseMixin}
`

Icon.displayName = "Icon"
export default Icon

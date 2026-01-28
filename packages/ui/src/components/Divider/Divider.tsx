import { useMemo } from "react"
import { useTheme } from "styled-components"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { BaseMixin } from "../../tokens/baseMixin"
import type { DirectionType } from "../../types"
import { styled } from "../../tokens/customStyled"

export type DividerProps = BaseMixinProps & {
  direction?: DirectionType
  thickness?: string
  color?: string
  flexItem?: boolean
}
/**---------------------------------------------------------------------------/
 *
 * ! Divider
 *
 * * 레이아웃 구분선을 표시하는 구분선 컴포넌트(hr 기반)
 * * `direction(horizontal|vertical)`에 따라 가로/세로 구분선을 렌더링하며, `thickness`로 두께를 제어
 * * `flexItem` 옵션으로 Flex 컨테이너 내부에서 교차축 방향으로 늘어나는(스트레치) 구분선을 지원
 * * BaseMixinProps를 통해 spacing/size/sx 등 공통 스타일 확장 가능
 *
 * * 동작 규칙
 *   * 방향 처리
 *     * horizontal: `width: 100%`, `height: thickness`
 *     * vertical: `width: thickness`, `height: height ?? (flexItem ? "100%" : "auto")`
 *   * 색상 처리
 *     * `color` 미지정 시 theme.colors.border.thick을 기본값으로 사용
 *     * `resolvedColor`는 useMemo로 계산하여 불필요한 재계산을 최소화
 *   * 접근성
 *     * `role="separator"`를 고정 적용
 *     * `aria-orientation`을 direction 값에 맞춰 설정
 *
 * * 레이아웃/스타일 관련 규칙
 *   * hr 기본 스타일 초기화: margin/padding/border 제거 후 background-color로 선을 표현
 *   * `flexItem === true`이면 `align-self: stretch`를 적용하여 교차축 방향으로 늘어나도록 보정
 *   * BaseMixin이 StyledDivider에 적용되어 외부 스타일(p/m/width/height/bg/sx 등) 병합 가능
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `direction`은 구분선 방향(기본 horizontal)
 *     * `thickness`는 선 두께(기본 1px)
 *     * `color`는 선 색상(미지정 시 테마 기본 보더 색)
 *     * `flexItem`은 Flex 레이아웃에서 세로 구분선의 높이를 컨테이너에 맞춰 늘리는 용도
 *   * 내부 계산 로직
 *     * vertical 방향에서 height는 `props.height`가 우선이며, 없으면 flexItem에 따라 100% 또는 auto로 결정
 *
 * @module Divider
 * 가로/세로 레이아웃을 구분하는 구분선 컴포넌트
 *
 * @usage
 * <Divider />
 * <Divider direction="vertical" height="16px" />
 * <Divider direction="vertical" flexItem />
 *
/---------------------------------------------------------------------------**/

const Divider = ({
  direction = "horizontal",
  thickness = "1px",
  color,
  flexItem = false,
  ...others
}: DividerProps) => {
  const theme = useTheme()

  const resolvedColor = useMemo(() => color ?? theme.colors.border.thick, [color, theme])

  return (
    <StyledDivider
      role="separator"
      aria-orientation={direction === "horizontal" ? "horizontal" : "vertical"}
      $direction={direction}
      $thickness={thickness}
      $color={resolvedColor}
      $flexItem={flexItem}
      {...others}
    />
  )
}

const StyledDivider = styled.hr<
  {
    $direction: DirectionType
    $thickness: string
    $color: string
    $flexItem: boolean
  } & BaseMixinProps
>`
  ${BaseMixin}
  margin: 0;
  padding: 0;
  border: 0;
  background-color: ${({ $color }) => $color};

  ${({ $direction, $thickness, height, $flexItem }) =>
    $direction === "horizontal"
      ? `
        width: 100%;
        height: ${$thickness};
      `
      : `
        width: ${$thickness};
        height: ${height ?? ($flexItem ? "100%" : "auto")};
      `}

  ${({ $flexItem }) => $flexItem && "align-self: stretch;"}
`

export default Divider

import { css } from "styled-components"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import type { ColorUiType, AxisPlacement, SizeUiType } from "../../types"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import type { TypographyProps } from "../Typography/Typography"

export type SwitchButtonProps = BaseMixinProps & {
  checked: boolean
  onChange: (nextChecked: boolean) => void
  disabled?: boolean
  size?: SizeUiType
  color?: ColorUiType | string
  label?: string
  labelPlacment?: AxisPlacement
  labelPlacement?: AxisPlacement
  typographyProps?: Partial<TypographyProps>
}

const sizeMap: Record<
  SizeUiType,
  {
    width: string
    height: string
    knob: { width: string; height: string }
    offset: { checked: string; unchecked: string }
  }
> = {
  S: {
    width: "20px",
    height: "14px",
    knob: { width: "8px", height: "8px" },
    offset: { checked: "9px", unchecked: "2px" },
  },
  M: {
    width: "28px",
    height: "18px",
    knob: { width: "10px", height: "10px" },
    offset: { checked: "14px", unchecked: "2px" },
  },
  L: {
    width: "36px",
    height: "22px",
    knob: { width: "14px", height: "14px" },
    offset: { checked: "17px", unchecked: "4px" },
  },
}

const resolveSwitchColors = (
  color: ColorUiType | string,
  t: any,
  checked: boolean,
  disabled?: boolean,
) => {
  const baseColor =
    color === "primary"
      ? t.colors.primary[400]
      : color === "secondary"
        ? t.colors.secondary[400]
        : color === "normal"
          ? t.colors.text.primary
          : color

  const hoverColor =
    typeof color === "string"
      ? color
      : color === "primary"
        ? t.colors.primary[300]
        : color === "secondary"
          ? t.colors.secondary[300]
          : t.colors.text.secondary

  if (disabled) {
    return { background: t.colors.text.disabled, hover: null, disabled: true }
  }

  if (checked) {
    return { background: baseColor, hover: hoverColor, disabled: false }
  }

  return {
    background: t.colors.grayscale[200],
    hover: hoverColor,
    disabled: false,
  }
}

const renderLabel = (
  label: string,
  placement: AxisPlacement,
  checked: boolean,
  disabled: boolean,
  typographyProps?: Partial<TypographyProps>,
) => (
  <Typography
    text={label}
    variant="b1Medium"
    color={disabled || !checked ? theme.colors.text.disabled : theme.colors.text.primary}
    mr={placement === "left" ? "5px" : 0}
    ml={placement === "right" ? "5px" : 0}
    mb={placement === "top" ? "5px" : 0}
    mt={placement === "bottom" ? "5px" : 0}
    {...typographyProps}
  />
)
/**---------------------------------------------------------------------------/
 *
 * ! SwitchButton
 *
 * * boolean 값을 토글하는 스위치 버튼 컴포넌트입니다.
 * * `checked`/`onChange` 기반의 controlled 컴포넌트로 동작합니다.
 * * `disabled` 상태에서는 클릭/키보드 토글을 차단하고 비활성 스타일을 적용합니다.
 * * `size`에 따라 스위치 트랙/노브 크기 및 노브 이동 오프셋을 sizeMap으로 결정합니다.
 * * `color`는 primary/secondary/normal 또는 임의 색상 문자열을 받아 체크/호버/비체크 색상을 계산합니다.
 * * `label`은 AxisPlacement(top/bottom/left/right 및 start/end 포함) 기반으로 스위치 주변에 배치됩니다.
 * * `labelPlacment`(오타)와 `labelPlacement`를 모두 지원하며, labelPlacement가 우선입니다.
 *
 * * 동작 규칙
 *   * 제어 방식:
 *     * 상태는 외부 `checked`가 단일 소스이며, 내부 상태는 유지하지 않습니다.
 *     * 토글 시 `onChange(!checked)`로 다음 상태를 부모에 전달합니다.
 *   * disabled:
 *     * disabled면 `toggle`/`onKeyDown`에서 즉시 return하여 상태 변경을 차단합니다.
 *     * 버튼의 `disabled` 속성을 활성화하여 포커스/상호작용을 제한합니다.
 *   * 키보드:
 *     * Enter 또는 Space 입력 시 preventDefault 후 toggle을 수행합니다.
 *   * ARIA:
 *     * role="switch", aria-checked, aria-label을 설정하여 스위치 semantics를 제공합니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 레이아웃:
 *     * 라벨 배치가 top/bottom이면 Flex direction을 column으로 전환합니다.
 *     * 그 외(left/right)면 row로 렌더링합니다.
 *   * 라벨 렌더링(renderLabel):
 *     * placement에 따라 Typography의 margin(mr/ml/mt/mb)을 부여하여 간격을 제어합니다.
 *     * 색상 규칙:
 *       * `disabled || !checked`면 text.disabled
 *       * 그 외는 text.primary
 *     * `typographyProps`로 Typography 추가 설정을 전달합니다.
 *   * SwitchWrapper(트랙):
 *     * sizeMap의 width/height를 적용합니다.
 *     * resolveSwitchColors 결과로 background/hover/disabled 스타일을 결정합니다.
 *       * disabled: background는 text.disabled, opacity 0.5, hover 없음
 *       * checked: background는 baseColor(색상 타입/문자열 기반), hover는 hoverColor
 *       * unchecked: background는 grayscale[200], hover는 hoverColor
 *     * focus-visible 시 primary[200] 링(box-shadow)을 표시합니다.
 *   * Knob(노브):
 *     * sizeMap의 knob 크기를 적용합니다.
 *     * checked 여부에 따라 sizeMap.offset(checked/unchecked) 값을 left로 사용하여 이동합니다.
 *     * left 변화는 transition으로 부드럽게 처리합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `checked`(필수): 현재 토글 상태
 *     * `onChange`(필수): 다음 상태 전달 콜백
 *     * `size`: S/M/L에 따른 트랙/노브 크기 및 오프셋 결정
 *     * `color`: ColorUiType(primary/secondary/normal) 또는 임의 색상 문자열
 *     * `label`: 라벨 텍스트(있을 때만 렌더)
 *     * `labelPlacement`: 라벨 위치(우선), `labelPlacment`는 하위 호환용 fallback
 *   * 내부 계산:
 *     * sizeMap으로 트랙/노브/오프셋을 결정합니다.
 *     * resolveSwitchColors로 상태(checked/disabled)에 따른 배경/호버 색을 결정합니다.
 *   * 서버/클라이언트 제어:
 *     * 순수 controlled UI 컴포넌트이며, 체크 상태는 외부에서 제어됩니다.
 *
 * @module SwitchButton
 * size/color/labelPlacement를 지원하는 controlled 스위치 버튼 컴포넌트입니다.
 *
 * @usage
 * <SwitchButton checked={checked} onChange={setChecked} label="알림" labelPlacement="right" />
 *
/---------------------------------------------------------------------------**/

const SwitchButton = ({
  checked,
  onChange,
  disabled = false,
  size = "M",
  color = "primary",
  label,
  labelPlacment,
  labelPlacement,
  typographyProps,
  ...others
}: SwitchButtonProps) => {
  const resolvedLabelPlacement: AxisPlacement = (labelPlacement ??
    labelPlacment ??
    "right") as AxisPlacement
  const verticalPlacement = resolvedLabelPlacement === "top" || resolvedLabelPlacement === "bottom"

  const toggle = () => {
    if (disabled) return
    onChange(!checked)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <Flex align="center" direction={verticalPlacement ? "column" : "row"} {...others}>
      {label &&
        resolvedLabelPlacement === "left" &&
        renderLabel(label, "left", checked, disabled, typographyProps)}
      {label &&
        resolvedLabelPlacement === "top" &&
        renderLabel(label, "top", checked, disabled, typographyProps)}

      <SwitchWrapper
        type="button"
        aria-label={label ?? "switch"}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        $size={size}
        $color={color}
        $checked={checked}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <Knob $size={size} $checked={checked} />
      </SwitchWrapper>

      {label &&
        resolvedLabelPlacement === "right" &&
        renderLabel(label, "right", checked, disabled, typographyProps)}
      {label &&
        resolvedLabelPlacement === "bottom" &&
        renderLabel(label, "bottom", checked, disabled, typographyProps)}
    </Flex>
  )
}

const SwitchWrapper = styled.button<{
  $size: SizeUiType
  $checked: boolean
  $color?: ColorUiType | string
}>`
  ${({ $size }) => {
    const { width, height } = sizeMap[$size]
    return css`
      width: ${width};
      height: ${height};
    `
  }}

  position: relative;
  border-radius: 999px;
  border: 0;
  padding: 0;
  margin: 0;
  outline: none;
  appearance: none;
  background: transparent;
  transition: background-color 0.25s ease;
  display: inline-block;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

  ${({ theme: t, $checked, disabled, $color = "primary" }) => {
    const {
      background,
      hover,
      disabled: isDisabled,
    } = resolveSwitchColors($color, t, $checked, disabled)

    if (isDisabled) {
      return `
        background-color: ${background};
        opacity: 0.5;
      `
    }

    return `
      background-color: ${background};
      ${hover ? `&:hover { background-color: ${hover}; }` : ""}
      &:focus-visible {
        box-shadow: 0 0 0 3px ${t.colors.primary[200]};
      }
    `
  }}
`

const Knob = styled.div<{ $size: SizeUiType; $checked: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.grayscale.white};
  transition: left 0.25s ease;

  ${({ $size }) => {
    const { knob } = sizeMap[$size]
    return css`
      width: ${knob.width};
      height: ${knob.height};
    `
  }}

  left: ${({ $size, $checked }) =>
    $checked ? sizeMap[$size].offset.checked : sizeMap[$size].offset.unchecked};
`

SwitchButton.displayName = "SwitchButton"
export default SwitchButton

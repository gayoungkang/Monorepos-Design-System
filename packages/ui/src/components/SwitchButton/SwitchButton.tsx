import { css } from "styled-components"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import { ColorUiType, AxisPlacement, SizeUiType } from "../../types"
import Flex from "../Flex/Flex"
import { Typography, TypographyProps } from "../Typography/Typography"

type SwitchButtonProps = BaseMixinProps & {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  size?: SizeUiType
  color?: ColorUiType | string
  label: string
  labelPlacment?: AxisPlacement
  typographyProps?: Partial<TypographyProps>
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

const SwitchButton = ({
  checked,
  onChange,
  disabled = false,
  size = "M",
  color = "primary",
  label,
  labelPlacment = "right",
  typographyProps,
  ...others
}: SwitchButtonProps) => {
  const verticalPlacement = labelPlacment === "top" || labelPlacment === "bottom"

  return (
    <Flex align="center" direction={verticalPlacement ? "column" : "row"} {...others}>
      {label &&
        labelPlacment === "left" &&
        renderLabel(label, "left", checked, disabled, typographyProps)}
      {label &&
        labelPlacment === "top" &&
        renderLabel(label, "top", checked, disabled, typographyProps)}

      <SwitchWrapper
        size={size}
        color={color}
        checked={checked}
        disabled={disabled}
        onClick={!disabled ? onChange : undefined}
      >
        <Knob size={size} checked={checked} />
      </SwitchWrapper>

      {label &&
        labelPlacment === "right" &&
        renderLabel(label, "right", checked, disabled, typographyProps)}
      {label &&
        labelPlacment === "bottom" &&
        renderLabel(label, "bottom", checked, disabled, typographyProps)}
    </Flex>
  )
}

const sizeMap = {
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
  theme: any,
  checked: boolean,
  disabled?: boolean,
) => {
  const baseColor =
    color === "primary"
      ? theme.colors.primary[400]
      : color === "secondary"
        ? theme.colors.secondary[400]
        : color === "normal"
          ? theme.colors.text.primary
          : color

  const hoverColor =
    typeof color === "string"
      ? color
      : color === "primary"
        ? theme.colors.primary[300]
        : color === "secondary"
          ? theme.colors.secondary[300]
          : theme.colors.text.secondary

  if (disabled) {
    return { background: theme.colors.text.disabled, hover: null, disabled: true }
  }

  if (checked) {
    return { background: baseColor, hover: hoverColor, disabled: false }
  }

  return {
    background: theme.colors.grayscale[200],
    hover: hoverColor,
    disabled: false,
  }
}

const SwitchWrapper = styled.div<{
  size: SizeUiType
  checked: boolean
  disabled?: boolean
  color?: ColorUiType | string
}>`
  ${({ size }) => {
    const { width, height } = sizeMap[size]
    return css`
      width: ${width};
      height: ${height};
    `
  }}

  position: relative;
  border-radius: 999px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.25s ease;

  ${({ theme, checked, disabled, color = "primary" }) => {
    const {
      background,
      hover,
      disabled: isDisabled,
    } = resolveSwitchColors(color, theme, checked, disabled)

    if (isDisabled) {
      return `
        background-color: ${background};
        opacity: 0.5;
      `
    }

    return `
      background-color: ${background};
      ${hover ? `&:hover { background-color: ${hover}; }` : ""}
    `
  }}
`

const Knob = styled.div<{ size: SizeUiType; checked: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.grayscale.white};
  transition: left 0.25s ease;

  ${({ size }) => {
    const { knob } = sizeMap[size]
    return css`
      width: ${knob.width};
      height: ${knob.height};
    `
  }}

  left: ${({ size, checked }) =>
    checked ? sizeMap[size].offset.checked : sizeMap[size].offset.unchecked};
`

export default SwitchButton

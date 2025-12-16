import { FocusEventHandler, MouseEventHandler, useState, MouseEvent } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { IconName } from "../Icon/icon-loader"

import Icon, { IconProps } from "../Icon/Icon"
import { DefaultTheme } from "styled-components"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import { Tooltip, TooltipProps } from "../Tooltip/Tooltip"
import { VariantUiType } from "../../types"

export type IconButtonProps = BaseMixinProps & {
  icon: IconName
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  color?: string
  size?: number | string
  variant?: VariantUiType
  disabled?: boolean
  iconProps?: Partial<Omit<IconProps, "name">>
  disableInteraction?: boolean
  toolTip?: string
  toolTipProps?: TooltipProps
  onMouseDown?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseUp?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void
}

const IconButton = ({
  icon,
  onClick,
  color,
  disabled = false,
  disableInteraction = false,
  size = 16,
  variant = "contained",
  iconProps,
  toolTip,
  toolTipProps,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...others
}: IconButtonProps) => {
  const [isHover, setIsHover] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (e.detail === 0) return
    e.preventDefault()
    if (!disabled) onClick?.(e)
  }

  const handleHover = (hover: boolean) => (e: MouseEvent<HTMLButtonElement>) => {
    if (!disableInteraction) setIsHover(hover)
    if (!hover) onMouseLeave?.(e)
  }

  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disableInteraction) setIsActive(true)
    onMouseDown?.(e)
  }

  const handleMouseUp = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disableInteraction) setIsActive(false)
    onMouseUp?.(e)
  }

  const handleBlur: FocusEventHandler<HTMLButtonElement> = () => setIsActive(false)

  const getIconColorFromVariant = (
    variant: VariantUiType,
    theme: DefaultTheme,
    disabled: boolean,
    isHover: boolean,
    isActive: boolean,
  ): string => {
    if (disabled) return theme.colors.grayscale[200]
    if (isActive) return theme.colors.grayscale[500]
    if (variant === "outlined" && isHover) return theme.colors.grayscale[200]
    return theme.colors.grayscale[500]
  }

  // ★ 최종 아이콘 컬러 결정 (툴팁 여부와 관계없이 동일)
  const finalColor =
    iconProps?.color ??
    color ??
    getIconColorFromVariant(variant, theme, disabled, isHover, isActive)

  const ButtonContent = (
    <IconButtonStyle
      disabled={disabled}
      disableInteraction={disableInteraction}
      onClick={handleClick}
      onMouseEnter={handleHover(true)}
      onMouseLeave={handleHover(false)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onBlur={handleBlur}
      variant={variant}
      p={"4px"}
      {...others}
    >
      <Icon name={icon} size={size} color={finalColor} {...iconProps} />
    </IconButtonStyle>
  )

  return toolTip ? (
    <Tooltip content={toolTip} {...toolTipProps}>
      {ButtonContent}
    </Tooltip>
  ) : (
    ButtonContent
  )
}

export const IconButtonStyle = styled.button<Omit<IconButtonProps, "icon" | "onClick">>`
  ${BaseMixin}

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  transition: all 0.2s ease-in-out;

  ${({ disabled }) => `
    cursor: ${disabled ? "no-drop" : "pointer"};
  `}

  ${({ theme, disableInteraction }) =>
    !disableInteraction &&
    `
      &:hover {
        background-color: ${theme.colors.background.default};
      }
      &:active {
        background-color: ${theme.colors.background.dark};
      }
    `}

  ${({ variant, theme, disabled }) => variantStyle({ variant, theme, disabled })}
`

const variantStyle = ({
  variant,
  theme,
  disabled,
}: {
  variant?: VariantUiType
  theme: DefaultTheme
  disabled?: boolean
}) => {
  if (variant === "outlined")
    return `
      background-color: ${disabled ? theme.colors.background.dark : "transparent"};
      border: 1px solid ${disabled ? theme.colors.background.dark : theme.colors.border.default};
    `
  return `
    background-color: transparent;
  `
}

export default IconButton

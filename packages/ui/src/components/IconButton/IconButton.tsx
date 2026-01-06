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
/**---------------------------------------------------------------------------/

* ! IconButton
*
* * 아이콘만 렌더링하는 버튼 컴포넌트
* * icon(IconName) 기반으로 내부 Icon 컴포넌트 렌더링
* * variant(contained / outlined / text) 기반 스타일 분기 지원
* * hover/active 상태를 내부 state로 관리하여 아이콘 색상 계산
* * disableInteraction 옵션으로 hover/active 인터랙션 및 상태 업데이트 차단
* * disabled 상태 지원 (클릭 차단 및 강제 disabled 컬러 적용)
* * iconProps로 Icon 세부 옵션(size/color/paint 등) 부분 오버라이드 지원
* * toolTip 제공 시 Tooltip 래핑 렌더링 지원
* * 마우스 이벤트(onMouseDown/up/leave) passthrough 지원
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상, borderRadius, transition 시스템 활용
*
* @module IconButton
* 아이콘 단독 버튼 UI를 제공하는 컴포넌트입니다.
* - 내부적으로 hover/active 상태를 추적하여 variant에 맞는 아이콘 색상을 계산합니다.
* - disabled일 경우 iconProps/color 우선순위를 무시하고 disabled 컬러를 강제로 적용합니다.
* - toolTip 문자열이 있으면 Tooltip로 감싸서 노출합니다.
*
* @usage
* <IconButton icon="CloseLine" onClick={...} />
* <IconButton icon="MoreLine" variant="outlined" toolTip="More" />
* <IconButton icon="TrashLine" disabled disableInteraction />

/---------------------------------------------------------------------------**/

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

  // * 실제 클릭(마우스/터치)만 허용하고, disabled면 클릭을 차단
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (e.detail === 0) return
    e.preventDefault()
    if (!disabled) onClick?.(e)
  }

  // * hover 상태를 내부에서 관리하고, hover 해제 시 외부 onMouseLeave를 동기화
  const handleHover = (hover: boolean) => (e: MouseEvent<HTMLButtonElement>) => {
    if (!disableInteraction) setIsHover(hover)
    if (!hover) onMouseLeave?.(e)
  }

  // * active 상태를 내부에서 관리하고 외부 핸들러를 호출
  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disableInteraction) setIsActive(true)
    onMouseDown?.(e)
  }

  // * active 해제 및 외부 핸들러 호출
  const handleMouseUp = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disableInteraction) setIsActive(false)
    onMouseUp?.(e)
  }

  // * 포커스 이탈 시 active 상태를 초기화
  const handleBlur: FocusEventHandler<HTMLButtonElement> = () => setIsActive(false)

  // * variant/상태(disabled/hover/active)에 따라 기본 아이콘 색상을 계산
  const getIconColorFromVariant = (
    variant: VariantUiType,
    theme: DefaultTheme,
    disabled: boolean,
    isHover: boolean,
    isActive: boolean,
  ): string => {
    if (disabled) return theme.colors.text.disabled
    if (isActive) return theme.colors.grayscale[500]
    if (variant === "outlined" && isHover) return theme.colors.grayscale[200]
    return theme.colors.grayscale[500]
  }

  // * disabled일 때는 iconProps/color 우선순위를 무시하고 강제 disabled 색 적용
  const computedColor = getIconColorFromVariant(variant, theme, disabled, isHover, isActive)
  const finalColor = disabled ? computedColor : (iconProps?.color ?? color ?? computedColor)

  // * tooltip 유무에 따라 버튼을 감싸서 렌더링
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

// * variant/disabled 상태에 따른 배경/보더 스타일을 계산
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

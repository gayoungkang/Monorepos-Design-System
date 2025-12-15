import { ForwardedRef, forwardRef, MouseEventHandler, useState } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { SizeUiType } from "../../types"
import { IconName } from "../Icon/icon-loader"
import Icon, { IconProps } from "../Icon/Icon"
import { Typography, TypographyProps } from "../Typography/Typography"
import Flex from "../Flex/Flex"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"

export type MenuProps = BaseMixinProps & {
  size?: SizeUiType
  text: string
  onClick?: MouseEventHandler<HTMLButtonElement>
  startIcon?: IconName
  endIcon?: IconName
  selected?: boolean
  disabled?: boolean
  iconProps?: Partial<Omit<IconProps, "name">>
  typographyProps?: Partial<TypographyProps>
}

/**
 * @module Menu
 * 재사용 가능한 커스텀 Menu 컴포넌트로, 텍스트와 아이콘(startIcon, endIcon), 선택 상태(selected), 비활성화(disabled) 지원하는 버튼형 메뉴 아이템입니다.
 *
 * - BaseMixin 기반 스타일 확장
 * - 텍스트, 시작/끝 아이콘 포함 가능
 * - 선택 상태일 때 체크 아이콘 표시
 * - 마우스 호버, 클릭 활성 상태에 따른 스타일 변화
 *
 * @props
 * - text : 메뉴 텍스트
 * - size : 메뉴 크기 (M, S 등)
 * - onClick : 클릭 핸들러
 * - startIcon : 시작 아이콘 이름
 * - endIcon : 끝 아이콘 이름
 * - selected : 선택 여부 (체크 아이콘 표시)
 * - disabled : 비활성화 여부 (클릭 무시, 스타일 변경)
 * - iconProps : 아이콘 컴포넌트에 전달할 props 일부
 * - typographyProps : Typography 컴포넌트에 전달할 props 일부
 *
 * @usage
 * <Menu
 *  text="메뉴 아이템"
 *  startIcon="HomeLine"
 *  endIcon="ArrowRightSLine"
 *  selected
 *  onClick={() => alert("clicked")}
 *  disabled={false}
 * />
 */

const Menu = forwardRef<HTMLButtonElement, MenuProps>(
  (
    {
      text,
      onClick,
      startIcon,
      endIcon,
      size = "M",
      disabled = false,
      selected = false,
      iconProps,
      typographyProps,
      ...others
    },
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const [isHover, setIsHover] = useState(false)
    const [isActive, setIsActive] = useState(false)

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
      e.stopPropagation()
      if (!disabled && onClick) onClick(e)
    }

    const handleHover = (hover: boolean) => () => setIsHover(hover)
    const handleActive = (active: boolean) => () => setIsActive(active)

    const getColor = () =>
      disabled
        ? theme.colors.text.disabled
        : isActive
          ? theme.colors.info[500]
          : theme.colors.text.secondary

    const getSize = (size: SizeUiType): string => {
      switch (size) {
        case "S":
          return "8px"
        case "M":
          return "10px"
        case "L":
          return "12px"
        default:
          return "10px"
      }
    }

    return (
      <StyledMenu
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleHover(true)}
        onMouseLeave={handleHover(false)}
        onMouseDown={handleActive(true)}
        onMouseUp={handleActive(false)}
        disabled={disabled}
        size={size}
        $isHover={isHover}
        {...others}
      >
        <Flex align="center">
          {startIcon && (
            <Icon
              size={getSize(size)}
              color={getColor()}
              name={startIcon}
              mr="2px"
              {...iconProps}
            />
          )}

          <Typography
            text={text}
            color={getColor()}
            variant="b2Regular"
            sx={{ fontSize: getSize(size) }}
            {...typographyProps}
          />

          {endIcon && (
            <Icon size={getSize(size)} color={getColor()} name={endIcon} ml="2px" {...iconProps} />
          )}
        </Flex>

        {selected && (
          <Icon
            name="CheckLine"
            size={getSize(size)}
            color={theme.colors.info[500]}
            ml="2px"
            {...iconProps}
          />
        )}
      </StyledMenu>
    )
  },
)

const StyledMenu = styled.button<
  Omit<MenuProps, "text"> & { $isHover: boolean; size?: SizeUiType }
>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  width: 100%;
  border-radius: ${theme.borderRadius[4]};
  transition: all 0.2s ease-in-out;
  font-size: ${({ size }) => (size === "L" ? "12px" : size === "M" ? "10px" : "8px")};
  padding: ${({ size }) => (size === "L" ? "12px 6px" : size === "M" ? "8px 4px" : "5px 4px")};
  background-color: ${({ theme, disabled, $isHover }) =>
    disabled
      ? theme.colors.grayscale[100]
      : $isHover
        ? theme.colors.background.default
        : theme.colors.grayscale.white};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  ${BaseMixin}
`

export default Menu

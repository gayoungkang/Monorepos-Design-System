import { useState, useRef, useEffect } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import { ColorUiType, AxisPlacement, SizeUiType } from "../../types"
import Icon from "../Icon/Icon"
import { IconName } from "../Icon/icon-loader"
import { Typography, TypographyProps } from "../Typography/Typography"

/* ------------------------------- TYPES ------------------------------- */

type OptionType = {
  icon: IconName
  label?: string
  onClick?: () => void
}

export type FloatingButtonProps = BaseMixinProps & {
  item?: OptionType[]
  icon: IconName
  iconProps?: Partial<any>
  TypographyProps?: Partial<Omit<TypographyProps, "text">>
  label?: string
  size?: SizeUiType
  color?: ColorUiType | string
  disabled?: boolean
  placement?: AxisPlacement
  onClick?: () => void
}

/* ---------------------------- SIZE / COLOR ---------------------------- */

const sizeMap = {
  S: { diameter: 27, paddingX: 10, fontSize: 12 },
  M: { diameter: 37, paddingX: 14, fontSize: 14 },
  L: { diameter: 47, paddingX: 18, fontSize: 16 },
}

const getSizePx = (size: SizeUiType): string =>
  size === "S" ? "12px" : size === "L" ? "16px" : "14px"

const resolveColor = (color: ColorUiType | string) => {
  if (color === "primary") return theme.colors.primary[400]
  if (color === "secondary") return theme.colors.secondary[400]
  if (color === "normal") return theme.colors.grayscale.white
  return color
}

const getTextColor = (color: ColorUiType | string) => {
  if (color === "primary" || color === "secondary") return theme.colors.grayscale.white
  if (color === "normal") return theme.colors.text.primary
  return color
}

/* ------------------------------- MAIN -------------------------------- */

const FloatingButton = ({
  item,
  icon,
  label,
  size = "M",
  color = "primary",
  disabled,
  placement = "top",
  onClick,
  iconProps,
  TypographyProps,
}: FloatingButtonProps) => {
  const [open, setOpen] = useState(false)
  const itemRefs = useRef<HTMLButtonElement[]>([])
  const [offsets, setOffsets] = useState<number[]>([])

  const hasLabel = Boolean(label)

  const toggle = () => {
    if (!item || item.length === 0) {
      onClick?.()
      return
    }
    setOpen((prev) => !prev)
  }

  /* --------- measure widths/heights AFTER mount --------- */

  useEffect(() => {
    if (!item || item.length === 0) return

    const newOffsets: number[] = []
    let accumulated = 0

    itemRefs.current.forEach((el, index) => {
      if (!el) return

      const rect = el.getBoundingClientRect()

      const dist =
        placement === "top" || placement === "bottom"
          ? rect.height + 20 // gap
          : rect.width + 40 // gap

      accumulated += dist
      newOffsets[index] = accumulated
    })

    setOffsets(newOffsets)
  }, [item, placement, size, open])

  /* ------------------------------ RENDER ------------------------------- */

  return (
    <Wrapper>
      {/* submenu */}
      {item &&
        item.map((opt, i) => {
          const isExtended = Boolean(opt.label)
          const offset = offsets[i] ?? 0

          return (
            <FabItem
              key={i}
              ref={(el) => (itemRefs.current[i] = el!)}
              open={open}
              offset={offset}
              placement={placement}
              size={size}
              color={color}
              extended={isExtended}
              onClick={() => {
                opt.onClick?.()
                setOpen(false)
              }}
            >
              <Icon
                name={opt.icon}
                size={getSizePx(size)}
                color={getTextColor(color)}
                {...iconProps}
              />
              {isExtended && opt.label && (
                <Typography
                  text={opt.label}
                  color={getTextColor(color)}
                  sx={{ fontSize: getSizePx(size) }}
                  {...TypographyProps}
                />
              )}
            </FabItem>
          )
        })}

      {/* MAIN FAB */}
      <MainFab onClick={toggle} size={size} color={color} extended={hasLabel} disabled={disabled}>
        <Icon
          name={icon}
          size={getSizePx(size)}
          color={disabled ? theme.colors.grayscale.white : getTextColor(color)}
          {...iconProps}
        />
        {hasLabel && (
          <Typography
            text={label!}
            color={disabled ? theme.colors.grayscale.white : getTextColor(color)}
            sx={{ fontSize: getSizePx(size) }}
            {...TypographyProps}
          />
        )}
      </MainFab>
    </Wrapper>
  )
}

/* ------------------------------ STYLES ------------------------------- */

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
`

const FabItem = styled.button<{
  open: boolean
  offset: number
  placement: AxisPlacement
  size: SizeUiType
  color: ColorUiType | string
  extended: boolean
}>`
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  background-color: ${({ color }) => resolveColor(color)};
  color: ${({ color }) => getTextColor(color)};
  border: none;
  cursor: pointer;
  white-space: nowrap;

  height: ${({ size }) => sizeMap[size].diameter}px;
  min-width: ${({ size }) => sizeMap[size].diameter}px;

  border-radius: ${({ extended }) => (extended ? "28px" : "50%")};
  padding: ${({ extended, size }) => (extended ? `0 ${sizeMap[size].paddingX}px` : "0")};

  box-shadow: ${({ theme }) => theme.shadows.elevation["8"]};
  opacity: ${({ open }) => (open ? 1 : 0)};
  transform: ${({ open }) => (open ? "scale(1)" : "scale(0.6)")};
  transition: all 0.25s ease-in-out;

  ${({ placement, offset }) =>
    placement === "top" &&
    `
      bottom: ${offset}px;
      left: 0;
    `}
  ${({ placement, offset }) =>
    placement === "bottom" &&
    `
      top: ${offset}px;
      left: 0;
    `}
  ${({ placement, offset }) =>
    placement === "left" &&
    `
      right: ${offset}px;
      top: 0;
    `}
  ${({ placement, offset }) =>
    placement === "right" &&
    `
      left: ${offset}px;
      top: 0;
    `}
`

const MainFab = styled.button<{
  size: SizeUiType
  color: ColorUiType | string
  extended: boolean
  disabled?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  border: none;
  cursor: pointer;
  white-space: nowrap;

  background-color: ${({ color, disabled }) =>
    disabled ? theme.colors.text.disabled : resolveColor(color)};
  color: ${({ color }) => getTextColor(color)};

  height: ${({ size }) => sizeMap[size].diameter}px;
  min-width: ${({ size }) => sizeMap[size].diameter}px;

  border-radius: ${({ extended }) => (extended ? "28px" : "50%")};
  padding: ${({ extended, size }) => (extended ? `0 ${sizeMap[size].paddingX}px` : "0")};

  font-size: ${({ size }) => sizeMap[size].fontSize}px;

  box-shadow: ${({ theme }) => theme.shadows.elevation["8"]};
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    box-shadow: ${({ theme }) => theme.shadows.elevation["10"]};
  }
  &:active:not(:disabled) {
    box-shadow: ${({ theme }) => theme.shadows.elevation["6"]};
    transform: scale(0.96);
  }
  &:disabled {
    opacity: 0.5;
    box-shadow: none;
  }
`

export default FloatingButton

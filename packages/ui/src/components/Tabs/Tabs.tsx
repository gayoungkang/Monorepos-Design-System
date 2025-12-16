import { useEffect, useRef, useState } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { theme } from "../../tokens/theme"
import { styled } from "../../tokens/customStyled"
import { css } from "styled-components"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { ColorUiType, SizeUiType } from "../../types"
import IconButton from "../IconButton/IconButton"

export type TabOptionsType = {
  label: string
  value: string
  hidden?: boolean
  disabled?: boolean
}

export type TabProps = BaseMixinProps & {
  options: TabOptionsType[]
  value: string | null
  size: SizeUiType
  color?: ColorUiType | string
  onSelect: (value: string) => void
  scrollbarVisible?: boolean
  scrollButtonsVisible?: boolean
}

const resolveColor = (color: ColorUiType | string) => {
  if (color === "primary") return theme.colors.primary[400]
  if (color === "secondary") return theme.colors.secondary[400]
  if (color === "normal") return theme.colors.text.primary
  return color
}

const sizeStyle = {
  S: {
    height: "28px",
    padding: "0 8px",
    fontSize: "12px",
    gap: "8px",
  },
  M: {
    height: "40px",
    padding: "0 12px",
    fontSize: "14px",
    gap: "16px",
  },
  L: {
    height: "48px",
    padding: "0 16px",
    fontSize: "16px",
    gap: "20px",
  },
}

export const Tabs = ({
  options,
  value,
  size,
  onSelect,
  scrollbarVisible = true,
  scrollButtonsVisible = false,
  color = "primary",
  ...props
}: TabProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const visibleOptions = options.filter((o) => !o.hidden)
  const activeIndex = visibleOptions.findIndex((o) => o.value === value)

  useEffect(() => {
    if (!scrollRef.current) return
    if (activeIndex < 0) return

    const tabEl = scrollRef.current.children[activeIndex] as HTMLElement
    if (!tabEl) return

    setIndicator({
      left: tabEl.offsetLeft,
      width: tabEl.offsetWidth,
    })
  }, [value, options])

  const updateScrollButtons = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current

    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
  }

  useEffect(() => updateScrollButtons(), [])

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -120, behavior: "smooth" })
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 120, behavior: "smooth" })

  const gap = sizeStyle[size].gap
  const height = sizeStyle[size].height

  return (
    <TabsWrapper ref={wrapperRef} height={height} {...props}>
      {scrollButtonsVisible && (
        <ScrollButtonWrapper>
          <IconButton icon="ArrowLeft" size={20} disabled={!canScrollLeft} onClick={scrollLeft} />
        </ScrollButtonWrapper>
      )}

      <ScrollContainer
        ref={scrollRef}
        gap={gap}
        size={size}
        scrollbarVisible={scrollbarVisible}
        onScroll={updateScrollButtons}
        onWheel={(e) => {
          if (!scrollRef.current) return
          e.preventDefault()
          scrollRef.current.scrollBy({
            left: e.deltaY,
            behavior: "smooth",
          })
        }}
      >
        {visibleOptions.map((option, idx) => (
          <TabButton
            key={`tab-${option.value}-${idx}`}
            active={option.value === value}
            size={size}
            label={option.label}
            color={color}
            disabled={option.disabled}
            onClick={() => onSelect(option.value)}
          />
        ))}

        <Indicator
          color={color}
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />
      </ScrollContainer>

      {scrollButtonsVisible && (
        <ScrollButtonWrapper>
          <IconButton
            icon="ArrowRight"
            size={20}
            disabled={!canScrollRight}
            onClick={scrollRight}
          />
        </ScrollButtonWrapper>
      )}
    </TabsWrapper>
  )
}
Tabs.displayName = "Tabs"

const TabButton = ({
  label,
  size,
  active,
  disabled,
  color = "primary",
  onClick,
}: {
  label: string
  size: SizeUiType
  active?: boolean
  disabled?: boolean
  color?: ColorUiType | string
  onClick: () => void
}) => (
  <StyledTabButton
    type="button"
    active={active}
    disabled={disabled}
    size={size}
    color={color}
    onClick={disabled ? undefined : onClick}
  >
    <Typography
      text={label}
      color={active ? resolveColor(color) : theme.colors.text.primary}
      sx={{ fontSize: sizeStyle[size].fontSize }}
    />
  </StyledTabButton>
)

const TabsWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
`

const ScrollButtonWrapper = styled.div`
  flex: 0 0 auto;
  padding: 0 4px;
  z-index: 10;
`

const ScrollContainer = styled(Flex)<{ size: SizeUiType; scrollbarVisible: boolean }>`
  flex: 1;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;

  ${({ scrollbarVisible }) =>
    !scrollbarVisible &&
    css`
      -ms-overflow-style: none;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    `}

  ${BaseMixin};
  gap: ${({ gap }) => gap};

  ${({ theme, size }) =>
    size !== "M" &&
    css`
      &::before {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 1px;
        width: 100%;
        background: ${theme.colors.border.default};
        z-index: 0;
      }
    `}
`

const StyledTabButton = styled.button<{
  size: SizeUiType
  active?: boolean
  disabled?: boolean
}>`
  ${({ size }) => css`
    padding: ${sizeStyle[size].padding};
    height: ${sizeStyle[size].height};
  `}

  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  white-space: nowrap;
  border: none;
  background: none;
  outline: none;
  position: relative;

  ${({ active, theme }) =>
    active &&
    css`
      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 100%;
        background-color: ${theme.colors.primary[400]};
        border-radius: 2px;
        transition: all 0.25s ease;
        z-index: 2;
      }
    `}
`

const Indicator = styled.div<{ color?: ColorUiType | string }>`
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: ${({ color }) => resolveColor(color || "primary")};
  transition: all 0.25s ease;
  border-radius: 2px;
  z-index: 3;
`

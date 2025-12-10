import { LabelPlacement } from "@acme/ui/types"
import { forwardRef, KeyboardEvent, MouseEvent, ReactNode, useState } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import Flex from "../Flex/Flex"
import { IconName } from "../Icon/icon-loader"
import Label, { LabelProps } from "../Label/Label"

export type RatingProps = BaseMixinProps & {
  value?: number | null
  defaultValue?: number
  label?: string
  labelProps?: LabelProps
  LabelPlacement?: LabelPlacement
  max?: number
  precision?: number
  disabled?: boolean
  readOnly?: boolean
  icon?: ReactNode | IconName
  emptyIcon?: ReactNode | IconName
  size?: number | string
  onChange?: (value: number | null) => void
  onChangeActive?: (value: number | null) => void
}

const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      label,
      labelProps,
      LabelPlacement = "top",
      max = 5,
      precision = 1,
      disabled = false,
      readOnly = false,
      icon = "★",
      emptyIcon = "☆",
      size = 24,
      onChange,
      onChangeActive,
      ...others
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue)
    const currentValue = value ?? internal
    const [hoverValue, setHoverValue] = useState<number | null>(null)

    const isHorizontal = LabelPlacement === "left" || LabelPlacement === "right"

    const roundValue = (value: number, precision: number) =>
      Math.round(value / precision) * precision

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

    const handleClick = (index: number) => {
      if (disabled || readOnly) return
      const newValue = roundValue(index + 1, precision)
      setInternal(newValue)
      onChange?.(newValue)
    }

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>, index: number) => {
      if (disabled || readOnly) return
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newValue = roundValue(index + percent, precision)
      setHoverValue(newValue)
      onChangeActive?.(newValue)
    }

    const handleMouseLeave = () => {
      if (disabled || readOnly) return
      setHoverValue(null)
      onChangeActive?.(null)
    }

    const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return
      if (e.key === "ArrowRight") {
        const next = clamp(currentValue + precision, precision, max)
        setInternal(next)
        onChange?.(next)
      }
      if (e.key === "ArrowLeft") {
        const next = clamp(currentValue - precision, 0, max)
        setInternal(next)
        onChange?.(next)
      }
    }

    return (
      <Flex
        direction={isHorizontal ? "row" : "column"}
        align={isHorizontal ? "center" : "flex-start"}
        gap="4px"
      >
        {(LabelPlacement === "left" || LabelPlacement === "top") && label && (
          <Label text={label} {...labelProps} mb={LabelPlacement === "top" ? "10px" : "0px"} />
        )}

        <RatingWrapper
          role="radiogroup"
          ref={ref}
          tabIndex={disabled || readOnly ? -1 : 0}
          onKeyDown={handleKey}
          onMouseLeave={handleMouseLeave}
          {...others}
        >
          {Array.from({ length: max }).map((_, index) => {
            const displayed = hoverValue !== null ? hoverValue > index : currentValue > index

            return (
              <RatingItem
                key={index}
                disabled={disabled}
                readOnly={readOnly}
                size={size}
                onClick={() => handleClick(index)}
                onMouseMove={(e) => handleMouseMove(e, index)}
              >
                {displayed ? icon : emptyIcon}
              </RatingItem>
            )
          })}
        </RatingWrapper>

        {(LabelPlacement === "right" || LabelPlacement === "bottom") && label && (
          <Label text={label} {...labelProps} mt={LabelPlacement === "bottom" ? "10px" : "0px"} />
        )}
      </Flex>
    )
  },
)

const RatingWrapper = styled.div<BaseMixinProps>`
  ${BaseMixin}
  display: inline-flex;
  user-select: none;
  cursor: pointer;
`

const RatingItem = styled.div<{
  disabled?: boolean
  readOnly?: boolean
  size: number | string
}>`
  font-size: ${({ size }) => (typeof size === "number" ? `${size}px` : size)};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.text.disabled : theme.colors.primary[400]};
  padding: 2px;
  line-height: 0;
  cursor: ${({ disabled, readOnly }) => (disabled || readOnly ? "no-drop" : "pointer")};
  pointer-events: ${({ disabled }) => (disabled ? "no-drop" : "auto")};
`

export default Rating

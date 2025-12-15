import { ReactNode, useEffect, useRef, useState, FocusEventHandler } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { LabelPlacement, SizeUiType, VariantFormType } from "../../types"
import Label, { LabelProps } from "../Label/Label"
import { Typography, TypographyProps } from "../Typography/Typography"
import Chip from "../Chip/Chip"
import { theme } from "../../tokens/theme"
import Menu from "../Menu/Menu"
import Popper, { PopperProps } from "../Popper/Popper"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import Progress from "../Progress/Progress"
import IconButton from "../IconButton/IconButton"
import HelperText from "../HelperText/HelperText"
import { styled } from "../../tokens/customStyled"

export type SelectOptionType<
  T extends string | number = string | number,
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  value: T
  label: string
  chipColor?: string
  onClick?: () => void
  children?: ReactNode
  payload?: TPayload
  isAllOption?: boolean
}

export type SelectProps<T extends string | string[]> = BaseMixinProps & {
  variant?: VariantFormType
  multipleType?: "default" | "chip" | "multiple"
  label?: string
  options: SelectOptionType[]
  value?: T
  onChange?: (value: T) => void
  onBlur?: FocusEventHandler<HTMLDivElement>
  onFocus?: () => void
  error?: boolean
  helperText?: string
  disabled?: boolean
  placeholder?: string
  size?: SizeUiType
  color?: string
  required?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  isLoading?: boolean
  labelProps?: Partial<Omit<LabelProps, "text">>
  typographyProps?: Partial<TypographyProps>
  labelPlacement?: LabelPlacement
  popperProps?: PopperProps
}

type SelectWrapperStyleProps = {
  variant?: VariantFormType
  open?: boolean
  autoFocus?: boolean
  disabled?: boolean
  error?: boolean
  size?: SizeUiType
  color?: string
  readOnly?: boolean
  loading?: boolean
  isActive?: boolean
}

const Select = <T extends string | string[]>({
  variant = "outlined",
  multipleType = "default",
  label,
  options,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled,
  placeholder,
  error,
  helperText,
  required,
  size = "M",
  autoFocus = false,
  color,
  readOnly,
  isLoading,
  labelProps,
  typographyProps,
  labelPlacement = "top",
  popperProps,
  ...others
}: SelectProps<T>) => {
  const [open, setOpen] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const popperRef = useRef<HTMLDivElement>(null)
  const selectBoxRef = useRef<HTMLDivElement>(null)

  const isControlled = value !== undefined

  const [internalValue, setInternalValue] = useState<T>(() => {
    if (value !== undefined) return value
    return (Array.isArray(value) ? [] : undefined) as unknown as T
  })

  const currentValue = isControlled ? value : internalValue
  const multiple = Array.isArray(currentValue)
  const hasEmptyValueOption = options.some((opt) => opt.value === "")

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

  const selectedValues = multiple
    ? (currentValue as string[])
    : currentValue !== undefined &&
        currentValue !== null &&
        (hasEmptyValueOption ? true : currentValue !== "")
      ? [String(currentValue)]
      : []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (!popperRef.current) return

      if (
        selectBoxRef.current &&
        !selectBoxRef.current.contains(target) &&
        !popperRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside, true)
    return () => document.removeEventListener("mousedown", handleClickOutside, true)
  }, [])

  useEffect(() => {
    if (!autoFocus || disabled || readOnly) return
    setOpen(true)
  }, [autoFocus, disabled, readOnly])

  const handleSelect = (selected: (string | number)[]) => {
    const stringSelected = selected.map(String)
    const result = (multiple ? stringSelected : (stringSelected[0] ?? undefined)) as T

    if (isControlled) onChange?.(result)
    else setInternalValue(result)

    if (!multiple && multipleType !== "chip" && multipleType !== "multiple") {
      setOpen(false)
    }
  }

  const handleFocus = () => {
    setIsActive(true)
    onFocus?.()
  }

  const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    setIsActive(false)
    onBlur?.(event)
  }

  const handleDelete = (v: string) => {
    const updated = selectedValues.filter((item) => item !== v) as T
    if (isControlled) onChange?.(updated)
    else setInternalValue(updated)
  }

  const selectedElement = () => {
    if (selectedValues.length === 0) {
      return (
        <Typography
          text={placeholder || "선택"}
          variant="b2Regular"
          color={theme.colors.grayscale[500]}
          ellipsis
          sx={{ fontSize: getSize(size), lineHeight: "inherit" }}
          {...typographyProps}
        />
      )
    }

    if (multiple) {
      if (multipleType === "chip") {
        return (
          <>
            {selectedValues.map((v) => {
              const matchedOption = options.find((opt) => opt.value === v)
              return (
                <Chip
                  key={v}
                  label={matchedOption?.label || v}
                  onDelete={!readOnly && !disabled ? () => handleDelete(v) : undefined}
                  size="M"
                  color={matchedOption?.chipColor || "normal"}
                  disabled={disabled}
                />
              )
            })}
          </>
        )
      }

      const selectedLabels = options
        .filter((o) => selectedValues.includes(String(o.value)))
        .map((o) => o.label)

      const text =
        selectedLabels.length === 1
          ? selectedLabels[0]
          : selectedLabels.length === options.length
            ? "전체"
            : `"${selectedLabels[0]}" 외 ${selectedLabels.length - 1}건`

      return (
        <Typography
          text={text}
          variant="b2Regular"
          color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
          ellipsis
          sx={{ fontSize: getSize(size), lineHeight: "inherit" }}
          {...typographyProps}
        />
      )
    }

    const matchedOption = options.find((opt) => opt.value === selectedValues[0])
    return (
      <Typography
        text={matchedOption?.label || selectedValues[0]}
        variant="b2Regular"
        color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
        ellipsis
        sx={{ fontSize: getSize(size), lineHeight: "inherit" }}
        {...typographyProps}
      />
    )
  }

  const popperElement = () => {
    if (!multiple) {
      return options.map((item) => {
        const isSelected = selectedValues.includes(String(item.value))
        return (
          <Menu
            key={item.value}
            text={item.label}
            onClick={(e) => {
              e.preventDefault()
              handleSelect([item.value])
              item.onClick?.()
            }}
            selected={isSelected}
            width="100%"
            size={size}
          />
        )
      })
    }

    return options.map((item) => {
      const isSelected = selectedValues.includes(String(item.value))
      return (
        <Menu
          key={item.value}
          text={item.label}
          onClick={(e) => {
            e.preventDefault()
            if (item.isAllOption) {
              const allValues = options.filter((x) => !x.isAllOption).map((x) => String(x.value))
              const isAllSelected = allValues.every((v) => selectedValues.includes(v))
              handleSelect(isAllSelected ? [] : allValues)
            } else {
              const updated = isSelected
                ? selectedValues.filter((v) => v !== String(item.value))
                : [...selectedValues, String(item.value)]
              handleSelect(updated)
            }
            item.onClick?.()
          }}
          selected={
            item.isAllOption
              ? options.length > 0 &&
                options
                  .filter((x) => !x.isAllOption)
                  .every((x) => selectedValues.includes(String(x.value)))
              : isSelected
          }
        />
      )
    })
  }

  const renderLabel = (position: "top" | "bottom") => {
    const isTop = labelPlacement?.startsWith("top")
    const isBottom = labelPlacement?.startsWith("bottom")
    const align = labelPlacement?.endsWith("start") ? "flex-start" : "flex-end"

    if (label && ((position === "top" && isTop) || (position === "bottom" && isBottom))) {
      return (
        <Flex align={align}>
          <Label
            text={label}
            required={required}
            mb={position === "top" ? 4 : 0}
            mt={position === "bottom" ? 4 : 0}
            {...labelProps}
          />
        </Flex>
      )
    }
    return null
  }

  return (
    <Box
      width="100%"
      height="max-content"
      sx={{ position: "relative", backgroundColor: "transparent" }}
      {...others}
    >
      {renderLabel("top")}

      <Flex width="100%" height="100%" align="center" justify="space-between">
        {label && labelPlacement === "left" && (
          <Label text={label} required={required} mr={4} {...labelProps} />
        )}

        <SelectBox
          onClick={(e) => {
            if (e.detail === 0) return
            e.preventDefault()
            if (!disabled && !readOnly && !isLoading) setOpen((prev) => !prev)
          }}
          variant={variant}
          ref={selectBoxRef}
          onBlur={handleBlur}
          onFocus={handleFocus}
          isActive={isActive}
          open={open}
          disabled={disabled}
          error={error}
          size={size}
          color={color}
          readOnly={readOnly}
          loading={isLoading}
        >
          <Flex ml={8} gap="4px">
            {isLoading ? (
              <Progress
                type="Circular"
                size={getSize(size)}
                color={theme.colors.grayscale[400]}
                backgroundColor={theme.colors.grayscale[100]}
              />
            ) : (
              selectedElement()
            )}
          </Flex>
          <IconButton
            disableInteraction
            onClick={(e) => {
              e.stopPropagation()
              if (!disabled && !readOnly) setOpen((prev) => !prev)
            }}
            icon={open ? "ArrowUp" : "ArrowDown"}
            size={getSize(size)}
            mr={8}
            disabled={readOnly || disabled || isLoading}
            iconProps={{ color: theme.colors.grayscale[300] }}
            sx={{ padding: 0, backgroundColor: "transparent" }}
          />

          {open && selectBoxRef.current && (
            <Popper
              ref={popperRef}
              anchorRef={selectBoxRef}
              placement="bottom-start"
              offsetY={4}
              open={open}
              width="anchor"
              {...popperProps}
            >
              {options.length > 0 ? (
                popperElement()
              ) : (
                <Typography
                  p={size === "M" ? "8px" : "4px"}
                  variant="b2Regular"
                  color={theme.colors.text.disabled}
                  text="No options available."
                  width="100%"
                  align="center"
                  sx={{ fontSize: getSize(size) }}
                />
              )}
            </Popper>
          )}
        </SelectBox>

        {label && labelPlacement === "right" && (
          <Label text={label} required={required} ml={4} {...labelProps} />
        )}
      </Flex>

      {renderLabel("bottom")}

      {error && <HelperText status="error" text={helperText ?? ""} mt={6} />}
    </Box>
  )
}

const getDisabledStyle = (variant: VariantFormType, theme: any) => {
  switch (variant) {
    case "outlined":
      return `
        border-color: ${theme.colors.grayscale[200]};
        background-color: ${theme.colors.grayscale[100]};
        color: ${theme.colors.text.disabled};
      `
    case "filled":
      return `
        border-color: transparent;
        background-color: ${theme.colors.grayscale[100]};
        color: ${theme.colors.text.disabled};
      `
    case "standard":
      return `
        border-bottom-color: ${theme.colors.grayscale[200]};
        background-color: transparent;
        color: ${theme.colors.text.disabled};
      `
    default:
      return ""
  }
}

const SelectBox = styled.div<SelectWrapperStyleProps>`
  position: relative;
  display: flex;
  width: 100%;
  height: auto;
  align-items: center;
  justify-content: space-between;
  min-height: ${({ size }) => (size === "L" ? "32px" : size === "M" ? "28px" : "24px")};
  font-size: ${({ size }) => (size === "L" ? "12px" : size === "M" ? "10px" : "8px")};
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  border: 1px solid ${({ theme }) => theme.colors.border.default};

  background-color: ${({ theme }) => theme.colors.grayscale.white};
  border-radius: ${({ theme, variant }) => (variant === "outlined" ? theme.borderRadius[4] : 0)};
  transition: all 0.2s ease-in-out;
  cursor: ${({ disabled, readOnly, loading }) =>
    disabled || readOnly || loading ? "not-allowed" : "pointer"};

  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case "filled":
        return theme.colors.grayscale.white
      case "standard":
        return "transparent"
      default:
        return theme.colors.grayscale.white
    }
  }};

  border: ${({ variant }) =>
    variant === "outlined" ? `1px solid  ${theme.colors.border.default}` : "0"};

  border-bottom: ${({ theme, variant }) =>
    variant === "standard"
      ? `1px solid ${theme.colors.border.default}`
      : `1px solid ${theme.colors.border.default}`};

  ${({ open, variant, theme, disabled, readOnly }) =>
    open &&
    !disabled &&
    !readOnly &&
    (variant === "standard"
      ? `
    border-bottom: 1px solid ${theme.colors.info[300]};
  `
      : `
    border-color: ${theme.colors.info[300]};
  `)}

  ${({ error, theme, variant }) =>
    error &&
    `
   ${
     variant === "standard"
       ? `border-bottom: 1px solid ${theme.colors.primary[300]};`
       : `border-color: ${theme.colors.error[300]};`
   }
 `}

${({ disabled, readOnly, variant, theme }) =>
    (disabled || readOnly) &&
    `
    ${getDisabledStyle(variant || "outlined", theme)}
    cursor: not-allowed;
  `}
`

export default Select

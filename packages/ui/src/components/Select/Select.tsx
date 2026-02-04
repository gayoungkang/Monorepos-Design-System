import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode, FocusEventHandler } from "react"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import Label from "../Label/Label"
import type { LabelProps } from "../Label/Label"
import { Typography } from "../Typography/Typography"
import type { TypographyProps } from "../Typography/Typography"
import Chip from "../Chip/Chip"
import { theme } from "../../tokens/theme"
import Menu from "../Menu/Menu"
import Popper from "../Popper/Popper"
import type { PopperProps } from "../Popper/Popper"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import Progress from "../Progress/Progress"
import IconButton from "../IconButton/IconButton"
import HelperText from "../HelperText/HelperText"
import { styled } from "../../tokens/customStyled"
import type { VariantFormType } from "../../types/form"
import type { SizeUiType } from "../../types/ui"
import type { AxisPlacement } from "../../types/placement"

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

export type SelectValue<T extends string | string[]> = T | undefined

export type SelectProps<T extends string | string[] = string> = BaseMixinProps & {
  variant?: VariantFormType
  multipleType?: "default" | "chip" | "multiple"
  label?: string
  options: SelectOptionType[]
  value?: SelectValue<T>
  defaultValue?: SelectValue<T>
  onChange?: (value: SelectValue<T>) => void
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
  labelPlacement?: AxisPlacement
  popperProps?: PopperProps
}

type SelectWrapperStyleProps = {
  variant?: VariantFormType
  open?: boolean
  disabled?: boolean
  error?: boolean
  size?: SizeUiType
  color?: string
  readOnly?: boolean
  loading?: boolean
  isActive?: boolean
}

const getSizePx = (size: SizeUiType): string => {
  switch (size) {
    case "S":
      return "10px"
    case "L":
      return "12px"
    default:
      return "11px"
  }
}

const getMinHeight = (size: SizeUiType): string => {
  switch (size) {
    case "L":
      return "32px"
    case "S":
      return "24px"
    default:
      return "28px"
  }
}

const getDisabledStyle = (variant: VariantFormType, t: any) => {
  switch (variant) {
    case "outlined":
      return `
        border-color: ${t.colors.grayscale[200]};
        background-color: ${t.colors.grayscale[100]};
        color: ${t.colors.text.disabled};
      `
    case "filled":
      return `
        border-color: transparent;
        background-color: ${t.colors.grayscale[100]};
        color: ${t.colors.text.disabled};
      `
    case "standard":
      return `
        border-bottom-color: ${t.colors.grayscale[200]};
        background-color: transparent;
        color: ${t.colors.text.disabled};
      `
    default:
      return ""
  }
}
/**---------------------------------------------------------------------------/
 *
 * ! Select
 *
 * * 옵션 목록에서 값을 선택하는 Select 컴포넌트입니다. (single / multiple 지원)
 * * `value` 제공 여부에 따라 controlled/비제어(uncontrolled) 모드로 동작합니다.
 * * `multipleType`에 따라 다중 선택 표시 방식(기본 텍스트 / chip / multiple)을 달리합니다.
 * * Popper 기반 드롭다운을 사용하며, 외부 클릭 감지로 닫히고(ClickOutside), 키보드로 열기/닫기를 지원합니다.
 * * `disabled`/`readOnly`/`isLoading` 상태에서는 열기/선택/삭제 동작을 제한하고 UI를 비활성화합니다.
 *
 * * 동작 규칙
 *   * 제어 방식:
 *     * `isControlled = value !== undefined`
 *     * uncontrolled일 때 초기값은 `defaultValue`를 사용하며, 없으면 undefined로 시작합니다.
 *     * controlled일 때 `value` 변경을 useEffect로 internalValue에 동기화합니다.
 *     * 현재 값은 `currentValue = isControlled ? value : internalValue`로 결정합니다.
 *   * single vs multiple 판정:
 *     * `multiple = Array.isArray(currentValue)`로 다중 모드를 판정합니다.
 *     * `selectedValues`는 현재 값을 문자열 배열로 정규화한 결과입니다.
 *       * multiple: `(currentValue as string[]).map(String)`
 *       * single: 값이 존재하고(빈 값 옵션이 있거나 값이 ""이 아니면) `[String(currentValue)]`, 아니면 `[]`
 *   * 외부 클릭 닫힘:
 *     * document mousedown 캡처 단계에서 selectBoxRef/popperRef 외부 클릭을 감지하면 `open=false`로 닫습니다.
 *   * autoFocus 처리:
 *     * `autoFocus && !disabled && !readOnly`면 mount/변경 시 `open=true`로 즉시 오픈합니다.
 *   * 값 확정(commit):
 *     * `commitValue(next)`는 controlled면 `onChange(next)`만 호출합니다.
 *     * uncontrolled면 internalValue를 갱신하고 `onChange(next)`를 호출합니다.
 *   * 옵션 선택(handleSelect):
 *     * 전달된 selected 배열을 문자열로 정규화 후,
 *       * multiple: 문자열 배열을 T로 캐스팅하여 next로 사용
 *       * single: 첫 요소 또는 undefined를 T로 캐스팅하여 next로 사용
 *     * single이며 `multipleType`이 chip/multiple이 아니면 선택 직후 드롭다운을 닫습니다.
 *   * 포커스/블러:
 *     * focus 시 `isActive=true` + `onFocus` 호출
 *     * blur 시 `isActive=false` + `onBlur(event)` 호출
 *   * 다중 chip 삭제:
 *     * multiple + `multipleType==="chip"`에서 chip의 delete로 선택값을 제거하고 commit합니다.
 *     * `readOnly || disabled`면 delete 핸들러를 제공하지 않습니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 라벨 배치:
 *     * `labelPlacement`가 top/bottom이면 `renderLabel("top"|"bottom")`으로 상/하단에 Label을 렌더링합니다.
 *     * `labelPlacement`가 left/right이면 중앙 행(Flex) 내부 좌/우에 Label을 렌더링합니다.
 *     * top/bottom 라벨 정렬은 placement의 start/end에 따라 flex-start/flex-end로 결정합니다.
 *   * SelectBox(입력 영역):
 *     * `variant`에 따라 outlined/filled/standard 스타일을 적용합니다.
 *     * `open && !disabled && !readOnly`면 info[300] 색상으로 border 강조(standard는 border-bottom).
 *     * `error`면 error[300]으로 border 강조(standard는 border-bottom).
 *     * `disabled || readOnly`면 variant별 disabled 스타일(getDisabledStyle)을 적용하고 cursor를 not-allowed로 고정합니다.
 *     * 최소 높이는 `getMinHeight(size)`로 결정됩니다.
 *   * Loading 표시:
 *     * `isLoading`이면 선택값 대신 Circular Progress를 표시합니다.
 *     * Loading 중에는 열기/키 조작/아이콘 토글을 모두 차단합니다.
 *   * 드롭다운:
 *     * open 상태에서 anchorRef(selectBoxRef) 기준 Popper를 bottom-start로 렌더링합니다.
 *     * options가 비어있으면 "No options available." 안내 Typography를 표시합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `options`는 { value, label, isAllOption, onClick, payload, children, chipColor }를 가질 수 있습니다.
 *     * `value/defaultValue/onChange`는 SelectValue<T>(T | undefined) 계약을 따릅니다.
 *     * multiple 선택은 `value`가 배열일 때로 판정되며, 값은 문자열 배열로 내부 정규화됩니다.
 *   * “전체” 옵션 처리:
 *     * multiple에서 `isAllOption`이 true인 옵션은 토글 방식으로 동작합니다.
 *       * 전체가 이미 선택된 상태면 []로 해제, 아니면 “실제 옵션( isAllOption 제외 )” 전체를 선택합니다.
 *     * 표시 텍스트:
 *       * 1개 선택: 해당 라벨
 *       * 전체 선택: "전체"
 *       * 그 외: `"첫 라벨" 외 N건`
 *   * 내부 계산:
 *     * `hasEmptyValueOption`으로 빈 값("") 옵션 존재 여부를 검사하여 single 선택의 empty 처리 규칙을 분기합니다.
 *     * placeholder는 선택값이 없을 때만 표시됩니다.
 *   * 서버/클라이언트 제어:
 *     * 선택 상태는 controlled일 때 외부 `value`가 단일 소스이며, uncontrolled는 internalValue로 유지됩니다.
 *
 * @module Select
 * Popper 기반 드롭다운 Select를 제공하며, single/multiple 선택과 표시 방식(multipleType), 라벨 배치, 상태(disabled/readOnly/error/loading)를 지원합니다.
 *
 * @usage
 * <Select
 *   label="카테고리"
 *   options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
 *   value={value}
 *   onChange={setValue}
 *   placeholder="선택"
 *   variant="outlined"
 * />
 *
/---------------------------------------------------------------------------**/

const Select = <T extends string | string[] = string>({
  variant = "outlined",
  multipleType = "default",
  label,
  options,
  value,
  defaultValue,
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

  const [internalValue, setInternalValue] = useState<SelectValue<T>>(() => {
    if (isControlled) return value
    if (defaultValue !== undefined) return defaultValue
    return undefined
  })

  useEffect(() => {
    if (!isControlled) return
    setInternalValue(value)
  }, [isControlled, value])

  const currentValue = isControlled ? value : internalValue
  const multiple = Array.isArray(currentValue)

  const hasEmptyValueOption = useMemo(
    () => options.some((opt) => String(opt.value) === ""),
    [options],
  )

  const selectedValues = useMemo<string[]>(() => {
    if (multiple) return (currentValue as string[]).map((v) => String(v))

    if (
      currentValue !== undefined &&
      currentValue !== null &&
      (hasEmptyValueOption ? true : String(currentValue) !== "")
    ) {
      return [String(currentValue)]
    }

    return []
  }, [currentValue, multiple, hasEmptyValueOption])

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

  const commitValue = (next: SelectValue<T>) => {
    if (isControlled) onChange?.(next)
    else {
      setInternalValue(next)
      onChange?.(next)
    }
  }

  const handleSelect = (selected: (string | number)[]) => {
    const stringSelected = selected.map(String)

    const next = (
      multiple
        ? (stringSelected as unknown as T)
        : ((stringSelected[0] ?? undefined) as unknown as T)
    ) as SelectValue<T>

    commitValue(next)

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
    if (!multiple) return
    const updated = selectedValues.filter((item) => item !== v)
    commitValue(updated as unknown as SelectValue<T>)
  }

  const selectedElement = () => {
    const fontSize = getSizePx(size)

    if (selectedValues.length === 0) {
      return (
        <Typography
          text={placeholder || "선택"}
          variant="b2Regular"
          color={theme.colors.grayscale[500]}
          ellipsis
          sx={{ fontSize, lineHeight: "inherit" }}
          {...typographyProps}
        />
      )
    }

    if (multiple) {
      if (multipleType === "chip") {
        return (
          <>
            {selectedValues.map((v) => {
              const matchedOption = options.find((opt) => String(opt.value) === v)
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

      const realOptionsCount = options.filter((x) => !x.isAllOption).length

      const text =
        selectedLabels.length === 1
          ? selectedLabels[0]
          : selectedLabels.length === realOptionsCount
            ? "전체"
            : `"${selectedLabels[0]}" 외 ${selectedLabels.length - 1}건`

      return (
        <Typography
          text={text}
          variant="b2Regular"
          color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
          ellipsis
          sx={{ fontSize, lineHeight: "inherit" }}
          {...typographyProps}
        />
      )
    }

    const matchedOption = options.find((opt) => String(opt.value) === selectedValues[0])
    return (
      <Typography
        text={matchedOption?.label || selectedValues[0]}
        variant="b2Regular"
        color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary}
        ellipsis
        sx={{ fontSize, lineHeight: "inherit" }}
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
            key={String(item.value)}
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
      const allValues = options.filter((x) => !x.isAllOption).map((x) => String(x.value))
      const isAllSelected =
        allValues.length > 0 && allValues.every((v) => selectedValues.includes(v))

      return (
        <Menu
          key={String(item.value)}
          text={item.label}
          onClick={(e) => {
            e.preventDefault()

            if (item.isAllOption) {
              handleSelect(isAllSelected ? [] : allValues)
            } else {
              const updated = isSelected
                ? selectedValues.filter((v) => v !== String(item.value))
                : [...selectedValues, String(item.value)]
              handleSelect(updated)
            }

            item.onClick?.()
          }}
          selected={item.isAllOption ? isAllSelected : isSelected}
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

  const iconSize = getSizePx(size)

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
          role="button"
          tabIndex={disabled || readOnly ? -1 : 0}
          onMouseDown={(e) => {
            if (e.detail === 0) return
            e.preventDefault()
            if (!disabled && !readOnly && !isLoading) setOpen((prev) => !prev)
          }}
          onKeyDown={(e) => {
            if (disabled || readOnly || isLoading) return
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setOpen((prev) => !prev)
            }
            if (e.key === "Escape") {
              e.preventDefault()
              setOpen(false)
            }
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
          <Flex ml={8} gap="4px" align="center" sx={{ overflow: "hidden" }}>
            {isLoading ? (
              <Progress
                type="Circular"
                size={iconSize}
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
              if (!disabled && !readOnly && !isLoading) setOpen((prev) => !prev)
            }}
            icon={open ? "ArrowUp" : "ArrowDown"}
            size={iconSize}
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
                  sx={{ fontSize: iconSize }}
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

const SelectBox = styled.div<SelectWrapperStyleProps>`
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  min-height: ${({ size = "M" }) => getMinHeight(size)};
  border-radius: ${({ theme, variant }) => (variant === "outlined" ? theme.borderRadius[4] : 0)};
  transition: all 0.2s ease-in-out;

  cursor: ${({ disabled, readOnly, loading }) =>
    disabled || readOnly || loading ? "not-allowed" : "pointer"};

  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case "standard":
        return "transparent"
      default:
        return theme.colors.grayscale.white
    }
  }};

  border: ${({ theme, variant }) =>
    variant === "outlined" ? `1px solid ${theme.colors.border.default}` : "0"};

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
          ? `border-bottom: 1px solid ${theme.colors.error[300]};`
          : `border-color: ${theme.colors.error[300]};`
      }
    `}

  ${({ disabled, readOnly, variant = "outlined", theme }) =>
    (disabled || readOnly) &&
    `
      ${getDisabledStyle(variant, theme)}
      cursor: not-allowed;
    `}
`

export default Select

import type { ChangeEvent, FocusEventHandler } from "react"
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef } from "react"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import Label, { type LabelProps } from "../Label/Label"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import HelperText from "../HelperText/HelperText"
import { Typography } from "../Typography/Typography"
import { styled } from "../../tokens/customStyled"
import { useTheme } from "styled-components"
import type { AxisPlacement, DirectionType, SizeUiType } from "../../public"

type DataType<Value extends string | number = string> = {
  text: string
  value: Value
}

export type CheckBoxProps<Value extends string | number = string> = BaseMixinProps & {
  value?: Value[]
  onChange?: (checkedValues: Value[]) => void
  data: DataType<Value>[]
  direction?: DirectionType
  disabled?: boolean
  name?: string
  required?: boolean
  label?: string
  allCheck?: boolean
  allCheckText?: string
  error?: boolean
  helperText?: string
  labelProps?: Partial<Omit<LabelProps, "text">>
  onBlur?: FocusEventHandler<HTMLInputElement>
  labelPlacement?: AxisPlacement
  size?: SizeUiType
}

export type CheckBoxSingleProps = BaseMixinProps & {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  required?: boolean
  label?: string
  error?: boolean
  helperText?: string
  labelProps?: Partial<Omit<LabelProps, "text">>
  onBlur?: FocusEventHandler<HTMLInputElement>
  labelPlacement?: AxisPlacement
  size?: SizeUiType
  indeterminate?: boolean
}

type CheckboxItemProps = {
  name?: string
  value: string | number
  text: string
  checked: boolean
  disabled: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  $error?: boolean
  indeterminate?: boolean
  direction?: DirectionType
  onBlur?: FocusEventHandler<HTMLInputElement>
  size?: SizeUiType
  idPrefix: string
}

// * size에 따라 라벨 폰트 크기를 결정
const getFontSize = (s: SizeUiType): string => {
  switch (s) {
    case "S":
      return "7px"
    case "M":
      return "10px"
    case "L":
      return "13px"
    default:
      return "10px"
  }
}

// * labelPlacement를 축 기준(top/bottom/left/right)으로 판별
const getPlacementAxis = (placement?: AxisPlacement) => {
  if (!placement) return "top"
  if (placement.startsWith("top")) return "top"
  if (placement.startsWith("bottom")) return "bottom"
  if (placement.startsWith("left")) return "left"
  if (placement.startsWith("right")) return "right"
  return "top"
}

// * ref 병합 유틸(외부 ref + 내부 ref 동시 연결)
const mergeRefs =
  <T,>(...refs: Array<React.Ref<T> | undefined>) =>
  (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === "function") ref(value)
      else (ref as React.MutableRefObject<T | null>).current = value
    })
  }

/**---------------------------------------------------------------------------/

* ! CheckBox / CheckBoxGroup
*
* * 단일(CheckBox) 및 그룹(CheckBoxGroup) 체크박스 컴포넌트
* * BaseMixin 기반 외부 스타일 확장 지원
* * label / required / helperText / error 상태 표현 지원
* * labelPlacement(top/bottom/left/right) 기반 라벨 배치 지원
* * size(S/M/L) 기반 체크박스 크기 및 라벨 폰트 크기 동기화
*
* * CheckBox (Single)
*   * forwardRef 지원(외부 input 접근)
*   * checked/indeterminate 상태 지원 (indeterminate는 checked=false일 때만 적용)
*   * indeterminate는 input DOM property로 동기화
*
* * CheckBoxGroup
*   * data 목록 기반 다중 체크박스 렌더링
*   * allCheck 옵션으로 전체선택 제공(데이터 2개 이상)
*   * 전체선택 indeterminate는 allCheckRef로 DOM property 제어
*
* @module CheckBox
* @module CheckBoxGroup

/---------------------------------------------------------------------------**/

export const CheckBox = forwardRef<HTMLInputElement, CheckBoxSingleProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      name,
      required,
      label,
      error,
      helperText,
      labelProps,
      onBlur,
      labelPlacement = "top",
      size = "M",
      indeterminate = false,
      ...others
    },
    ref,
  ) => {
    const idPrefix = useId()
    const theme = useTheme()

    const innerRef = useRef<HTMLInputElement | null>(null)

    // * indeterminate 상태를 DOM input 속성으로 동기화
    useEffect(() => {
      if (!innerRef.current) return
      innerRef.current.indeterminate = !!indeterminate && !checked
    }, [indeterminate, checked])

    // * 단일 체크박스 체크 변경을 boolean으로 변환해 전달
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    const axis = getPlacementAxis(labelPlacement)

    return (
      <Box width="100%" sx={{ position: "relative", backgroundColor: "transparent" }} {...others}>
        {label && axis === "top" && (
          <Label text={label} required={required} mb={4} {...labelProps} />
        )}

        <Flex width="fit-content" align="center">
          {label && axis === "left" && (
            <Label text={label} required={required} mr={4} {...labelProps} />
          )}

          <CheckboxItem
            ref={mergeRefs(innerRef, ref)}
            idPrefix={idPrefix}
            name={name}
            value="__single__"
            text=""
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            indeterminate={indeterminate}
            direction="horizontal"
            onBlur={onBlur}
            $error={error}
            size={size}
          />

          {label && axis === "right" && (
            <Label text={label} required={required} ml={4} {...labelProps} />
          )}
        </Flex>

        {label && axis === "bottom" && (
          <Label text={label} required={required} mt={4} {...labelProps} />
        )}
        {error && <HelperText status="error" text={helperText ?? ""} mt={6} />}

        {/* * theme 사용(타입/빌드에서 미사용 제거 방지용이 아니라 실제 사용은 CheckboxItem Typography color) */}
        <span style={{ display: "none" }}>{theme.colors.text.secondary}</span>
      </Box>
    )
  },
)

CheckBox.displayName = "CheckBox"

const CheckBoxGroup = <Value extends string | number>({
  value = [],
  onChange,
  data,
  direction = "horizontal",
  disabled = false,
  name,
  label,
  required,
  allCheck = false,
  allCheckText,
  helperText,
  labelProps,
  error,
  onBlur,
  labelPlacement = "top",
  size = "M",
  ...others
}: CheckBoxProps<Value>) => {
  const idPrefix = useId()
  const theme = useTheme()

  const allValues = useMemo(() => data.map((item) => item.value), [data])
  const shouldRenderAllCheck = allCheck && data.length > 1

  const isAllChecked =
    shouldRenderAllCheck && allValues.every((v) => value.includes(v)) && allValues.length > 0

  const isIndeterminate =
    shouldRenderAllCheck && !isAllChecked && allValues.some((v) => value.includes(v))

  const allCheckRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!allCheckRef.current) return
    allCheckRef.current.indeterminate = isIndeterminate
  }, [isIndeterminate])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedValue = e.target.value as Value
      const isChecked = e.target.checked
      const next = isChecked ? [...value, selectedValue] : value.filter((v) => v !== selectedValue)
      onChange?.(next)
    },
    [onChange, value],
  )

  const handleAllChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked ? allValues : [])
    },
    [onChange, allValues],
  )

  const axis = getPlacementAxis(labelPlacement)
  const isHorizontal = direction === "horizontal"

  return (
    <Box width="100%" sx={{ position: "relative", backgroundColor: "transparent" }} {...others}>
      {label && axis === "top" && <Label text={label} required={required} mb={4} {...labelProps} />}

      <Flex
        width="fit-content"
        height={others.height}
        direction={isHorizontal ? "row" : "column"}
        align={isHorizontal ? "center" : "flex-start"}
        wrap="wrap"
      >
        {label && axis === "left" && (
          <Label text={label} required={required} mr={4} {...labelProps} />
        )}

        {shouldRenderAllCheck && (
          <CheckboxItem
            ref={allCheckRef}
            idPrefix={idPrefix}
            name={name}
            value="__all__"
            text={allCheckText ?? "전체"}
            checked={isAllChecked}
            disabled={disabled}
            onChange={handleAllChange}
            indeterminate={isIndeterminate}
            direction={direction}
            onBlur={onBlur}
            $error={error}
            size={size}
          />
        )}

        {data.map((item) => (
          <CheckboxItem
            key={String(item.value)}
            idPrefix={idPrefix}
            name={name}
            value={item.value}
            text={item.text}
            checked={value.includes(item.value)}
            disabled={disabled}
            onChange={handleChange}
            direction={direction}
            $error={error}
            onBlur={onBlur}
            size={size}
          />
        ))}

        {label && axis === "right" && (
          <Label text={label} required={required} ml={4} {...labelProps} />
        )}
      </Flex>

      {label && axis === "bottom" && (
        <Label text={label} required={required} mt={4} {...labelProps} />
      )}
      {error && <HelperText status="error" text={helperText ?? ""} mt={6} />}

      <span style={{ display: "none" }}>{theme.colors.text.secondary}</span>
    </Box>
  )
}

CheckBoxGroup.displayName = "CheckBoxGroup"

export default CheckBoxGroup

const CheckboxItem = forwardRef<HTMLInputElement, CheckboxItemProps>(
  (
    {
      name,
      value,
      text,
      checked,
      disabled,
      $error,
      onChange,
      onBlur,
      indeterminate,
      direction,
      size,
      idPrefix,
    },
    ref,
  ) => {
    const theme = useTheme()

    const safeName = (name ?? "checkbox").replace(/\s+/g, "-")
    const safeValue = String(value).replace(/\s+/g, "-")
    const id = `${idPrefix}-${safeName}-${safeValue}`

    const isHorizontal = direction === "horizontal"

    return (
      <Flex
        gap="4px"
        mr={isHorizontal ? 12 : 0}
        mb={!isHorizontal ? 12 : 0}
        align="center"
        as="label"
        extraProps={{ htmlFor: id }}
        sx={{
          "&:last-child": {
            marginRight: 0,
            marginBottom: 0,
          },
        }}
      >
        <StyledInput
          id={id}
          ref={ref}
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          $error={$error}
          $size={size}
          data-indeterminate={indeterminate ? "true" : undefined}
        />

        {text ? (
          <Typography
            text={text}
            variant="b2Regular"
            color={theme.colors.text.secondary}
            sx={{ fontSize: getFontSize(size ?? "M") }}
          />
        ) : null}
      </Flex>
    )
  },
)

CheckboxItem.displayName = "CheckboxItem"

// * size에 따른 체크박스 박스/체크 아이콘/indeterminate 바 크기 스타일을 생성
const getSizeStyle = (size?: SizeUiType) => {
  switch (size) {
    case "S":
      return `
        width: 14px;
        height: 14px;

        &::after { background-size: 8px 8px; }
        &[data-indeterminate="true"]::after { width: 8px; height: 1px; }
      `
    case "L":
      return `
        width: 20px;
        height: 20px;

        &::after { background-size: 12px 12px; }
        &[data-indeterminate="true"]::after { width: 12px; height: 2px; }
      `
    case "M":
    default:
      return `
        width: 16px;
        height: 16px;

        &::after { background-size: 10px 10px; }
        &[data-indeterminate="true"]::after { width: 10px; height: 2px; }
      `
  }
}

const StyledInput = styled.input<{ $error?: boolean; $size?: SizeUiType }>`
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  margin: 0;
  transition: all 0.2s ease-in-out;

  ${({ $size }) => getSizeStyle($size)}

  border: 1px solid ${({ theme, $error }) =>
    $error ? theme.colors.error[300] : theme.colors.border.thick};
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.background.default : theme.colors.grayscale.white};

  &:hover {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.border.thick : theme.colors.primary[300]};
  }

  &:not(:checked)[data-indeterminate="true"] {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[400]};
    background-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[400]};
  }

  &:not(:checked)[data-indeterminate="true"]::after {
    content: "";
    display: block;
    background-color: ${({ theme }) => theme.colors.grayscale.white};
    border-radius: ${({ theme }) => theme.borderRadius[1]};
  }

  &:checked {
    border-color: ${({ theme, disabled, $error }) =>
      $error
        ? theme.colors.primary[400]
        : disabled
          ? theme.colors.primary[200]
          : theme.colors.primary[400]};
    background-color: ${({ theme, disabled, $error }) =>
      $error
        ? theme.colors.primary[400]
        : disabled
          ? theme.colors.primary[200]
          : theme.colors.primary[400]};
  }

  &:checked:hover,
  &:not(:checked)[data-indeterminate="true"]:hover {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[300]};
    background-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[300]};
  }

  &:checked::after {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    background-image: url("/icons/CheckBox.svg");
    background-repeat: no-repeat;
    background-position: center;
  }

  &:disabled {
    cursor: not-allowed;
  }
`

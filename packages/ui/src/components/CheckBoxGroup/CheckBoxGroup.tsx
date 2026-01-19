import { ChangeEvent, FocusEventHandler, forwardRef, useEffect, useMemo, useRef } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { DirectionType, AxisPlacement, SizeUiType } from "../../types"
import Label, { LabelProps } from "../Label/Label"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import HelperText from "../HelperText/HelperText"
import { Typography } from "../Typography/Typography"
import { styled } from "../../tokens/customStyled"

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
  error?: boolean
  indeterminate?: boolean
  direction?: DirectionType
  onBlur?: FocusEventHandler<HTMLInputElement>
  size?: SizeUiType
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
*   * checked/indeterminate 상태 지원 (indeterminate는 checked=false일 때만 적용)
*   * indeterminate 속성은 inputRef를 통해 DOM property로 제어
*   * labelPlacement 기준으로 라벨을 체크박스 상/하/좌/우에 배치
*   * error=true일 때 HelperText(error) 렌더링
*
* * CheckBoxGroup
*   * data 목록 기반 다중 체크박스 렌더링
*   * value 배열을 기준으로 체크 상태 계산 및 onChange로 선택값 배열 전달
*   * allCheck 옵션으로 전체선택 체크박스 제공 (데이터 2개 이상일 때만 노출)
*   * 전체선택 상태(isAllChecked) 및 부분선택(indeterminate) 상태 계산
*   * 전체선택 indeterminate는 allCheckRef로 DOM property 제어
*   * direction(horizontal/vertical)에 따라 아이템 간 margin 및 배치 방향 처리
*   * error=true일 때 HelperText(error) 렌더링
*
* * CheckboxItem (internal)
*   * forwardRef로 input ref 전달 (indeterminate 제어 및 외부 접근용)
*   * size에 따라 input 크기 및 after(체크/인디터미네이트) 스타일 분기
*   * checked/indeterminate 상태에 따라 border/background 및 표시 요소(::after) 처리
*   * 체크 상태에서는 svg(체크 이미지) 기반 표시
*
* @module CheckBox
* 단일 체크박스 UI를 제공하며, indeterminate/label/helperText를 지원합니다.
*
* @module CheckBoxGroup
* 여러 체크박스를 그룹으로 제공하며, 전체선택(allCheck) 및 다중 선택 값을 관리합니다.
*
* @usage
* <CheckBox checked={checked} onChange={setChecked} label="Label" />
* <CheckBox indeterminate checked={false} label="Partial" />
* <CheckBoxGroup value={values} data={data} onChange={setValues} allCheck />

/---------------------------------------------------------------------------**/

export const CheckBox = ({
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
}: CheckBoxSingleProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  // * indeterminate 상태를 DOM input 속성으로 동기화
  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.indeterminate = !!indeterminate && !checked
  }, [indeterminate, checked])

  // * 단일 체크박스 체크 변경을 boolean으로 변환해 전달
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked)
  }

  // * 상/하 배치 여부를 placement prefix로 판별
  const isTop = labelPlacement?.startsWith("top")
  const isBottom = labelPlacement?.startsWith("bottom")

  return (
    <Box width="100%" sx={{ position: "relative", backgroundColor: "transparent" }} {...others}>
      {label && isTop && <Label text={label} required={required} mb={4} {...labelProps} />}

      <Flex width="fit-content" align="center">
        {label && labelPlacement === "left" && (
          <Label text={label} required={required} mr={4} {...labelProps} />
        )}

        <CheckboxItem
          ref={inputRef}
          name={name}
          value="__single__"
          text={""}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          indeterminate={indeterminate}
          direction={"horizontal"}
          onBlur={onBlur}
          error={error}
          size={size}
        />

        {label && labelPlacement === "right" && (
          <Label text={label} required={required} ml={4} {...labelProps} />
        )}
      </Flex>

      {label && isBottom && <Label text={label} required={required} mt={4} {...labelProps} />}
      {error && <HelperText status="error" text={helperText ?? ""} mt={6} />}
    </Box>
  )
}

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
  const filteredData = useMemo(() => data.filter((item) => item.value !== null), [data])
  const allValues = useMemo(() => filteredData.map((item) => item.value), [filteredData])

  const shouldRenderAllCheck = allCheck && filteredData.length > 1

  const isAllChecked =
    shouldRenderAllCheck && allValues.every((v) => value.includes(v)) && allValues.length > 0

  const isIndeterminate =
    shouldRenderAllCheck && !isAllChecked && allValues.some((v) => value.includes(v))

  const allCheckRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!allCheckRef.current) return
    allCheckRef.current.indeterminate = isIndeterminate
  }, [isIndeterminate])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value as Value
    const isChecked = e.target.checked
    const newValues = isChecked
      ? [...value, selectedValue]
      : value.filter((v) => v !== selectedValue)
    onChange?.(newValues)
  }

  const handleAllChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked ? allValues : [])
  }

  const isHorizontal = direction === "horizontal"

  return (
    <Box width="100%" sx={{ position: "relative", backgroundColor: "transparent" }} {...others}>
      {label && labelPlacement === "top" && (
        <Label text={label} required={required} mb={4} {...labelProps} />
      )}

      <Flex
        width="fit-content"
        height={others.height}
        direction={isHorizontal ? "row" : "column"}
        align={isHorizontal ? "center" : "flex-start"}
        wrap="wrap"
      >
        {label && labelPlacement === "left" && (
          <Label text={label} required={required} mr={4} {...labelProps} />
        )}

        {shouldRenderAllCheck && (
          <CheckboxItem
            error={error}
            ref={allCheckRef}
            name={name}
            value="__all__"
            text={allCheckText ?? "전체"}
            checked={isAllChecked}
            disabled={disabled}
            onChange={handleAllChange}
            indeterminate={isIndeterminate}
            direction={direction}
            onBlur={onBlur}
            size={size}
          />
        )}

        {filteredData.map((item) => (
          <CheckboxItem
            key={item.value}
            name={name}
            value={item.value}
            text={item.text}
            checked={value.includes(item.value)}
            disabled={disabled}
            onChange={handleChange}
            direction={direction}
            error={error}
            onBlur={onBlur}
            size={size}
          />
        ))}

        {label && labelPlacement === "right" && (
          <Label text={label} required={required} ml={4} {...labelProps} />
        )}
      </Flex>

      {label && labelPlacement === "bottom" && (
        <Label text={label} required={required} mt={4} {...labelProps} />
      )}
      {error && <HelperText status="error" text={helperText ?? ""} mt={6} />}
    </Box>
  )
}

const CheckboxItem = forwardRef<HTMLInputElement, CheckboxItemProps>(
  (
    {
      name,
      value,
      text,
      checked,
      disabled,
      error,
      onChange,
      onBlur,
      indeterminate,
      direction,
      size,
    },
    ref,
  ) => {
    const id = `${name ?? "checkbox"}-${value}`
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
          error={error}
          size={size}
          data-indeterminate={indeterminate ? "true" : undefined}
        />

        {text ? (
          <Typography
            text={text}
            variant="b2Regular"
            color="text.secondary"
            sx={{ fontSize: getFontSize(size ?? "M") }}
          />
        ) : null}
      </Flex>
    )
  },
)

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

const StyledInput = styled.input<{ error?: boolean; size?: SizeUiType }>`
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  margin: 0;
  transition: all 0.2s ease-in-out;

  ${({ size }) => getSizeStyle(size)}

  border: 1px solid
    ${({ theme, error }) => (error ? theme.colors.error[300] : theme.colors.border.thick)};
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
    border-color: ${({ theme, disabled, error }) =>
      error
        ? theme.colors.primary[400]
        : disabled
          ? theme.colors.primary[200]
          : theme.colors.primary[400]};
    background-color: ${({ theme, disabled, error }) =>
      error
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

CheckboxItem.displayName = "CheckboxItem"
CheckBoxGroup.displayName = "CheckBoxGroup"

export default CheckBoxGroup

import { ChangeEvent, FocusEventHandler, forwardRef, useEffect, useRef } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { DirectionType, LabelPlacement, SizeUiType } from "../../types"
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
  labelPlacement?: LabelPlacement
  size?: SizeUiType
}

type CheckboxItemProps = {
  name?: string
  value: string | number
  text: string
  checked: boolean
  disabled: boolean
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helperText?: string
  indeterminate?: boolean
  direction?: DirectionType
  onBlur?: FocusEventHandler<HTMLInputElement>
  size?: SizeUiType
}
/**
 * @module CheckBoxGroup
 * 여러 개의 체크박스를 그룹화한 컴포넌트로, 개별 체크박스 선택 및 전체선택 기능을 제공합니다.
 * 수평(horizontal) 또는 수직(vertical) 방향 배치를 지원하며, 라벨, 헬퍼 텍스트, 에러 메시지 표시가 가능합니다.
 *
 * - data 배열을 기반으로 체크박스 항목을 렌더링
 * - value 배열로 선택된 체크박스 값을 관리하며 onChange로 변경 통지
 * - 전체선택(allCheck) 기능으로 모든 항목 선택/해제 가능
 * - 전체선택 체크박스는 2개 이상의 항목이 있을 때만 렌더링
 * - 전체선택 체크박스는 선택 상태와 일부 선택 상태(indeterminate)를 반영
 * - disabled, error 상태에 따른 UI 변화 지원
 * - name, required, label, helperText, labelProps 등 폼 UI 관련 옵션 제공
 * - onBlur 이벤트 지원으로 폼 유효성 검사와 연동 가능
 *
 * @props
 * - value: 선택된 체크박스 값 배열
 * - onChange: 체크 상태 변경 시 호출되는 콜백 (선택된 값 배열 전달)
 * - data: 체크박스 항목 배열 ({ text, value } 구조)
 * - direction: 체크박스 배치 방향 ("horizontal" | "vertical")
 * - disabled: 전체 체크박스 비활성화 여부
 * - name: 각 체크박스 input name 속성
 * - required: 필수 표기 여부
 * - label: 그룹 상단 라벨 텍스트
 * - allCheck: 전체선택 체크박스 활성화 여부
 * - allCheckText: 전체선택 체크박스 텍스트 지정
 * - error: 에러 상태 여부
 * - helperText: 에러 또는 안내 텍스트
 * - labelProps: Label 컴포넌트에 추가 전달할 props
 * - onBlur: 체크박스 onBlur 이벤트 핸들러
 * - labelPlacement : Label 컴포넌트 위치 변경
 *
 * @usage
 * <CheckBoxGroup
 *   label="선택하세요"
 *   name="options"
 *   value={selectedValues}
 *   onChange={setSelectedValues}
 *   data={[{ text: "옵션1", value: "1" }, { text: "옵션2", value: "2" }]}
 *   direction="vertical"
 *   allCheck
 *   allCheckText="모두 선택"
 * />
 */

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
  size,
  ...others
}: CheckBoxProps<Value>) => {
  const filteredData = data.filter((item) => item.value !== null)
  const allValues = filteredData.map((item) => item.value)

  // * 전체선택 체크박스 렌더링 조건(allCheck 활성 & 데이터 2개 이상)
  const shouldRenderAllCheck = allCheck && filteredData.length > 1

  // * 전체선택 체크 여부 계산
  const isAllChecked =
    shouldRenderAllCheck && allValues.every((v) => value.includes(v)) && allValues.length > 0

  // * 일부만 선택되어 있을 경우 인디터미네이트 상태
  const isIndeterminate =
    shouldRenderAllCheck && !isAllChecked && allValues.some((v) => value.includes(v))

  // * 전체선택 체크박스 참조 (indeterminate 속성 제어용)
  const allCheckRef = useRef<HTMLInputElement | null>(null)

  // * indeterminate 상태 반영
  useEffect(() => {
    if (allCheckRef.current) {
      allCheckRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  // *  개별 체크박스 변경 이벤트 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value as Value
    const isChecked = e.target.checked
    const newValues = isChecked
      ? [...value, selectedValue]
      : value.filter((v) => v !== selectedValue)
    onChange?.(newValues)
  }

  // * 전체선택 체크박스 변경 이벤트 핸들러
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
        align="center"
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
      size = "M",
    },
    ref,
  ) => {
    const id = `${name}-${value}`

    // *  size에 따라  결정되는 함수
    const getFontSize = (size: SizeUiType): string => {
      switch (size) {
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
    return (
      <Flex
        gap="4px"
        mr={direction === "horizontal" ? 12 : 0}
        mb={direction === "vertical" ? 12 : 0}
        align="center"
        as="label"
        extraProps={{ htmlFor: id }}
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
        <Typography
          text={text}
          variant="b2Regular"
          color="text.secondary"
          sx={{ fontSize: getFontSize(size) }}
        />
      </Flex>
    )
  },
)

const getSizeStyle = (size?: SizeUiType) => {
  switch (size) {
    case "S":
      return `
        width: 14px;
        height: 14px;
        
        &::after {
          background-size: 8px 8px;
        }

        &[data-indeterminate="true"]::after {
          width: 8px;
          height: 1px;
        }
      `
    case "L":
      return `
        width: 20px;
        height: 20px;

        &::after {
          background-size: 12px 12px;
        }

        &[data-indeterminate="true"]::after {
          width: 12px;
          height: 2px;
        }
      `
    case "M":
    default:
      return `
        width: 16px;
        height: 16px;

        &::after {
          background-size: 10px 10px;
        }

        &[data-indeterminate="true"]::after {
          width: 10px;
          height: 2px;
        }
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
    ${({ theme, error }) => (error ? theme.colors.primary[400] : theme.colors.border.thick)};
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

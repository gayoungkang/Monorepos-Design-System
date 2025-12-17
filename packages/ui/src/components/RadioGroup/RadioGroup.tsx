import { ChangeEvent } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { DirectionType, AxisPlacement, SizeUiType } from "../../types"
import Label, { LabelProps } from "../Label/Label"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import HelperText from "../HelperText/HelperText"
import { styled } from "../../tokens/customStyled"

export type DataType<Value extends string | number> = {
  text: string
  value: Value
}

type RadioButtonGroupProps<Value extends string | number> = BaseMixinProps & {
  value?: Value
  onChange?: (value: Value) => void
  data: DataType<Value>[]
  direction?: DirectionType
  disabled?: boolean
  name?: string
  label?: string
  required?: boolean
  error?: boolean
  helperText?: string
  labelProps?: Partial<Omit<LabelProps, "text">>
  labelPlacement?: AxisPlacement
  size?: SizeUiType
}
/**
 * @module RadioGroup
 * 커스텀 라디오 버튼 그룹 컴포넌트로, 방향 설정(`horizontal`, `vertical`)과 라벨, 헬퍼텍스트, 에러 메시지 등을 지원합니다.
 * 라디오 선택 시 `value`를 전달하고, BaseMixinProps로 스타일 확장 가능합니다.
 *
 * - direction에 따라 라디오 항목의 배치를 가로/세로 전환 가능
 * - `BaseMixin` 기반 스타일 확장 지원
 * - Label, HelperText 컴포넌트와 연동
 * - 오류 상태 및 비활성화 상태 지원
 *
 * @props
 * - value: 선택된 라디오의 값
 * - onChange: 선택 변경 시 호출되는 콜백
 * - data: 렌더링할 라디오 항목 배열 (text + value 구조)
 * - direction: 배치 방향 ("horizontal" | "vertical")
 * - disabled: 전체 라디오 비활성화 여부
 * - name: 각 라디오 인풋의 name 속성
 * - label: 상단 라벨 텍스트
 * - required: 필수 표기 여부
 * - error: 에러 상태 여부
 * - helperText: 에러 또는 설명 텍스트
 * - labelProps: Label 컴포넌트에 전달할 추가 props
 * - labelPlacement : Label 컴포넌트 위치 변경
 *
 * @사용법
 * <RadioGroup
 *   label="선택하세요"
 *   name="gender"
 *   value={selected}
 *   onChange={setSelected}
 *   data={[{ text: "남", value: "male" }, { text: "여", value: "female" }]}
 *   direction="horizontal"
 * />
 */
const RadioGroup = <Value extends string | number>({
  value: controlledValue,
  onChange,
  data,
  direction = "horizontal",
  disabled = false,
  name,
  label,
  required,
  error,
  helperText,
  labelProps,
  labelPlacement = "top",
  size = "M",
  ...others
}: RadioButtonGroupProps<Value>) => {
  // * 라디오 선택 시 값 업데이트 핸들러
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value as Value
    onChange?.(selectedValue)
  }

  const isHorizontal = direction === "horizontal"

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

  // * 라벨 위치 렌더링 함수
  const renderLabel = (position: "top" | "bottom") => {
    const isTop = labelPlacement.startsWith("top")
    const isBottom = labelPlacement.startsWith("bottom")
    const align = labelPlacement.endsWith("start") ? "flex-start" : "flex-end"

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
    <Box width="100%" sx={{ position: "relative", backgroundColor: "transparent" }} {...others}>
      {renderLabel("top")}

      <Flex
        width="fit-content"
        align="center"
        direction={isHorizontal ? "row" : "column"}
        wrap="wrap"
      >
        {label && labelPlacement === "left" && (
          <Label text={label} required={required} mr={4} {...labelProps} />
        )}
        {data.map((item) => {
          const isChecked = controlledValue === item.value
          return (
            <Flex
              key={item.value}
              gap="4px"
              mr={isHorizontal ? 12 : 0}
              mb={isHorizontal ? 0 : 12}
              height={others.height}
              align="center"
            >
              <StyledRadio
                size={size}
                type="radio"
                name={name}
                value={item.value}
                checked={isChecked}
                onChange={handleChange}
                disabled={disabled}
                error={error}
              />
              <Typography
                text={item.text}
                variant="b2Regular"
                color="text.secondary"
                sx={{ fontSize: getFontSize(size ?? "M") }}
              />
            </Flex>
          )
        })}
        {label && labelPlacement === "right" && (
          <Label text={label} required={required} ml={4} {...labelProps} />
        )}
      </Flex>
      {renderLabel("bottom")}
      {error && <HelperText status="error" text={helperText ?? ""} mt={6} />}
    </Box>
  )
}

const getSizeStyle = (size?: SizeUiType) => {
  switch (size) {
    case "S":
      return `
          width: 14px;
          height: 14px;

          &::after {
            width: 4px;
            height: 4px;
          }

             &:checked::after {
            width: 4px;
            height: 4px;
            }
        `
    case "L":
      return `
          width: 20px;
          height: 20px;
  
          &::after {
            width: 9px;
            height: 0px;
          }
               &:checked::after {
            width: 9px;
            height: 9px;
            }
        `
    case "M":
    default:
      return `
          width: 16px;
          height: 16px;
  
          &::after {
            width: 6px;
            height: 6px;
          }
            
          &:checked::after {
            width: 6px;
            height: 6px;
            }
        `
  }
}

const StyledRadio = styled.input<{ size?: SizeUiType; error?: boolean }>`
  margin: 0;
  appearance: none;
  border: 1px solid
    ${({ theme, error }) => (error ? theme.colors.error[300] : theme.colors.border.thick)};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  width: 16px;
  height: 16px;
  ${({ size }) => getSizeStyle(size)}

  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.background.default : theme.colors.grayscale.white};

  &:checked {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[400]};
    background-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[400]};
  }

  &:checked:hover {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[300]};
    background-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[300]};
  }

  &:hover {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.border.thick : theme.colors.primary[200]};
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: ${({ theme }) => theme.colors.grayscale.white};
    border-radius: 50%;
    transform: translate(-50%, -50%);

    transition:
      width 0.4s ease,
      height 0.4s ease;
  }

  &:disabled {
    cursor: not-allowed;
  }
`

export default RadioGroup

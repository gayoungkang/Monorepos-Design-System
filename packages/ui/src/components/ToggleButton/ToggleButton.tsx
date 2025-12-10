import { DirectionType, LabelPlacement, SizeUiType } from "@acme/ui/types"
import { BaseMixinProps } from "../tokens/baseMixin"
import { IconName } from "../Icon/icon-loader"
import Label, { LabelProps } from "../Label/Label"
import Icon, { IconProps } from "../Icon/Icon"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { theme } from "../tokens/theme"
import { Typography } from "../Typography/Typography"
import { styled } from "../tokens/customStyled"

export type ToggleButtonProps = BaseMixinProps & {
  orientation?: DirectionType
  buttons: { icon?: IconName; label?: string; value: string }[]
  size?: SizeUiType
  selectedValue: string
  onClick: (value: string) => void
  label?: string
  disabled?: boolean
  required?: boolean
  labelProps?: Partial<Omit<LabelProps, "text">>
  iconProps?: Partial<Omit<IconProps, "name">>
  labelPlacement?: LabelPlacement
}
/**
 * @module ToggleButton
 * 여러 개의 버튼을 선택할 수 있는 토글 버튼 컴포넌트로, 각 버튼은 텍스트와 아이콘을 포함할 수 있습니다.
 * 선택된 버튼의 상태를 스타일로 반영하며, 버튼의 크기와 선택된 값에 따른 스타일 변형을 지원합니다.
 *
 * - `selectedValue`에 따라 선택된 버튼 스타일 적용
 * - 텍스트 버튼과 아이콘 버튼을 함께 지원
 * - `size` 속성으로 버튼 크기 조정 가능
 * - 버튼 클릭 시 `onClick` 콜백 호출
 * - `disabled` 상태에서 버튼 비활성화
 * - `required`로 필수 항목 표시 가능
 * - 다양한 버튼 텍스트와 아이콘 스타일 적용 가능
 *
 * @props
 * - buttons : 버튼 배열 [{ icon?: 아이콘 이름, label?: 텍스트, value: 값 }]
 * - size : 버튼 크기 ("S", "M", "L")
 * - selectedValue : 선택된 버튼의 value
 * - onClick : 버튼 클릭 시 호출되는 콜백 함수
 * - label : 토글 버튼 그룹의 라벨
 * - disabled : 비활성화 상태 여부
 * - required : 필수 항목 여부
 * - labelProps : Label 컴포넌트에 전달되는 프로퍼티
 * - iconProps : Icon 컴포넌트에 전달되는 프로퍼티
 * - labelPlacement : Label 컴포넌트 위치 변경
 *
 * @사용법
 * <ToggleButton
 *  buttons={[
 *    { label: "Option 1", value: "1" },
 *    { label: "Option 2", value: "2" },
 *    { label: "Option 3", value: "3" },
 *  ]}
 *  selectedValue="1"
 *  onClick={(value) => console.log(value)}
 *  label="Select Option"
 *  disabled={false}
 * />
 */

const ToggleButton = ({
  orientation = "horizontal",
  buttons,
  selectedValue,
  onClick,
  label,
  disabled,
  required,
  labelProps,
  iconProps,
  size = "M",
  labelPlacement = "top",
  ...others
}: ToggleButtonProps) => {
  // * size에 따라 icon size 및 font size 결정되는 함수
  const getSize = (size: SizeUiType): string => {
    switch (size) {
      case "S":
        return "5px"
      case "M":
        return "7px"
      case "L":
        return "9px"
      default:
        return "7px"
    }
  }

  // * 라벨 위치 렌더링 함수
  const renderLabel = (position: "top" | "bottom") => {
    if (!label) return null

    if (labelPlacement === position) {
      return (
        <Flex justify="start">
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
    <Box {...others}>
      {renderLabel("top")}
      <Flex
        direction={orientation === "horizontal" ? "row" : "column"}
        align="center"
        width={"fit-content"}
        p={"2px"}
        sx={{
          borderRadius: theme.borderRadius[4],
          backgroundColor: theme.colors.grayscale[200],
        }}
      >
        {labelPlacement === "left" && (
          <Label text={label ?? ""} required={required} mr={4} {...labelProps} />
        )}
        {buttons.map(({ label, value, icon }) => (
          <StyledButton
            key={value}
            selected={selectedValue === value}
            onClick={() => onClick(value)}
            size={size}
            disabled={disabled}
          >
            {label && (
              <Typography
                variant={selectedValue === value ? "b2Medium" : "b2Regular"}
                color={
                  disabled
                    ? "text.disabled"
                    : selectedValue === value
                      ? "text.secondary"
                      : "text.tertiary"
                }
                text={label}
                sx={{ fontSize: getSize(size) }}
              />
            )}
            {icon && (
              <Icon
                color={
                  disabled
                    ? theme.colors.text.disabled
                    : selectedValue === value
                      ? theme.colors.text.secondary
                      : theme.colors.text.tertiary
                }
                name={icon}
                size={getSize(size)}
                {...iconProps}
              />
            )}
          </StyledButton>
        ))}
        {labelPlacement === "right" && (
          <Label text={label ?? ""} required={required} ml={4} {...labelProps} />
        )}
      </Flex>
      {renderLabel("bottom")}
    </Box>
  )
}

const StyledButton = styled.button<{
  selected: boolean
  size?: SizeUiType
  disabled?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: cneter;
  padding: ${({ size }) =>
    size === "S" ? "3px 9px" : size === "M" ? "5px 15px" : size === "L" ? "7px 21px" : "5px 15px"};
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  background-color: ${({ selected }) => (selected ? theme.colors.grayscale.white : "transparent")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s;
`

export default ToggleButton

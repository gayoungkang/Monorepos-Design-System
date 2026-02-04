import { BaseMixin } from "../../tokens/baseMixin"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import Label from "../Label/Label"
import type { LabelProps } from "../Label/Label"
import Icon from "../Icon/Icon"
import type { IconProps } from "../Icon/Icon"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { theme } from "../../tokens/theme"
import { Typography } from "../Typography/Typography"
import { styled } from "../../tokens/customStyled"
import type { IconName } from "../Icon/icon-types"
import type { DirectionType } from "../../types/layout"
import type { SizeUiType } from "../../types/ui"

export type ToggleButtonItem<Value extends string | number = string> = {
  startIcon?: IconName
  endIcon?: IconName
  label?: string
  value: Value
  disabled?: boolean
}

export type ToggleButtonProps<Value extends string | number = string> = BaseMixinProps & {
  orientation?: DirectionType
  buttons: ToggleButtonItem<Value>[]
  size?: SizeUiType
  selectedValue: Value
  onClick: (value: Value) => void
  label?: string
  disabled?: boolean
  required?: boolean
  labelProps?: Partial<Omit<LabelProps, "text">>
  iconProps?: Partial<Omit<IconProps, "name">>
}

const sizeMap: Record<
  SizeUiType,
  {
    padding: string
    fontSize: string
    iconSize: string
    gap: string
  }
> = {
  S: { padding: "3px 9px", fontSize: "12px", iconSize: "14px", gap: "4px" },
  M: { padding: "5px 15px", fontSize: "14px", iconSize: "16px", gap: "6px" },
  L: { padding: "7px 21px", fontSize: "16px", iconSize: "18px", gap: "8px" },
}
/**---------------------------------------------------------------------------/
 *
 * ! ToggleButton
 *
 * * 복수의 버튼 아이템 중 하나를 선택하는 토글 버튼 그룹 컴포넌트입니다.
 * * `selectedValue`를 기준으로 선택 상태를 계산하며, 클릭 시 선택된 아이템의 `value`를 `onClick`으로 전달합니다.
 * * `orientation`에 따라 수평/수직 배치를 지원하며, 그룹 단위 `disabled` 및 아이템 단위 `disabled`를 함께 처리합니다.
 * * 각 아이템은 startIcon / label / endIcon 구성을 지원하며, size(S/M/L)에 따른 패딩/폰트/아이콘 크기/간격을 적용합니다.
 * * 상단 라벨(label) 표시 및 required(*) 표시를 지원합니다.
 * * BaseMixin 기반 외부 스타일 확장 지원 및 theme 토큰 기반 스타일링을 사용합니다.
 *
 * * 동작 규칙
 *   * 선택 상태:
 *     * `selected = selectedValue === btn.value`로 계산합니다.
 *     * 선택된 아이템은 배경색을 white로 설정하여 강조합니다.
 *   * 비활성화:
 *     * 그룹 disabled(`disabled`) 또는 아이템 disabled(`btn.disabled`) 중 하나라도 true면 해당 아이템은 비활성화됩니다.
 *     * 비활성화 아이템은 `disabled` 속성을 부여하고, onClick을 바인딩하지 않습니다.
 *     * 그룹 disabled 시 `aria-disabled`를 group에 부여합니다.
 *   * 클릭:
 *     * 비활성화가 아니면 `onClick(btn.value)`를 호출합니다.
 *   * 접근성:
 *     * 그룹 컨테이너: `role="group"`
 *     * 아이템 버튼: `aria-pressed={selected}`로 토글 상태를 노출합니다.
 *
 * * 스타일 규칙
 *   * sizeMap:
 *     * S/M/L에 따라 `padding/fontSize/iconSize/gap` 값을 고정 매핑합니다.
 *     * 아이콘 크기는 sizeMap에서 계산하여 Icon에 전달합니다(상위 계산 규칙 준수: 이 컴포넌트가 상위).
 *   * ToggleRoot(그룹 래퍼):
 *     * inline-flex + orientation에 따른 flex-direction(row/column)
 *     * 배경: grayscale[200], radius: borderRadius[4], padding: 2px
 *     * 그룹 disabled 시 opacity 0.8 적용
 *   * ToggleItemButton(아이템):
 *     * 선택 시 배경: grayscale.white, 비선택 시 transparent
 *     * disabled 시 cursor not-allowed + opacity 0.6
 *     * focus-visible 시 primary[200] 링(2px) 적용
 *   * 텍스트/아이콘 색상:
 *     * itemDisabled: text.disabled
 *     * selected: text.secondary
 *     * default: text.tertiary
 *     * 동일 색상을 Icon/TYpography에 적용하여 일관성 유지
 *
 * * 데이터/props 계약
 *   * 필수:
 *     * `buttons`: ToggleButtonItem[] (value 포함)
 *     * `selectedValue`: 현재 선택 값
 *     * `onClick`: 선택 변경 핸들러
 *   * 선택:
 *     * `orientation`: horizontal | vertical
 *     * `size`: S | M | L
 *     * `disabled`: 그룹 비활성화
 *     * `label/required/labelProps`: 상단 라벨 제어
 *     * `iconProps`: Icon 공통 props 전달(단, name 제외)
 *
 * @module ToggleButton
 * 단일 선택 토글 버튼 그룹 컴포넌트입니다.
 *
 * @usage
 * <ToggleButton
 *   label="정렬"
 *   buttons={[{ label: "A", value: "a" }, { label: "B", value: "b" }]}
 *   selectedValue="a"
 *   onClick={(v) => setV(v)}
 * />
 *
/---------------------------------------------------------------------------**/

const ToggleButton = <Value extends string | number = string>({
  orientation = "horizontal",
  buttons,
  selectedValue,
  onClick,
  label,
  disabled = false,
  required,
  labelProps,
  iconProps,
  size = "M",
  ...others
}: ToggleButtonProps<Value>) => {
  const { fontSize, iconSize, gap } = sizeMap[size]

  return (
    <Box {...others}>
      {label && <Label text={label} required={required} mb={4} {...labelProps} />}

      <ToggleRoot
        role="group"
        aria-disabled={disabled || undefined}
        $orientation={orientation}
        $disabled={disabled}
      >
        {buttons.map((btn) => {
          const selected = selectedValue === btn.value
          const itemDisabled = disabled || !!btn.disabled

          const color = itemDisabled
            ? theme.colors.text.disabled
            : selected
              ? theme.colors.text.secondary
              : theme.colors.text.tertiary

          return (
            <ToggleItemButton
              key={String(btn.value)}
              type="button"
              aria-pressed={selected}
              disabled={itemDisabled}
              $selected={selected}
              $size={size}
              $disabled={itemDisabled}
              onClick={itemDisabled ? undefined : () => onClick(btn.value)}
            >
              <Flex align="center" gap={gap}>
                {btn.startIcon && (
                  <Icon name={btn.startIcon} size={iconSize} color={color} {...iconProps} />
                )}

                {btn.label && (
                  <Typography
                    variant={selected ? "b2Medium" : "b2Regular"}
                    color={color}
                    text={btn.label}
                    sx={{ fontSize, lineHeight: 1 }}
                  />
                )}

                {btn.endIcon && (
                  <Icon name={btn.endIcon} size={iconSize} color={color} {...iconProps} />
                )}
              </Flex>
            </ToggleItemButton>
          )
        })}
      </ToggleRoot>
    </Box>
  )
}

ToggleButton.displayName = "ToggleButton"

const ToggleRoot = styled.div<
  {
    $orientation: DirectionType
    $disabled: boolean
  } & BaseMixinProps
>`
  ${BaseMixin};
  width: fit-content;
  display: inline-flex;
  gap: 4px;
  flex-direction: ${({ $orientation }) => ($orientation === "horizontal" ? "row" : "column")};
  align-items: center;
  padding: 2px;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  background-color: ${({ theme }) => theme.colors.grayscale[200]};
  opacity: ${({ $disabled }) => ($disabled ? 0.8 : 1)};
`

const ToggleItemButton = styled.button<{
  $selected: boolean
  $size: SizeUiType
  $disabled: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: ${({ $size }) => sizeMap[$size].padding};
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  border: 0;
  outline: 0;

  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.grayscale.white : "transparent"};

  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;

  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[200]};
  }
`

export default ToggleButton

import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { IconName } from "../Icon/icon-loader"
import { SizeUiType, VariantUiType } from "../../types"
import Icon, { IconProps } from "../Icon/Icon"
import { Typography, TypographyProps } from "../Typography/Typography"
import IconButton from "../IconButton/IconButton"
import { styled } from "../../tokens/customStyled"
import { COMMON_PARENTS_ELEMENT_ZINDEX } from "../../types/zindex"
import { theme } from "../../tokens/theme"

export type ChipProps = BaseMixinProps & {
  label: string
  onClick?: () => void
  onDelete?: () => void
  startIcon?: IconName
  endIcon?: IconName
  size?: SizeUiType
  color?: string
  disabled?: boolean
  variant?: VariantUiType
  iconProps?: Partial<Omit<IconProps, "name">>
  typographyProps?: Partial<TypographyProps>
}
/**
 * @module Chip
 * 텍스트와 아이콘을 포함한 태그형 UI 컴포넌트입니다. 선택/삭제 등의 사용자 상호작용을 지원하며 다양한 스타일과 상태를 표현할 수 있습니다.
 *
 * - `BaseMixin` 기반 공통 스타일 확장
 * - 라벨 + 시작/끝 아이콘 + 삭제 아이콘 구성
 * - `contained`, `text`, `outlined` variant 지원
 * - disabled 상태 처리 지원
 *
 * @props
 * - label: 표시할 텍스트
 * - onClick: Chip 클릭 핸들러
 * - onDelete: 삭제 아이콘 클릭 핸들러
 * - startIcon: Chip 시작 아이콘 (선택)
 * - endIcon: Chip 끝 아이콘 (선택)
 * - size: Chip 크기 (`S`, `M`)
 * - color: 배경 또는 테두리 색상 테마 (선택)
 * - disabled: 비활성화 여부
 * - variant: 스타일 변형 (`contained`, `outlined`, `text`)
 * - iconProps: 내부 아이콘에 전달할 추가 props
 * - typographyProps: Typography에 전달할 추가 props
 *
 * @사용법
 * <Chip
 *   label="디자인"
 *   startIcon="TagLine"
 *   onDelete={() => {}}
 *   onClick={() => {}}
 *   variant="outlined"
 * />
 */

const Chip = ({
  label,
  onClick,
  onDelete,
  startIcon,
  endIcon,
  size = "M",
  color = "normal",
  disabled = false,
  variant = "contained",
  iconProps,
  typographyProps,
  ...others
}: ChipProps) => {
  // * size에 따라 icon size 및 font size 결정되는 함수
  const getSize = (size: SizeUiType): string => {
    switch (size) {
      case "S":
        return "8px"
      case "M":
        return "10px"
      case "L":
        return "12px"
      default:
        return "7px"
    }
  }

  return (
    <ChipWrapper
      clickable={!!onClick}
      size={size}
      color={color}
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      {...others}
    >
      {startIcon && (
        <Icon
          size={getSize(size)}
          color={variant === "contained" ? theme.colors.grayscale.white : theme.colors.primary[400]}
          name={startIcon}
          {...iconProps}
        />
      )}

      <Typography
        text={label}
        color={variant === "contained" ? theme.colors.grayscale.white : theme.colors.primary[400]}
        variant="b2Regular"
        sx={{ fontSize: getSize(size) }}
        {...typographyProps}
      />

      {endIcon && (
        <Icon
          size={getSize(size)}
          color={variant === "contained" ? theme.colors.grayscale.white : theme.colors.primary[400]}
          name={endIcon}
          {...iconProps}
        />
      )}

      {onDelete && (
        <IconButton
          onClick={onDelete}
          icon="CloseCircleFill"
          size={getSize(size)}
          disabled={disabled}
          disableInteraction
          color={variant === "contained" ? theme.colors.grayscale.white : theme.colors.primary[400]}
          p="0"
          {...iconProps}
        />
      )}
    </ChipWrapper>
  )
}

const ChipWrapper = styled.div<{
  clickable: boolean
  size: SizeUiType
  color: string
  disabled: boolean
  variant: VariantUiType
}>`
  ${({ theme }) => BaseMixin({ theme } as BaseMixinProps)}
  position: relative;
  z-index: ${COMMON_PARENTS_ELEMENT_ZINDEX};
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: ${({ theme }) => theme.borderRadius[16]};
  padding: ${({ size }) =>
    size === "S" ? "2px 9px" : size === "M" ? "5px 12px" : size === "L" ? "8px 21px" : "5px 12px"};
  user-select: none;
  cursor: ${({ clickable, disabled }) =>
    disabled ? "not-allowed" : clickable ? "pointer" : "default"};

  ${({ variant, theme, disabled }) => {
    const colors = theme.colors

    switch (variant) {
      case "contained":
        return `
          background-color: ${disabled ? colors.text.disabled : colors.primary[400]};
          border: none;
        `
      case "text":
        return `
          background-color: transparent;
          border: none;
        `
      case "outlined":
        return `
          background-color: transparent;
          border: 1px solid ${disabled ? colors.text.disabled : colors.primary[400]};
        `
      default:
        return ""
    }
  }}
`

export default Chip

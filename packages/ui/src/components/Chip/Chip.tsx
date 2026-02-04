import type { MouseEvent } from "react"
import { useMemo } from "react"
import { useTheme } from "styled-components"
import { BaseMixin, type BaseMixinProps } from "../../tokens/baseMixin"
import Icon, { type IconProps } from "../Icon/Icon"
import { Typography, type TypographyProps } from "../Typography/Typography"
import IconButton from "../IconButton/IconButton"
import { styled } from "../../tokens/customStyled"
import { COMMON_PARENTS_ELEMENT_ZINDEX } from "../../types/zindex"
import type { IconName } from "../Icon/icon-types"
import type { SizeUiType, VariantUiType } from "../../types/ui"

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

// * size에 따라 icon size 및 font size 결정
const getSizePx = (size: SizeUiType): string => {
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

// * variant/disabled/color 기반으로 텍스트/아이콘 색상 결정
const resolveContentColor = (
  theme: ReturnType<typeof useTheme>,
  variant: VariantUiType,
  disabled: boolean,
  color?: string,
) => {
  if (disabled) return theme.colors.text.disabled
  if (variant === "contained") return theme.colors.grayscale.white
  return color ?? theme.colors.primary[400]
}
/**---------------------------------------------------------------------------/
 *
 * ! Chip
 *
 * * 라벨과 아이콘(좌/우), 삭제 액션을 조합해 표시하는 인라인 태그(Chip) 컴포넌트
 * * `variant(contained|text|outlined)` + `disabled` + `color` 조합으로 배경/보더 및 콘텐츠(텍스트/아이콘) 색상을 결정
 * * `onClick`이 있으면 클릭 가능한 Chip으로 동작하며, `onDelete`가 있으면 삭제 버튼을 추가로 렌더링
 *
 * * 동작 규칙
 *   * 클릭 처리
 *     * `disabled`면 Chip 클릭을 차단(`onClick` 미전달)
 *     * `onClick`이 있으면 클릭 가능 상태로 렌더링(cursor: pointer)
 *   * 삭제 처리
 *     * `onDelete`가 있을 때만 삭제 아이콘 버튼을 렌더링
 *     * 삭제 버튼 클릭 시 `stopPropagation()`으로 Chip 클릭 버블링을 차단한 뒤 `onDelete?.()` 호출
 *     * `disabled`면 삭제 동작도 차단
 *
 * * 레이아웃/스타일 관련 규칙
 *   * Wrapper
 *     * inline-flex 중앙 정렬 + gap(4px) + nowrap + user-select:none
 *     * z-index는 `COMMON_PARENTS_ELEMENT_ZINDEX`로 상위 레이어에서 안정적으로 클릭 가능하도록 보정
 *   * size
 *     * `getSizePx(size)`로 라벨 폰트/아이콘 크기를 S/M/L에 따라 px 문자열로 결정
 *     * padding은 size별 프리셋을 Wrapper에서 적용
 *   * 콘텐츠 색상
 *     * `resolveContentColor(theme, variant, disabled, color)`
 *       * disabled → text.disabled
 *       * contained → white
 *       * 그 외(text/outlined) → color(지정 시) 또는 primary[400]
 *   * variant 스타일
 *     * contained: 배경색(resolved) 또는 disabled 시 text.disabled, 보더 없음
 *     * text: 배경/보더 없음(투명)
 *     * outlined: 투명 배경 + 1px 보더(resolved) 또는 disabled 시 text.disabled
 *   * 커서 규칙
 *     * disabled → not-allowed
 *     * enabled + clickable(onClick 존재) → pointer
 *     * enabled + not clickable → default
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `label`은 Typography로 렌더링되며, `typographyProps`로 세부 스타일 확장 가능
 *     * `startIcon/endIcon`은 IconName 기반이며, `iconProps`로 아이콘 공통 옵션 확장
 *     * `color`는 variant(text/outlined)의 콘텐츠/보더 기준 색상이며, contained에서는 배경 기준 색상으로 사용
 *   * 내부 계산 로직
 *     * contentColor/sizePx는 useMemo로 계산하여 불필요한 재계산을 최소화
 *
 * @module Chip
 * 라벨/아이콘/삭제 액션을 조합해 표시하는 태그(Chip) 컴포넌트
 *
 * @usage
 * <Chip label="Tag" onClick={() => {}} />
 * <Chip label="Deletable" onDelete={() => {}} variant="outlined" />
 * <Chip label="Icon" startIcon="Check" endIcon="ArrowRight" size="S" />
 *
/---------------------------------------------------------------------------**/

const Chip = ({
  label,
  onClick,
  onDelete,
  startIcon,
  endIcon,
  size = "M",
  color,
  disabled = false,
  variant = "contained",
  iconProps,
  typographyProps,
  ...others
}: ChipProps) => {
  const theme = useTheme()

  const contentColor = useMemo(
    () => resolveContentColor(theme, variant, disabled, color),
    [theme, variant, disabled, color],
  )

  const sizePx = useMemo(() => getSizePx(size), [size])

  // * 삭제 클릭 시 Chip 클릭 버블링 방지 후 onDelete 실행
  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    onDelete?.()
  }

  return (
    <ChipWrapper
      $clickable={!!onClick}
      $size={size}
      $color={color}
      onClick={disabled ? undefined : onClick}
      $disabled={disabled}
      $variant={variant}
      {...others}
    >
      {startIcon && (
        <Icon size={sizePx} color={contentColor as `#${string}`} name={startIcon} {...iconProps} />
      )}

      <Typography
        text={label}
        color={contentColor}
        variant="b2Regular"
        sx={{ fontSize: sizePx }}
        {...typographyProps}
      />

      {endIcon && (
        <Icon size={sizePx} color={contentColor as `#${string}`} name={endIcon} {...iconProps} />
      )}

      {onDelete && (
        <IconButton
          onClick={handleDelete}
          variant="text"
          icon="CloseLine"
          size={sizePx}
          disabled={disabled}
          disableInteraction
          color={contentColor as `#${string}`}
          p="0"
          iconProps={iconProps}
        />
      )}
    </ChipWrapper>
  )
}

const ChipWrapper = styled.div<
  {
    $clickable: boolean
    $size: SizeUiType
    $color?: string
    $disabled: boolean
    $variant: VariantUiType
  } & BaseMixinProps
>`
  ${BaseMixin}
  position: relative;
  z-index: ${COMMON_PARENTS_ELEMENT_ZINDEX};
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: ${({ theme }) => theme.borderRadius[16]};
  padding: ${({ $size }) =>
    $size === "S"
      ? "2px 9px"
      : $size === "M"
        ? "5px 12px"
        : $size === "L"
          ? "8px 21px"
          : "5px 12px"};
  user-select: none;

  cursor: ${({ $clickable, $disabled }) =>
    $disabled ? "not-allowed" : $clickable ? "pointer" : "default"};

  ${({ $variant, theme, $disabled, $color }) => {
    const colors = theme.colors
    const resolved = $color ?? colors.primary[400]

    switch ($variant) {
      case "contained":
        return `
          background-color: ${$disabled ? colors.text.disabled : resolved};
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
          border: 1px solid ${$disabled ? colors.text.disabled : resolved};
        `
      default:
        return ""
    }
  }}
`

export default Chip

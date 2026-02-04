import { forwardRef, useMemo, useState } from "react"
import type { FocusEventHandler, MouseEvent, MouseEventHandler } from "react"
import { useTheme } from "styled-components"
import type { DefaultTheme } from "styled-components"
import { BaseMixin } from "../../tokens/baseMixin"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import Icon, { type IconProps } from "../Icon/Icon"
import { styled } from "../../tokens/customStyled"
import { Tooltip, type TooltipProps } from "../Tooltip/Tooltip"
import type { IconName } from "../Icon/icon-types"
import type { VariantUiType } from "../../types/ui"

export type IconButtonProps = BaseMixinProps & {
  icon: IconName
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  color?: string
  size?: number | string
  variant?: VariantUiType
  disabled?: boolean
  iconProps?: Partial<Omit<IconProps, "name">>
  disableInteraction?: boolean
  toolTip?: string
  toolTipProps?: TooltipProps
  onMouseDown?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseUp?: (e: MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void
  ariaLabel?: string
}

const getIconColorFromVariant = (
  variant: VariantUiType,
  theme: DefaultTheme,
  disabled: boolean,
  isHover: boolean,
  isActive: boolean,
): string => {
  if (disabled) return theme.colors.text.disabled
  if (isActive) return theme.colors.grayscale[500]
  if (variant === "outlined" && isHover) return theme.colors.grayscale[200]
  return theme.colors.grayscale[500]
}
/**---------------------------------------------------------------------------/
 *
 * ! IconButton
 *
 * * 아이콘만 표시하는 액션 버튼 컴포넌트
 * * 단일 아이콘 클릭 액션을 제공하며, 필요 시 Tooltip으로 감싸 보조 설명을 노출
 * * disabled / disableInteraction 옵션에 따라 인터랙션 및 시각 반응을 제어
 *
 * * 동작 규칙
 *   * 주요 분기 조건
 *     * disabled === true 인 경우 모든 클릭/인터랙션 차단
 *     * e.detail === 0(키보드/프로그램 트리거) 클릭은 무시하고 마우스 클릭만 허용
 *   * 이벤트 처리 방식
 *     * onClick: 조건 통과 시에만 실행
 *     * onMouseDown / onMouseUp / onMouseLeave: 내부 active/hover 상태와 동기화 호출
 *     * onBlur: active 상태 강제 해제
 *   * disabled 상태
 *     * hover / active 시각 효과 비활성화
 *     * 아이콘 색상을 disabled 전용 컬러로 강제 적용
 *
 * * 레이아웃/스타일 관련 규칙
 *   * inline-flex 기반 정사각형 버튼 구조
 *   * borderRadius는 theme 토큰 사용
 *   * variant(contained / outlined / text)에 따라 배경/보더 스타일 분기
 *   * disableInteraction=false && !disabled 인 경우에만 hover/active 배경색 적용
 *   * 아이콘 색상은 variant + hover/active 상태 조합으로 계산
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * icon: 필수 (IconName, SVG sprite key)
 *     * size/color/iconProps: 아이콘 표현 오버라이드 용도
 *     * toolTip 제공 시 Tooltip으로 버튼을 래핑
 *     * ariaLabel 미지정 시 toolTip 문자열을 접근성 라벨로 fallback
 *   * 내부 계산 로직
 *     * variant + hover/active + disabled 상태로 아이콘 컬러 계산
 *     * disabled 상태에서는 iconProps/color 우선순위 무시
 *   * 클라이언트 제어 컴포넌트 (서버 제어 없음)
 *
 * @module IconButton
 * 아이콘 단일 액션을 수행하는 공통 아이콘 버튼 컴포넌트
 *
 * @usage
 * <IconButton
 *   icon="CloseLine"
 *   toolTip="닫기"
 *   onClick={() => {}}
 * />
 *
/---------------------------------------------------------------------------**/

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      onClick,
      color,
      disabled = false,
      disableInteraction = false,
      size = 16,
      variant = "contained",
      iconProps,
      toolTip,
      toolTipProps,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      ariaLabel,
      ...others
    },
    ref,
  ) => {
    const theme = useTheme()

    const [isHover, setIsHover] = useState(false)
    const [isActive, setIsActive] = useState(false)

    // * 마우스 클릭만 허용(e.detail===0은 키보드/프로그램 트리거), disabled면 차단
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
      if (disabled) return
      if (e.detail === 0) return
      onClick?.(e)
    }

    // * hover 상태 관리(옵션에 따라 차단) + leave 시 외부 핸들러 동기화
    const handleHover = (hover: boolean) => (e: MouseEvent<HTMLButtonElement>) => {
      if (!disableInteraction) setIsHover(hover)
      if (!hover) onMouseLeave?.(e)
    }

    // * active 상태 관리 + 외부 핸들러 호출
    const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
      if (!disableInteraction) setIsActive(true)
      onMouseDown?.(e)
    }

    const handleMouseUp = (e: MouseEvent<HTMLButtonElement>) => {
      if (!disableInteraction) setIsActive(false)
      onMouseUp?.(e)
    }

    const handleBlur: FocusEventHandler<HTMLButtonElement> = () => setIsActive(false)

    const computedColor = useMemo(
      () => getIconColorFromVariant(variant, theme, disabled, isHover, isActive),
      [variant, theme, disabled, isHover, isActive],
    )

    // * disabled일 때는 iconProps/color 우선순위를 무시하고 강제 disabled 색 적용
    const finalColor = disabled ? computedColor : (iconProps?.color ?? color ?? computedColor)

    const content = (
      <IconButtonStyle
        ref={ref}
        type="button"
        disabled={disabled}
        $disableInteraction={disableInteraction}
        $variant={variant}
        onClick={handleClick}
        onMouseEnter={handleHover(true)}
        onMouseLeave={handleHover(false)}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onBlur={handleBlur}
        aria-label={ariaLabel ?? toolTip ?? undefined}
        p={"4px"}
        {...others}
      >
        <Icon name={icon} size={size} color={finalColor} {...iconProps} />
      </IconButtonStyle>
    )

    return toolTip ? (
      <Tooltip content={toolTip} {...toolTipProps}>
        {content}
      </Tooltip>
    ) : (
      content
    )
  },
)

const variantStyle = (p: { $variant: VariantUiType; theme: DefaultTheme; disabled?: boolean }) => {
  const { $variant, theme, disabled } = p

  switch ($variant) {
    case "outlined":
      return `
        background-color: ${disabled ? theme.colors.background.dark : "transparent"};
        border: 1px solid ${disabled ? theme.colors.background.dark : theme.colors.border.thick};
      `
    case "text":
      return `
        background-color: transparent;
        border: none;
      `
    case "contained":
    default:
      return `
        background-color: ${disabled ? theme.colors.background.dark : theme.colors.grayscale.white};
        border: none;
      `
  }
}

export const IconButtonStyle = styled.button<
  Omit<IconButtonProps, "icon" | "onClick" | "disableInteraction" | "variant"> & {
    $disableInteraction: boolean
    $variant: VariantUiType
  }
>`
  ${BaseMixin}

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  transition: all 0.2s ease-in-out;

  ${({ disabled }) => `
    cursor: ${disabled ? "no-drop" : "pointer"};
  `}

  ${({ theme, $disableInteraction, disabled }) =>
    !$disableInteraction &&
    !disabled &&
    `
      &:hover {
        background-color: ${theme.colors.background.default};
      }
      &:active {
        background-color: ${theme.colors.background.dark};
      }
    `}

  ${({ theme, $variant, disabled }) => variantStyle({ $variant, theme, disabled })}
`

IconButton.displayName = "IconButton"
export default IconButton

import { forwardRef, useId, useMemo, useState } from "react"
import type { KeyboardEvent, MouseEvent, ReactNode } from "react"
import { BaseMixin } from "../../tokens/baseMixin"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import Flex from "../Flex/Flex"
import Label from "../Label/Label"
import type { LabelProps } from "../Label/Label"
import Icon from "../Icon/Icon"
import { theme } from "../../tokens/theme"
import type { AxisPlacement } from "../../types/placement"
import type { IconName } from "../Icon/icon-types"

type RatingValue = number | null

export type RatingProps = BaseMixinProps & {
  value?: RatingValue
  defaultValue?: number
  label?: string
  labelProps?: LabelProps

  labelPlacement?: AxisPlacement

  max?: number
  precision?: number
  disabled?: boolean
  readOnly?: boolean

  icon?: ReactNode | IconName
  emptyIcon?: ReactNode | IconName

  size?: number | string

  onChange?: (value: RatingValue) => void
  onChangeActive?: (value: RatingValue) => void
}

type NormalizedAxis = "top" | "bottom" | "left" | "right"
type AlignCss = "flex-start" | "flex-end" | "center"

const normalizeAxisPlacement = (placement?: AxisPlacement): NormalizedAxis => {
  if (!placement) return "top"
  if (placement.startsWith("top")) return "top"
  if (placement.startsWith("bottom")) return "bottom"
  if (placement.startsWith("left")) return "left"
  if (placement.startsWith("right")) return "right"
  return "top"
}

const getPlacementAlign = (placement?: AxisPlacement): AlignCss => {
  if (!placement) return "flex-start"
  if (placement.endsWith("start")) return "flex-start"
  if (placement.endsWith("end")) return "flex-end"
  return "flex-start"
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

const roundToPrecision = (v: number, precision: number) => {
  if (precision <= 0) return v
  return Math.round(v / precision) * precision
}

const toNumberSizePx = (size: number | string) => {
  if (typeof size === "number") return size
  const trimmed = size.trim()
  const parsed = Number.parseFloat(trimmed)
  return Number.isFinite(parsed) ? parsed : 24
}
/**---------------------------------------------------------------------------/
 *
 * ! Rating
 *
 * * 아이콘(기본 Star) 기반의 별점 입력 컴포넌트입니다.
 * * `value` 제공 여부에 따라 controlled/비제어(uncontrolled) 모드로 동작합니다.
 * * 마우스 포인터 위치로 값을 연속 계산(precision 반올림)하며, 호버(active) 값과 확정 값(click/keyboard)을 분리합니다.
 * * `labelPlacement`(권장) 또는 `LabelPlacement`(deprecated)로 라벨 위치/정렬을 결정합니다.
 * * `disabled`/`readOnly` 상태에서는 상호작용을 차단하고 접근성 속성(aria-disabled/aria-readonly)을 반영합니다.
 *
 * * 동작 규칙
 *   * 제어 방식:
 *     * `isControlled = value !== undefined`
 *     * `currentRaw = isControlled ? value : internal`
 *     * `currentValue`는 null/undefined를 0으로 처리하고 0~safeMax로 clamp 합니다.
 *   * 값 보정:
 *     * `safeMax = max`를 1 이상 정수로 보정(Math.floor + Math.max)
 *     * `safePrecision = precision`이 0 이하이면 1로 보정
 *     * `roundToPrecision`으로 precision 단위 반올림 후 clamp 합니다.
 *   * 포인터 기반 값 계산:
 *     * `computeValueFromPointer`는 wrapper(rect) 기준 x 위치를 0~width로 clamp 후 percent를 구합니다.
 *     * `raw = percent * safeMax` → precision 반올림 → 0~safeMax clamp 값으로 변환합니다.
 *   * 클릭 처리:
 *     * interactive 상태에서 클릭 시 포인터 기반 next 값을 계산하여 `setValueInternal(next)`로 확정합니다.
 *     * `setValueInternal`은 uncontrolled일 때만 internal을 갱신하고, 항상 `onChange?.(next)`를 호출합니다.
 *   * 호버 처리:
 *     * interactive 상태에서 mouseMove 시 hoverValue를 갱신하고 `onChangeActive?.(next)`를 호출합니다.
 *     * mouseLeave 시 hoverValue를 null로 초기화하고 `onChangeActive?.(null)`을 호출합니다.
 *   * 키보드 처리:
 *     * ArrowRight/ArrowUp: currentValue + precision → precision 반올림 → clamp 후 확정(onChange)
 *     * ArrowLeft/ArrowDown: currentValue - precision → precision 반올림 → clamp 후 확정(onChange)
 *     * Home: 0 확정, End: safeMax 확정
 *     * 위 키 입력은 preventDefault로 스크롤/기본 동작을 차단합니다.
 *   * 표시 값 우선순위:
 *     * `displayedValue = hoverValue ?? currentValue` (호버가 있으면 호버 값을 우선 표시)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 라벨 배치:
 *     * `placement = labelPlacement ?? LabelPlacement ?? "top"` 우선순위로 결정합니다.
 *     * axis는 placement의 top/bottom/left/right prefix로 정규화(normalizeAxisPlacement)합니다.
 *     * top/bottom은 Flex(align=labelAlign) 래핑으로 정렬하며, left/right은 인라인 Label로 간격(mr/ml)만 둡니다.
 *     * labelAlign은 placement의 start/end suffix로 결정(getPlacementAlign)하며 기본은 flex-start 입니다.
 *   * 아이콘 렌더링:
 *     * `icon`/`emptyIcon`이 문자열이면 Icon 컴포넌트로 렌더링하고, 아니면 ReactNode를 그대로 사용합니다.
 *     * 각 아이템은 빈 아이콘 레이어(IconLayer) + 채움 레이어(IconFill) 2층 구조로 표현합니다.
 *     * item별 ratio = clamp(displayedValue - index, 0, 1)로 채움 비율을 계산하고, width(percent)로 부분 채움을 구현합니다.
 *   * 상호작용 영역:
 *     * 실제 이벤트는 RatingWrapper가 받으며, RatingItem은 pointer-events: none으로 아이콘 영역 개별 이벤트를 차단합니다.
 *   * 포커스/접근성:
 *     * Wrapper는 role="slider" + aria-valuemin/max/now/text로 현재 상태를 노출합니다.
 *     * tabIndex는 disabled/readOnly면 -1, 아니면 0입니다.
 *     * focus-visible에서 outline 대신 box-shadow로 포커스 링을 표시합니다.
 *   * 색상 규칙:
 *     * emptyColor: disabled면 text.disabled, 아니면 border.thick
 *     * filledColor: disabled면 text.disabled, 아니면 primary[400]
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `value`/`defaultValue`: 점수 값(0~max), null은 0 표시로 처리됩니다.
 *     * `max`: 최소 1 이상의 정수로 보정되어 렌더링 아이템 개수를 결정합니다.
 *     * `precision`: 포인터/키보드 조작 증분 단위이며 0 이하이면 1로 보정합니다.
 *     * `onChange`: 값 확정 시 호출, `onChangeActive`: 호버(active) 값 변경 시 호출합니다.
 *   * 내부 계산:
 *     * displayedValue 기반으로 각 아이템의 채움 비율을 계산하여 부분 채움 UI를 구성합니다.
 *   * 서버/클라이언트 제어:
 *     * controlled(value 제공) 시 외부 값이 단일 소스이며, internal은 fallback로만 유지됩니다.
 *
 * @module Rating
 * 아이콘 기반 별점 입력을 제공하며, precision 단위 입력/호버 미리보기/키보드 조작/라벨 배치 및 접근성 속성을 지원합니다.
 *
 * @usage
 * <Rating
 *   label="만족도"
 *   value={value}
 *   onChange={setValue}
 *   max={5}
 *   precision={0.5}
 *   labelPlacement="top-start"
 * />
 *
/---------------------------------------------------------------------------**/

const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      label,
      labelProps,
      labelPlacement,
      max = 5,
      precision = 1,
      disabled = false,
      readOnly = false,
      icon = "StarGlyph",
      emptyIcon = "StarOutLine",
      size = 24,
      onChange,
      onChangeActive,
      ...others
    },
    ref,
  ) => {
    const uid = useId()

    const placement = labelPlacement ?? "top"
    const axis = useMemo(() => normalizeAxisPlacement(placement), [placement])
    const labelAlign = useMemo(() => getPlacementAlign(placement), [placement])
    const isHorizontalLabel = axis === "left" || axis === "right"

    const safeMax = Math.max(1, Math.floor(max))
    const safePrecision = precision > 0 ? precision : 1

    const iconSize = size
    const iconSizePx = toNumberSizePx(size)

    const isControlled = value !== undefined
    const [internal, setInternal] = useState<number>(clamp(defaultValue, 0, safeMax))
    const [hoverValue, setHoverValue] = useState<RatingValue>(null)

    const currentRaw = isControlled ? value : internal
    const currentValue = currentRaw == null ? 0 : clamp(currentRaw, 0, safeMax)
    const displayedValue = hoverValue != null ? clamp(hoverValue, 0, safeMax) : currentValue

    const isInteractive = !disabled && !readOnly

    const renderIconNode = (node: ReactNode | IconName) => {
      if (typeof node === "string") {
        return <Icon name={node as IconName} size={iconSize} color="currentColor" aria-hidden />
      }
      return node
    }

    const setValueInternal = (next: RatingValue) => {
      if (!isControlled) {
        setInternal(next == null ? 0 : next)
      }
      onChange?.(next)
    }

    const computeValueFromPointer = (e: MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = clamp(e.clientX - rect.left, 0, rect.width)
      const percent = rect.width === 0 ? 0 : x / rect.width
      const raw = percent * safeMax
      const rounded = roundToPrecision(raw, safePrecision)
      return clamp(rounded, 0, safeMax)
    }

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      if (!isInteractive) return
      const next = computeValueFromPointer(e)
      setValueInternal(next <= 0 ? 0 : next)
    }

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (!isInteractive) return
      const next = computeValueFromPointer(e)
      setHoverValue(next)
      onChangeActive?.(next)
    }

    const handleMouseLeave = () => {
      if (!isInteractive) return
      setHoverValue(null)
      onChangeActive?.(null)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive) return

      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault()
        const next = clamp(
          roundToPrecision(currentValue + safePrecision, safePrecision),
          0,
          safeMax,
        )
        setValueInternal(next)
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault()
        const next = clamp(
          roundToPrecision(currentValue - safePrecision, safePrecision),
          0,
          safeMax,
        )
        setValueInternal(next)
      }

      if (e.key === "Home") {
        e.preventDefault()
        setValueInternal(0)
      }

      if (e.key === "End") {
        e.preventDefault()
        setValueInternal(safeMax)
      }
    }

    const renderTopLabel = () => {
      if (!label) return null
      if (axis !== "top") return null
      return (
        <Flex align={labelAlign}>
          <Label text={label} {...labelProps} mb="10px" />
        </Flex>
      )
    }

    const renderBottomLabel = () => {
      if (!label) return null
      if (axis !== "bottom") return null
      return (
        <Flex align={labelAlign}>
          <Label text={label} {...labelProps} mt="10px" />
        </Flex>
      )
    }

    const renderLeftLabel = () => {
      if (!label) return null
      if (axis !== "left") return null
      return <Label text={label} {...labelProps} mr="10px" />
    }

    const renderRightLabel = () => {
      if (!label) return null
      if (axis !== "right") return null
      return <Label text={label} {...labelProps} ml="10px" />
    }

    const ariaValueText = `${displayedValue} / ${safeMax}`

    const emptyColor = disabled ? theme.colors.text.disabled : theme.colors.border.thick
    const filledColor = disabled ? theme.colors.text.disabled : theme.colors.primary[400]

    return (
      <Flex
        direction={isHorizontalLabel ? "row" : "column"}
        align={isHorizontalLabel ? "center" : "flex-start"}
        gap="4px"
      >
        {renderTopLabel()}
        {renderLeftLabel()}

        <RatingWrapper
          {...others}
          ref={ref}
          role="slider"
          tabIndex={disabled || readOnly ? -1 : 0}
          aria-label={label ? `${label} Rating` : `Rating-${uid}`}
          aria-valuemin={0}
          aria-valuemax={safeMax}
          aria-valuenow={displayedValue}
          aria-valuetext={ariaValueText}
          aria-disabled={disabled ? true : undefined}
          aria-readonly={readOnly ? true : undefined}
          $disabled={disabled}
          $readOnly={readOnly}
          $iconSizePx={iconSizePx}
          onKeyDown={handleKeyDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {Array.from({ length: safeMax }).map((_, i) => {
            const base = i
            const ratio = clamp(displayedValue - base, 0, 1)
            const percent = `${ratio * 100}%`

            return (
              <RatingItem key={i}>
                <IconLayer $color={emptyColor}>{renderIconNode(emptyIcon)}</IconLayer>
                <IconFill $color={filledColor} $width={percent}>
                  {renderIconNode(icon)}
                </IconFill>
              </RatingItem>
            )
          })}
        </RatingWrapper>

        {renderRightLabel()}
        {renderBottomLabel()}
      </Flex>
    )
  },
)

const RatingWrapper = styled.div<
  BaseMixinProps & { $disabled?: boolean; $readOnly?: boolean; $iconSizePx: number }
>`
  ${BaseMixin}
  display: inline-flex;
  align-items: center;
  user-select: none;

  cursor: ${({ $disabled, $readOnly }) => ($disabled || $readOnly ? "default" : "pointer")};

  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[200]};
    border-radius: 6px;
  }

  & > * {
    font-size: ${({ $iconSizePx }) => `${$iconSizePx}px`};
  }
`

const RatingItem = styled.div`
  position: relative;
  line-height: 0;
  padding: 2px;
  pointer-events: none;
`

const IconLayer = styled.span<{ $color: string }>`
  display: inline-flex;
  color: ${({ $color }) => $color};
`

const IconFill = styled.span<{ $color: string; $width: string }>`
  position: absolute;
  top: 2px;
  left: 2px;
  height: calc(100% - 4px);
  overflow: hidden;
  width: ${({ $width }) => $width};
  color: ${({ $color }) => $color};
  display: inline-flex;
`

export default Rating

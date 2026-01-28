import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { styled } from "../../tokens/customStyled"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { theme } from "../../tokens/theme"
import Icon from "../Icon/Icon"
import Label from "../Label/Label"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"

export type SliderValue = number | [number, number]

export type SliderProps = BaseMixinProps & {
  value: SliderValue
  onChange?: (value: SliderValue) => void
  onChangeEnd?: (value: SliderValue) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  track?: "normal" | "inset" | "none"
  label?: string
  labelProps?: any
  startIcon?: string
  endIcon?: string
  iconSize?: number | string
}

/**---------------------------------------------------------------------------/
 *
 * ! Slider
 *
 * * 단일 값(number) 또는 범위([number, number])를 지원하는 슬라이더 컴포넌트입니다.
 * * `value`를 필수로 받는 controlled 입력이며, 드래그/클릭 중 즉시 반영을 위해 내부 상태(internal)와 최신값 ref(internalRef)를 함께 사용합니다.
 * * single ↔ range 모드 전환 시에도 값 타입 불일치로 인한 렌더 오류를 방지하기 위해 `normalizeByMode`로 항상 모드에 맞게 정규화합니다.
 * * 레일 클릭 시 가장 가까운 Thumb를 이동하고, 드래그 종료 시 `onChangeEnd`로 최종 값을 전달합니다.
 *
 * * 동작 규칙
 *   * 모드 판별:
 *     * `isRange = Array.isArray(value)`로 단일/범위 모드를 결정합니다.
 *   * 값 정규화(항상 적용):
 *     * `clampValue`로 min~max 범위 및 NaN/Infinity 방어를 수행합니다.
 *     * `normalizeToStep`로 step 스냅(0/음수 step은 1로 보정) 후 clamp 합니다.
 *     * `sortRange(a,b)`로 range 값의 오름차순을 강제합니다.
 *     * `normalizeByMode(v)`:
 *       * range 모드:
 *         * v가 [a,b]면 각각 step 스냅 후 sortRange
 *         * v가 number면 [n,n]으로 승격
 *       * single 모드:
 *         * v가 [a,b]면 a만 사용
 *         * v가 number면 그대로 step 스냅
 *   * controlled 동기화:
 *     * 외부 `value` 변경 시 `normalizeByMode(value)`로 보정한 값을 internal/internalRef에 동기화합니다.
 *     * 렌더 시에도 `normalizedInternal = normalizeByMode(internal)`을 사용하여 중간 렌더 불일치를 제거합니다.
 *   * 위치 → 값 변환:
 *     * `getValueFromPosition(pageX)`는 rail rect 기준 ratio(0~1)를 계산하여
 *       `raw = min + ratio*(max-min)` → step 스냅 값으로 변환합니다.
 *   * 변경 커밋:
 *     * `commitChange(next)`는 internal/internalRef를 갱신하고 `onChange(next)`를 호출합니다.
 *     * `commitEnd(next)`는 `onChangeEnd(next)`만 호출합니다.
 *   * 드래그:
 *     * Thumb mousedown 시 window mousemove/mouseup 리스너를 등록합니다.
 *     * mousemove마다 newValue를 계산하고,
 *       * single: next = newValue
 *       * range: safePrev = normalizeByMode(prev) 후 thumbIndex에 해당하는 값만 갱신 + sortRange
 *       로 internalRef를 갱신하고 `onChange`를 즉시 호출합니다.
 *     * mouseup 시 최신값(internalRef)을 `onChangeEnd`로 전달하고 리스너를 해제합니다.
 *   * 레일 클릭:
 *     * single: 클릭 위치 값을 commitChange + commitEnd로 즉시 확정합니다.
 *     * range: 최신값을 `normalizeByMode(internalRef.current)`로 보정한 뒤,
 *       클릭 값과 각 thumb 값의 거리(d1/d2)를 비교하여 더 가까운 thumb를 이동시키고
 *       sortRange 후 commitChange + commitEnd로 확정합니다.
 *   * disabled:
 *     * disabled면 드래그/클릭을 차단하고 cursor를 not-allowed로 표시합니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 구성:
 *     * Wrapper → Flex(아이콘/레일) → RailContainer 내부에 Rail(바탕) + Track(채움) + Thumb(들)로 구성됩니다.
 *   * Track:
 *     * `track="none"`이면 Track을 렌더링하지 않습니다.
 *     * single: 0%~현재값% 채움, range: 시작~끝 구간 채움으로 렌더링합니다.
 *     * `track="inset"`이면 Track 높이를 2px로 줄여 인셋 형태로 표현합니다.
 *   * Thumb:
 *     * percent(left)을 기준으로 absolute 배치되며 hover/active 시 scale 애니메이션으로 강조됩니다.
 *     * disabled면 색상(grayscale[300])과 cursor 상태가 비활성화로 변경됩니다.
 *   * ValueLabel:
 *     * Thumb 상단에 현재 값을 Typography로 표시하는 툴팁 형태 라벨입니다.
 *   * Icon:
 *     * startIcon/endIcon이 있으면 레일 양쪽에 렌더링하며, iconSize는 상위 계산값을 그대로 사용합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `value`: number | [number, number] (필수)
 *     * `onChange`: 변경 즉시 호출(드래그 move 포함)
 *     * `onChangeEnd`: 최종 확정 시 호출(레일 클릭/드래그 mouseup)
 *     * `min/max/step`: 범위 및 스냅 규칙
 *     * `track`: 채움 렌더 방식(normal/inset/none)
 *     * `label/startIcon/endIcon/iconSize`: 표시 옵션
 *   * 내부 계산:
 *     * `toPercent(v) = ((clamp(v) - min) / rangeSpan) * 100`, span 0은 1로 보정합니다.
 *     * range의 trackLeft는 시작값 percent, trackWidth는 (끝-시작) percent 차이로 계산합니다.
 *   * 서버/클라이언트 제어:
 *     * 외부 `value`가 단일 소스이며, internal/internalRef는 상호작용 성능/최신값 전달을 위한 보조 상태로 사용됩니다.
 *
 * @module Slider
 * 단일/범위 값을 지원하는 슬라이더 입력을 제공하며, 드래그/레일 클릭으로 값 변경과 onChange/onChangeEnd 이벤트를 지원합니다.
 *
 * @usage
 * <Slider value={30} onChange={setValue} onChangeEnd={setValue} />
 * <Slider value={[20, 80]} onChange={setRange} onChangeEnd={setRange} track="inset" />
 *
/---------------------------------------------------------------------------**/

export const Slider = ({
  value,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  track = "normal",
  label,
  labelProps,
  startIcon,
  endIcon,
  iconSize = 16,
  ...rest
}: SliderProps) => {
  const [internal, setInternal] = useState<SliderValue>(value)
  const internalRef = useRef<SliderValue>(value)
  const railRef = useRef<HTMLDivElement | null>(null)

  // * 단일 값 / Range 슬라이더 여부 판별
  const isRange = Array.isArray(value)

  // * 숫자 정규화(최소/최대/NaN 보호)
  const clampValue = useCallback(
    (v: number) => {
      const safe = Number.isFinite(v) ? v : min
      return Math.max(min, Math.min(max, safe))
    },
    [min, max],
  )

  // * Range 정렬 보정
  const sortRange = useCallback((a: number, b: number) => {
    return (a <= b ? [a, b] : [b, a]) as [number, number]
  }, [])

  // * step 기준 반올림(0/음수 방어)
  const normalizeToStep = useCallback(
    (v: number) => {
      const safeStep = step > 0 ? step : 1
      const snapped = Math.round(v / safeStep) * safeStep
      return clampValue(snapped)
    },
    [step, clampValue],
  )

  // * internal/value 타입 불일치(싱글↔레인지 전환) 방지용 정규화
  const normalizeByMode = useCallback(
    (v: SliderValue): SliderValue => {
      if (isRange) {
        if (Array.isArray(v)) {
          const a = normalizeToStep(v[0])
          const b = normalizeToStep(v[1])
          return sortRange(a, b)
        }
        const n = normalizeToStep(v)
        return [n, n]
      }

      if (Array.isArray(v)) return normalizeToStep(v[0])
      return normalizeToStep(v)
    },
    [isRange, normalizeToStep, sortRange],
  )

  // * Controlled 동기화
  useEffect(() => {
    const next = normalizeByMode(value)
    setInternal(next)
    internalRef.current = next
  }, [value, normalizeByMode])

  // * 렌더 시점에도 항상 mode에 맞는 값만 사용(중간 렌더 불일치 제거)
  const normalizedInternal = useMemo(() => normalizeByMode(internal), [internal, normalizeByMode])

  useEffect(() => {
    internalRef.current = normalizedInternal
  }, [normalizedInternal])

  const rangeSpan = useMemo(() => {
    const span = max - min
    return span === 0 ? 1 : span
  }, [min, max])

  // * value를 0~100 퍼센트 값으로 변환
  const toPercent = useCallback(
    (v: number) => ((clampValue(v) - min) / rangeSpan) * 100,
    [clampValue, min, rangeSpan],
  )

  // * 마우스 좌표(pageX)를 실제 슬라이더 값으로 변환
  const getValueFromPosition = useCallback(
    (pageX: number) => {
      if (!railRef.current) return min

      const rect = railRef.current.getBoundingClientRect()
      const width = rect.width || 1
      const ratio = (pageX - rect.left) / width
      const clampedRatio = Math.max(0, Math.min(1, ratio))
      const raw = min + clampedRatio * (max - min)

      return normalizeToStep(raw)
    },
    [min, max, normalizeToStep],
  )

  const commitChange = useCallback(
    (next: SliderValue) => {
      setInternal(next)
      internalRef.current = next
      onChange?.(next)
    },
    [onChange],
  )

  const commitEnd = useCallback(
    (next: SliderValue) => {
      onChangeEnd?.(next)
    },
    [onChangeEnd],
  )

  // * Thumb 드래그 시작 핸들러 (Range 슬라이더는 thumbIndex 기준)
  const startDragging = useCallback(
    (thumbIndex: number) => (e: any) => {
      if (disabled) return
      e?.preventDefault?.()

      const move = (event: MouseEvent) => {
        const newValue = getValueFromPosition(event.pageX)

        setInternal((prev) => {
          const safePrev = normalizeByMode(prev)

          if (!isRange) {
            const next = newValue
            internalRef.current = next
            onChange?.(next)
            return next
          }

          const [p1, p2] = safePrev as [number, number]
          const nextArr = thumbIndex === 0 ? sortRange(newValue, p2) : sortRange(p1, newValue)

          internalRef.current = nextArr
          onChange?.(nextArr)
          return nextArr
        })
      }

      const up = () => {
        const latest = internalRef.current
        commitEnd(latest)

        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
      }

      window.addEventListener("mousemove", move)
      window.addEventListener("mouseup", up)
    },
    [disabled, getValueFromPosition, isRange, onChange, commitEnd, normalizeByMode, sortRange],
  )

  // * Rail 클릭 시 가장 가까운 Thumb를 이동
  const handleRailMouseDown = useCallback(
    (e: any) => {
      if (disabled) return
      e?.preventDefault?.()

      const newVal = getValueFromPosition(e.pageX)

      if (!isRange) {
        const next = newVal
        commitChange(next)
        commitEnd(next)
        return
      }

      const safeCurrent = normalizeByMode(internalRef.current) as [number, number]
      const [v1, v2] = safeCurrent
      const d1 = Math.abs(newVal - v1)
      const d2 = Math.abs(newVal - v2)

      const next = d1 <= d2 ? sortRange(newVal, v2) : sortRange(v1, newVal)
      commitChange(next)
      commitEnd(next)
    },
    [disabled, getValueFromPosition, isRange, commitChange, commitEnd, normalizeByMode, sortRange],
  )

  const trackLeft = useMemo(() => {
    if (!isRange) return 0
    const [a] = normalizedInternal as [number, number]
    return toPercent(a)
  }, [normalizedInternal, isRange, toPercent])

  const trackWidth = useMemo(() => {
    if (!isRange) return toPercent(normalizedInternal as number)
    const [a, b] = normalizedInternal as [number, number]
    return toPercent(b) - toPercent(a)
  }, [normalizedInternal, isRange, toPercent])

  const thumbs = useMemo(() => {
    return isRange
      ? (normalizedInternal as [number, number])
      : ([normalizedInternal as number] as number[])
  }, [normalizedInternal, isRange])

  return (
    <Wrapper {...rest}>
      {label && <Label text={label} placement="right" required={false} {...labelProps} mb={6} />}

      <Flex align="center" gap="8px" width="100%">
        {startIcon && (
          <Icon name={startIcon as any} size={iconSize} color={theme.colors.grayscale[300]} />
        )}

        <RailContainer ref={railRef} onMouseDown={handleRailMouseDown} $disabled={disabled}>
          <Rail />

          {track !== "none" && (
            <Track
              $left={trackLeft}
              $width={trackWidth}
              $disabled={disabled}
              $inset={track === "inset"}
            />
          )}

          {thumbs.map((v, i) => (
            <Thumb
              key={i}
              style={{ left: `${toPercent(v)}%` }}
              $disabled={disabled}
              onMouseDown={startDragging(i)}
            >
              <ValueLabel>
                <Typography
                  text={String(v)}
                  color="text.primary"
                  sx={{ fontSize: "10px", lineHeight: 1 }}
                />
              </ValueLabel>
            </Thumb>
          ))}
        </RailContainer>

        {endIcon && (
          <Icon name={endIcon as any} size={iconSize} color={theme.colors.grayscale[300]} />
        )}
      </Flex>
    </Wrapper>
  )
}

Slider.displayName = "Slider"

const Wrapper = styled.div<BaseMixinProps>`
  width: 100%;
  ${BaseMixin};
`

const RailContainer = styled.div<{ $disabled?: boolean }>`
  position: relative;
  flex: 1;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  user-select: none;
  touch-action: none;
`

const Rail = styled.div`
  position: absolute;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.grayscale[200]};
`

const Track = styled.div<{
  $left: number
  $width: number
  $disabled?: boolean
  $inset?: boolean
}>`
  position: absolute;
  left: ${({ $left }) => $left}%;
  width: ${({ $width }) => $width}%;
  height: ${({ $inset }) => ($inset ? "2px" : "4px")};
  border-radius: 2px;
  background: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.grayscale[300] : theme.colors.primary[400]};
`

const Thumb = styled.div<{ $disabled?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.grayscale[300] : theme.colors.primary[400]};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "grab")};
  transition: transform 0.15s ease;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }

  &:active {
    transform: translate(-50%, -50%) scale(1.3);
  }
`

const ValueLabel = styled.div`
  position: absolute;
  top: -26px;
  padding: 2px 4px;
  background: ${({ theme }) => theme.colors.grayscale.white};
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.shadows.elevation[8]};
  white-space: nowrap;
`

export default Slider

import { useCallback, useEffect, useRef, useState } from "react"
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
}
/**---------------------------------------------------------------------------/

* ! Slider
*
* * 단일 값 또는 범위(range)를 지원하는 슬라이더 컴포넌트
* * 마우스 드래그 및 레일 클릭을 통한 값 변경 지원
* * min / max / step 기반 값 계산 및 clamp 처리
* * 단일 슬라이더와 Range 슬라이더 자동 판별
* * 드래그 종료 시 onChangeEnd 콜백 호출
* * 트랙 스타일 옵션 제공 (normal / inset / none)
* * 비활성화 상태 지원 (disabled)
* * 시작/끝 아이콘(startIcon, endIcon) 렌더링 지원
* * 현재 값 툴팁 형태의 ValueLabel 표시
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상 및 스타일 시스템 활용

* @module Slider
* 값 조절 UI를 제공하는 슬라이더 컴포넌트로, 단일 값과 범위 선택을 모두 지원합니다.
* - `value`는 number 또는 [number, number] 형태로 전달
* - 마우스 위치를 기반으로 실제 값 계산 및 step 단위 반올림 처리
* - 내부 상태와 외부 제어(value prop)를 동기화하여 controlled/uncontrolled 흐름 지원
* - track 옵션을 통해 활성 구간 시각화 방식 제어
* - label 및 icon을 조합한 확장 UI 구성 가능
*
* @usage
* <Slider value={50} onChange={setValue} />
* <Slider value={[20, 80]} track="inset" onChange={setRange} />

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
  ...rest
}: SliderProps) => {
  const [internal, setInternal] = useState<SliderValue>(value)
  const railRef = useRef<HTMLDivElement | null>(null)

  // * 단일 값 / Range 슬라이더 여부 판별
  const isRange = Array.isArray(value)

  useEffect(() => {
    setInternal(value)
  }, [value])

  // * 값 범위를 min / max 사이로 제한
  const clamp = (v: number) => Math.max(min, Math.min(max, v))

  // * value를 0~100 퍼센트 값으로 변환
  const percent = useCallback((v: number) => ((clamp(v) - min) / (max - min)) * 100, [min, max])

  // * 마우스 좌표(pageX)를 실제 슬라이더 값으로 변환
  const getValueFromPosition = (pageX: number) => {
    if (!railRef.current) return min

    const rect = railRef.current.getBoundingClientRect()
    const ratio = (pageX - rect.left) / rect.width
    const raw = min + ratio * (max - min)

    return clamp(Math.round(raw / step) * step)
  }

  // * Thumb 드래그 시작 핸들러 (Range 슬라이더는 thumbIndex 기준)
  const startDragging = (thumbIndex: number) => (e: React.MouseEvent | MouseEvent) => {
    if (disabled) return

    const move = (event: MouseEvent) => {
      const newValue = getValueFromPosition(event.pageX)

      setInternal((prev) => {
        if (!isRange) {
          onChange?.(newValue)
          return newValue
        }

        const arr = [...(prev as [number, number])] as [number, number]
        arr[thumbIndex] = newValue
        arr.sort((a, b) => a - b)

        onChange?.(arr)
        return arr
      })
    }

    const up = () => {
      onChangeEnd?.(
        isRange ? ([...(internal as [number, number])] as [number, number]) : (internal as number),
      )

      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
  }

  // * Rail 클릭 시 가장 가까운 Thumb를 이동
  const handleRailClick = (e: React.MouseEvent) => {
    if (disabled) return

    const newVal = getValueFromPosition(e.pageX)

    if (!isRange) {
      onChange?.(newVal)
      onChangeEnd?.(newVal)
      return
    }

    const [v1, v2] = internal as [number, number]

    const next =
      Math.abs(newVal - v1) < Math.abs(newVal - v2)
        ? ([newVal, v2].sort((a, b) => a - b) as [number, number])
        : ([v1, newVal].sort((a, b) => a - b) as [number, number])

    onChange?.(next)
    onChangeEnd?.(next)
  }

  return (
    <Wrapper {...rest}>
      {label && <Label text={label} placement="right" required={false} {...labelProps} mb={6} />}

      <Flex align="center" gap="8px" width="100%">
        {startIcon && <Icon name={startIcon} size={16} color={theme.colors.grayscale[300]} />}

        <RailContainer ref={railRef} onMouseDown={handleRailClick} disabled={disabled}>
          <Rail />

          {track !== "none" && (
            <Track
              $left={isRange ? percent((internal as [number, number])[0]) : 0}
              $width={
                isRange
                  ? percent((internal as [number, number])[1]) -
                    percent((internal as [number, number])[0])
                  : percent(internal as number)
              }
              $disabled={disabled}
              $inset={track === "inset"}
            />
          )}

          {(isRange ? (internal as [number, number]) : [internal]).map((v, i) => (
            <Thumb
              key={i}
              style={{ left: `${percent(v as number)}%` }}
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

        {endIcon && <Icon name={endIcon} size={16} color={theme.colors.grayscale[300]} />}
      </Flex>
    </Wrapper>
  )
}

Slider.displayName = "Slider"

const Wrapper = styled.div<BaseMixinProps>`
  width: 100%;
  ${BaseMixin};
`

const RailContainer = styled.div<{ disabled?: boolean }>`
  position: relative;
  flex: 1;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
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
  background: ${theme.colors.grayscale.white};
  border-radius: 4px;
  box-shadow: ${theme.shadows.elevation[8]};
  white-space: nowrap;
`

export default Slider

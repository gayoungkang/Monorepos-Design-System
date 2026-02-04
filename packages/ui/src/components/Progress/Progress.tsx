import { useEffect, useState } from "react"
import { theme } from "../../tokens/theme"
import { circularIndeterminate, indeterminateAnimation } from "../../tokens/keyframes"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { Typography } from "../Typography/Typography"
import Box from "../Box/Box"
import { styled } from "../../tokens/customStyled"

export type ProgressProps = BaseMixinProps & {
  type?: "bar" | "Circular"
  variant?: "determinate" | "indeterminate"
  value?: number
  color?: string
  height?: string
  size?: string
  label?: string
  backgroundColor?: string
}
/**---------------------------------------------------------------------------/
 *
 * ! Progress
 *
 * * 진행 상태를 표시하는 Progress 컴포넌트입니다. (bar / Circular 타입 지원)
 * * `type`에 따라 Bar(가로) 또는 Circular(SVG 원형)로 렌더링됩니다.
 * * `variant`에 따라 determinate(값 기반) / indeterminate(무한 로딩) 모드로 동작합니다.
 * * determinate 모드에서는 `value`(0~100)를 기준으로 내부 `animatedValue`를 증가시켜 부드럽게 반영합니다.
 *
 * * 동작 규칙
 *   * determinate:
 *     * `value`까지 requestAnimationFrame 기반으로 `animatedValue`를 1씩 증가시켜 진행률을 표현합니다.
 *     * Bar 타입은 width(%), Circular 타입은 strokeDashoffset으로 진행률을 표시합니다.
 *   * indeterminate:
 *     * Bar 타입은 `indeterminateAnimation`으로 무한 이동 애니메이션을 수행합니다.
 *     * Circular 타입은 `circularIndeterminate`로 원형 회전/진행 애니메이션을 수행합니다.
 *   * `variant`가 determinate가 아니면 `animatedValue`는 0으로 초기화됩니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * Bar:
 *     * Track은 `height`, `backgroundColor`를 사용하고 borderRadius + overflow hidden으로 클리핑합니다.
 *     * determinate Bar는 width 전환(0.4s)으로 부드럽게 변화합니다.
 *     * indeterminate Bar는 absolute 배치 + keyframes 애니메이션으로 표현됩니다.
 *   * Circular:
 *     * `size`를 wrapper 및 svg width/height로 사용합니다.
 *     * radius(18) 고정, circumference 기반 dasharray/dashoffset을 계산합니다.
 *   * Label:
 *     * `label`이 있고 determinate일 때만 표시되며, 중앙 absolute 배치로 렌더링됩니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `type`: "bar" | "Circular" (기본 "bar")
 *     * `variant`: "determinate" | "indeterminate" (기본 "indeterminate")
 *     * `value`: determinate 진행률 값 (기본 0)
 *     * `color`, `backgroundColor`, `height`, `size`는 스타일 제어용 옵션입니다.
 *   * 내부 계산:
 *     * `animatedValue`는 determinate에서만 value까지 증가하며, Circular은 dashOffset을 계산합니다.
 *   * 서버/클라이언트 제어:
 *     * 진행률 값(`value`)은 외부 제어값을 사용하고, 시각적 부드러움만 내부 애니메이션으로 보정합니다.
 *
 * @module Progress
 * bar / Circular 형태의 진행률 UI를 제공하며 determinate/indeterminate 로딩 상태를 표시합니다.
 *
 * @usage
 * <Progress type="bar" variant="determinate" value={60} />
 * <Progress type="Circular" variant="indeterminate" />
 *
/---------------------------------------------------------------------------**/

const Progress = ({
  type = "bar",
  variant = "indeterminate",
  value = 0,
  color = theme.colors.primary[400],
  backgroundColor = theme.colors.dim.default,
  height = "4px",
  size = "36px",
  label,
  ...others
}: ProgressProps) => {
  const [animatedValue, setAnimatedValue] = useState(0)

  // * determinate일 경우 value까지 부드럽게 증가 애니메이션, 아니면 0으로 초기화
  useEffect(() => {
    if (variant === "determinate") {
      const step = () => {
        setAnimatedValue((prev) => {
          const nextValue = Math.min(value, prev + 1)
          if (nextValue < value) requestAnimationFrame(step)
          return nextValue
        })
      }

      step()
      return
    }

    setAnimatedValue(0)
  }, [value, variant])

  // * Circular 타입: stroke-dashoffset으로 진행률 표현 + indeterminate 애니메이션 지원
  if (type === "Circular") {
    const radius = 18
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (animatedValue / 100) * circumference

    return (
      <CircularWrapper size={size} {...others}>
        <svg width={size} height={size} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={radius} fill="none" stroke={backgroundColor} strokeWidth="4" />
          {variant === "indeterminate" ? (
            <IndeterminateCircle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeLinecap="round"
            />
          ) : (
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.4s ease-in-out" }}
            />
          )}
        </svg>

        {label && variant === "determinate" && (
          <Typography
            text={`${Math.round(animatedValue)}%`}
            variant="b1Regular"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </CircularWrapper>
    )
  }

  return (
    <Box width="100%" {...others}>
      {label && variant === "determinate" && (
        <Typography
          text={`${Math.round(animatedValue)}%`}
          variant="b1Regular"
          mb="4px"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      <Track $bg={backgroundColor} $height={height}>
        {variant === "determinate" ? (
          <Bar $color={color} $value={animatedValue} />
        ) : (
          <IndeterminateBar $color={color} />
        )}
      </Track>
    </Box>
  )
}

const Track = styled.div<{ $bg: string; $height: string }>`
  background-color: ${(props) => props.$bg};
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  overflow: hidden;
  height: ${(props) => props.$height};
  position: relative;
`

const Bar = styled.div<{ $color: string; $value: number }>`
  background-color: ${(props) => props.$color};
  height: 100%;
  width: ${(props) => props.$value}%;
  transition: width 0.4s ease-in-out;
`

const IndeterminateBar = styled.div<{ $color: string }>`
  position: absolute;
  height: 100%;
  background-color: ${(props) => props.$color};
  animation: ${indeterminateAnimation} 1.5s infinite ease-in-out;
`

const CircularWrapper = styled.div<{ size: string }>`
  position: relative;
  display: inline-block;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
`

const IndeterminateCircle = styled.circle`
  animation: ${circularIndeterminate} 1.4s linear infinite;
`

export default Progress

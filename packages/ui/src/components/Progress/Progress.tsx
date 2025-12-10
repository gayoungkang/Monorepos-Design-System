import { useEffect, useState } from "react"

import { theme } from "../../tokens/theme"
import { circularIndeterminate, indeterminateAnimation } from "../../tokens/keyframes"
import { BaseMixinProps } from "../../tokens/baseMixin"
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
/**
 * @module Progress
 * 다양한 로딩 상태를 시각적으로 표현하는 컴포넌트로, 선형(bar)과 원형(Circular) 타입을 지원합니다.
 *
 * - determinate: 진행률에 따라 값이 증가하는 로딩 바
 * - indeterminate: 진행률 없이 반복 애니메이션되는 무한 로딩 바
 * - Circular 타입은 SVG 기반 원형 그래프 형태로 표시됨
 *
 * @props
 * - type : 로딩 형태 ("bar" | "Circular")
 * - variant : determinate(값 기반) 또는 indeterminate(무한 애니메이션)
 * - value : determinate 모드일 때의 퍼센트 값 (0~100)
 * - color : 프로그레스 색상
 * - backgroundColor : 배경 색상
 * - height : bar 타입일 때의 높이
 * - size : Circular 타입일 때의 원 크기
 * - label : 퍼센트 텍스트 표시
 * - others : BaseMixinProps 스타일 확장
 *
 * @사용법
 * <Progress type="bar" variant="determinate" value={60} label="진행중" />
 * <Progress type="Circular" variant="indeterminate" />
 */

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

  // *  determinate일 경우 value까지 부드럽게 증가 애니메이션, 아니면 0으로 초기화
  useEffect(() => {
    if (variant === "determinate") {
      const step = () => {
        setAnimatedValue((prev) => {
          const nextValue = Math.min(value, prev + 1)
          if (nextValue < value) {
            requestAnimationFrame(step)
          }
          return nextValue
        })
      }

      step()
    } else {
      setAnimatedValue(0)
    }
  }, [value, variant])

  // * 원형 프로그레스의 진행률에 따른 stroke-dashoffset 계산 (퍼센트 기반)
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

import React, { useRef, useState, useCallback, useEffect, ReactNode } from "react"
import { DirectionType } from "../../types"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { theme } from "../../tokens/theme"
import { styled } from "../../tokens/customStyled"
import { RESIZABLEPANEL } from "../../types/zindex"

const SIZE = 8

export type ResizablePanelProps = {
  direction?: DirectionType
  minSize?: number
  maxSize?: number
  initialSize?: number
  borderRadius?: string
  children: ReactNode
}
/**
 * @module ResizablePanel
 * 재사용 가능한 크기 조절 패널 컴포넌트로, 세로 또는 가로 방향으로 크기 조절 기능을 제공합니다.
 * - `horizontal` 또는 `vertical` 방향에 따라 크기 조절 가능
 * - 최소 크기(minSize) 및 최대 크기(maxSize) 설정
 * - 초기 크기(initialSize) 지정 가능
 * - 마우스로 패널 크기 조절 가능
 * - `borderRadius`를 통해 패널 모서리 스타일 조정 가능
 *
 * @props
 * - direction : 크기 조절 방향 (horizontal, vertical)
 * - minSize : 최소 크기 (기본값: 100px)
 * - maxSize : 최대 크기 (기본값: 800px)
 * - initialSize : 초기 크기 (기본값: 300px)
 * - borderRadius : 패널 모서리의 둥근 정도
 * - children : 패널 안에 들어갈 내용
 *
 * @상세설명
 * - 마우스로 패널의 크기를 드래그하여 변경할 수 있습니다.
 * - 크기 변경 시 `minSize`와 `maxSize`로 범위가 제한됩니다.
 * - `direction` 값에 따라 패널의 크기 조절 방향이 달라집니다 (가로: horizontal, 세로: vertical).
 * - `Resizer` 컴포넌트는 드래그 핸들을 제공하며, 해당 영역을 클릭하여 크기를 조절할 수 있습니다.
 *
 * @사용법
 * <ResizablePanel direction="vertical" minSize={150} maxSize={500} initialSize={200}>
 *   <SomeContent />
 * </ResizablePanel>
 *
 */

const ResizablePanel = ({
  direction = "vertical",
  minSize = 100,
  maxSize = 800,
  initialSize = 300,
  borderRadius,
  children,
}: ResizablePanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)

  // * 마우스 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  // * 마우스 이동에 따라 사이즈 변경 핸들러
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !panelRef.current) return

      const rect = panelRef.current.getBoundingClientRect()

      if (direction === "vertical") {
        const newWidth = e.clientX - rect.left
        setSize(Math.min(Math.max(newWidth, minSize), maxSize))
      } else {
        const newHeight = e.clientY - rect.top
        setSize(Math.min(Math.max(newHeight, minSize), maxSize))
      }
    },
    [isDragging, direction, minSize, maxSize],
  )

  // * 드래그 종료 처리
  const stopDragging = () => setIsDragging(false)

  // * 드래그 이벤트 등록 및 해제
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", stopDragging)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", stopDragging)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", stopDragging)
    }
  }, [isDragging, handleMouseMove])

  // * 현재 방향에 따른 사이즈 적용
  const panelStyle =
    direction === "vertical"
      ? { width: `${size}px`, height: "100%" }
      : { height: `${size}px`, width: "100%" }

  return (
    <Flex
      ref={panelRef}
      sx={{
        ...panelStyle,
        backgroundColor: "transparent",
        overflow: "hidden",
        position: "relative",
        flexDirection: "column",
      }}
    >
      <Box width="100%" height="100%">
        {children}
      </Box>

      <Resizer onMouseDown={handleMouseDown} direction={direction} borderRadius={borderRadius}>
        <Box
          width={direction === "vertical" ? SIZE / 2.5 : 28}
          height={direction === "vertical" ? 28 : SIZE / 2.5}
          sx={{
            display: "flex",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderLeft:
              direction === "vertical" ? `1px solid ${theme.colors.grayscale[200]}` : undefined,
            borderRight:
              direction === "vertical" ? `1px solid ${theme.colors.grayscale[200]}` : undefined,
            borderTop:
              direction === "horizontal" ? `1px solid ${theme.colors.grayscale[200]}` : undefined,
            borderBottom:
              direction === "horizontal" ? `1px solid ${theme.colors.grayscale[200]}` : undefined,
          }}
        />
      </Resizer>
    </Flex>
  )
}

const Resizer = styled.div<{ direction: DirectionType; borderRadius?: string }>`
  position: absolute;
  z-index: ${RESIZABLEPANEL};
  background-color: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${theme.colors.border.default};
  border-radius: 8px;
  flex-shrink: 0;
  ${({ direction }) =>
    direction === "vertical"
      ? `
            right: 0;
            top: 0;
            width: ${SIZE}px;
            height: 100%;
            cursor: ew-resize;
          `
      : `
            bottom: 0;
            left: 0;
            width: 100%;
            height: ${SIZE}px;
            cursor: ns-resize;
          `}/* ${({ direction, borderRadius, theme }) => {
    const radius =
      direction === "vertical"
        ? (borderRadius ?? `0 ${theme.borderRadius[4]} ${theme.borderRadius[4]} 0`)
        : (borderRadius ?? `0 0 ${theme.borderRadius[4]} ${theme.borderRadius[4]}`)

    const border =
      borderRadius !== undefined
        ? `border: 1px solid ${theme.colors.border.default};`
        : direction === "vertical"
          ? `border-left: 1px solid ${theme.colors.border.default};`
          : `border-top: 1px solid ${theme.colors.border.default};`

    return `
          ${border}
          border-radius: ${radius};
        `
  }} */
`

export default ResizablePanel

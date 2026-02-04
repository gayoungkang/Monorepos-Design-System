import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { theme } from "../../tokens/theme"
import { BaseMixin } from "../../tokens/baseMixin"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { RESIZABLEPANEL } from "../../types/zindex"
import type { DirectionType } from "../../types/layout"

const SIZE = 8

export type ResizablePanelProps = BaseMixinProps & {
  direction?: DirectionType
  minSize?: number
  maxSize?: number
  initialSize?: number
  borderRadius?: string
  children: ReactNode
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
/**---------------------------------------------------------------------------/
 *
 * ! ResizablePanel
 *
 * * 드래그로 패널의 한 축 크기(width/height)를 조절하는 리사이저 패널 컴포넌트입니다.
 * * `direction`에 따라 수직 리사이즈(가로 폭 조절) 또는 수평 리사이즈(세로 높이 조절)로 동작합니다.
 * * 내부 `size` 상태를 유지하며, 포인터 드래그 중 requestAnimationFrame으로 업데이트를 스로틀링합니다.
 * * `minSize`/`maxSize`/`initialSize` 변경에 따라 현재 size를 보정(clamp)하고, initialSize 변경은 “외부 초기화”로 재적용합니다.
 *
 * * 동작 규칙
 *   * 크기 범위:
 *     * 모든 size 계산은 `clamp(v, minSize, maxSize)`로 제한됩니다.
 *   * 초기/외부 변경 반영:
 *     * mount 시 `initialSize`를 clamp하여 size 초기화합니다.
 *     * `minSize`/`maxSize` 변경 시 현재 size를 재-clamp하여 범위 밖 값만 보정합니다.
 *     * `initialSize` 변경 시 clamp된 값으로 size를 재설정(외부 초기화 의도)합니다.
 *   * 드래그 처리(포인터 이벤트):
 *     * PointerDown(좌클릭): pointer capture 설정 → `isDragging=true` → 마지막 포인터 좌표 저장 → RAF 스케줄.
 *     * PointerMove: dragging 중이면 마지막 포인터 좌표만 갱신하고 RAF 스케줄.
 *     * PointerUp/Cancel: dragging 종료, 마지막 포인터 좌표 초기화, pointer capture 해제 시도(실패는 무시).
 *   * RAF 스케줄링:
 *     * 드래그 중 move 이벤트를 `requestAnimationFrame` 1프레임에 1회로 제한합니다.
 *     * lastPointerRef에 누적된 최종 좌표로 `computeNextSize`를 계산 후 `setSize(next)`를 수행합니다.
 *   * 언마운트 정리:
 *     * 예약된 RAF가 있으면 cancel하고 ref를 초기화합니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 패널 스타일:
 *     * vertical: `width: ${size}px`, `height: 100%`
 *     * horizontal: `height: ${size}px`, `width: 100%`
 *     * PanelRoot는 overflow hidden + relative 포지셔닝으로 리사이저를 절대 배치합니다.
 *   * 리사이저(Resizer):
 *     * vertical: 우측 고정(right: 0) + `width: SIZE(8px)` + `cursor: ew-resize`
 *     * horizontal: 하단 고정(bottom: 0) + `height: SIZE(8px)` + `cursor: ns-resize`
 *     * dragging 중에는 primary[200] 색상의 focus-ring 형태 box-shadow를 표시합니다.
 *     * hover 시 border-color를 primary[200]으로 강조합니다.
 *   * 그립(Grip):
 *     * 리사이저 중앙 정렬(absolute + translate)로 표시됩니다.
 *     * vertical은 세로 막대(좌/우 border), horizontal은 가로 막대(상/하 border)로 표현됩니다.
 *   * borderRadius:
 *     * `borderRadius`가 있으면 그대로 사용합니다.
 *     * 없으면 direction에 따라 우측/하단만 라운딩되도록 기본 radius를 계산합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `direction`: "vertical" | "horizontal" (기본 vertical)
 *     * `minSize`/`maxSize`: size 제한값, `initialSize`: 초기/리셋 기준값
 *     * `borderRadius`: 패널 라운딩 커스터마이즈
 *   * 내부 계산:
 *     * `computeNextSize(clientX, clientY)`는 panel rect 기준으로
 *       * vertical: `clientX - rect.left`
 *       * horizontal: `clientY - rect.top`
 *       값을 계산 후 clamp 합니다.
 *   * 서버/클라이언트 제어:
 *     * 크기 상태는 컴포넌트 내부에서 관리되며, 외부에서는 props 변경(initialSize/min/max)으로만 간접 제어됩니다.
 *
 * @module ResizablePanel
 * 포인터 드래그로 패널의 한 축 크기를 조절하는 리사이저 패널 UI를 제공합니다.
 *
 * @usage
 * <ResizablePanel direction="vertical" minSize={200} maxSize={900} initialSize={320}>
 *   {children}
 * </ResizablePanel>
 *
/---------------------------------------------------------------------------**/

const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  (
    {
      direction = "vertical",
      minSize = 100,
      maxSize = 800,
      initialSize = 300,
      borderRadius,
      children,
      ...others
    },
    ref,
  ) => {
    const panelRef = useRef<HTMLDivElement | null>(null)
    const rafRef = useRef<number | null>(null)
    const lastPointerRef = useRef<{ x: number; y: number } | null>(null)

    const [size, setSize] = useState(() => clamp(initialSize, minSize, maxSize))
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
      setSize((prev) => clamp(prev, minSize, maxSize))
    }, [minSize, maxSize])

    useEffect(() => {
      setSize(clamp(initialSize, minSize, maxSize))
    }, [initialSize, minSize, maxSize])

    useImperativeHandle(ref, () => panelRef.current as HTMLDivElement, [])

    const panelStyle = useMemo(() => {
      return direction === "vertical"
        ? ({ width: `${size}px`, height: "100%" } as const)
        : ({ height: `${size}px`, width: "100%" } as const)
    }, [direction, size])

    const computeNextSize = useCallback(
      (clientX: number, clientY: number) => {
        if (!panelRef.current) return null
        const rect = panelRef.current.getBoundingClientRect()

        if (direction === "vertical") {
          const next = clientX - rect.left
          return clamp(next, minSize, maxSize)
        }

        const next = clientY - rect.top
        return clamp(next, minSize, maxSize)
      },
      [direction, minSize, maxSize],
    )

    const flushRaf = useCallback(() => {
      if (!lastPointerRef.current) return
      const { x, y } = lastPointerRef.current
      const next = computeNextSize(x, y)
      if (next == null) return
      setSize(next)
    }, [computeNextSize])

    const scheduleRaf = useCallback(() => {
      if (rafRef.current != null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        flushRaf()
      })
    }, [flushRaf])

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        setIsDragging(true)
        lastPointerRef.current = { x: e.clientX, y: e.clientY }
        scheduleRaf()
      },
      [scheduleRaf],
    )

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return
        lastPointerRef.current = { x: e.clientX, y: e.clientY }
        scheduleRaf()
      },
      [isDragging, scheduleRaf],
    )

    const stopDragging = useCallback((e?: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(false)
      lastPointerRef.current = null
      if (e) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId)
        } catch {
          console.log("stopDragging::error")
        }
      }
    }, [])

    useEffect(() => {
      return () => {
        if (rafRef.current != null) {
          window.cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      }
    }, [])

    const resolvedRadius = useMemo(() => {
      if (borderRadius) return borderRadius
      if (direction === "vertical") return `0 ${theme.borderRadius[4]} ${theme.borderRadius[4]} 0`
      return `0 0 ${theme.borderRadius[4]} ${theme.borderRadius[4]}`
    }, [borderRadius, direction])

    return (
      <PanelRoot
        ref={panelRef}
        $borderRadius={resolvedRadius}
        sx={{
          ...panelStyle,
          backgroundColor: "transparent",
          overflow: "hidden",
          position: "relative",
          flexDirection: "column",
        }}
        {...others}
      >
        <Box width="100%" height="100%">
          {children}
        </Box>

        <Resizer
          direction={direction}
          $borderRadius={resolvedRadius}
          $dragging={isDragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <Grip direction={direction} />
        </Resizer>
      </PanelRoot>
    )
  },
)

const PanelRoot = styled(Flex)<BaseMixinProps & { $borderRadius: string }>`
  ${BaseMixin}
  border-radius: ${({ $borderRadius }) => $borderRadius};
`

const Resizer = styled.div<{
  direction: DirectionType
  $borderRadius: string
  $dragging: boolean
}>`
  position: absolute;
  z-index: ${RESIZABLEPANEL};
  background-color: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;
  flex-shrink: 0;
  touch-action: none;

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
      `}

  ${({ theme, $dragging }) =>
    $dragging
      ? `
        box-shadow: 0 0 0 2px ${theme.colors.primary[200]};
      `
      : ""}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[200]};
  }
`

const Grip = styled.div<{ direction: DirectionType }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  ${({ direction }) =>
    direction === "vertical"
      ? `
        width: ${SIZE / 2.5}px;
        height: 28px;
        border-left: 1px solid ${theme.colors.grayscale[200]};
        border-right: 1px solid ${theme.colors.grayscale[200]};
      `
      : `
        width: 28px;
        height: ${SIZE / 2.5}px;
        border-top: 1px solid ${theme.colors.grayscale[200]};
        border-bottom: 1px solid ${theme.colors.grayscale[200]};
      `}
`

export default ResizablePanel

import { ReactNode, RefObject, forwardRef, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { css } from "styled-components"
import { DirectionalPlacement } from "../../types"
import { POPOVER_ZINDEX } from "../../types/zindex"
import { styled } from "../../tokens/customStyled"
import { popover } from "../../tokens/keyframes"

export type PopperProps = {
  anchorRef: RefObject<HTMLElement | null>
  children: ReactNode
  placement?: DirectionalPlacement
  offsetX?: number
  offsetY?: number
  open: boolean
  showArrow?: boolean
  height?: string
  width?: "auto" | "anchor" | "max-content"
  onClose?: () => void
}

/**
 * @module Popper
 * 기준 요소(anchorRef) 위치를 기반으로 지정된 방향(placement)과 간격(offset)으로 팝업(Popper)을 띄우는 컴포넌트입니다.
 * 다양한 위치 설정, 화살표 표시, 반응형 너비 조정을 지원합니다.
 *
 * - 위치는 top, bottom, left, right 및 해당 방향의 start/end 조합을 제공합니다.
 * - anchorRef 기준 위치에서 상대적으로 Popper 위치를 계산합니다.
 * - 리사이즈 시 anchor 너비 반영하여 일관된 UI를 유지합니다.
 * - 옵션으로 화살표(Arrow) 표시가 가능합니다.
 * - open 여부에 따라 조건부 렌더링합니다.
 *
 * @props
 * - anchorRef: Popper의 기준 위치가 되는 HTMLElement의 ref
 * - children: Popper 내부에 표시될 콘텐츠
 * - placement: Popper가 열릴 위치 (기본값: "bottom")
 * - offsetX: X축 추가 오프셋(px, 기본값: 0)
 * - offsetY: Y축 추가 오프셋(px, 기본값: 8)
 * - open: Popper 표시 여부
 * - showArrow: 화살표 표시 여부 (기본값: false)
 * - height: Popper 최대 높이 (기본값: "300px")
 * - width: Popper 너비 지정 ("auto" | "anchor" | "max-content", 기본값: "auto")
 * - onClose: 외부 클릭 / ESC 등으로 닫기 트리거가 필요할 때 사용하는 콜백 (옵션)
 */

const Popper = forwardRef<HTMLDivElement, PopperProps>(
  (
    {
      anchorRef,
      children,
      placement = "bottom",
      offsetX = 0,
      offsetY = 8,
      open,
      showArrow = false,
      height = "300px",
      width = "auto",
      onClose,
    },
    ref,
  ) => {
    const [style, setStyle] = useState<React.CSSProperties>({})
    const containerRef = useRef<HTMLDivElement | null>(null)

    useLayoutEffect(() => {
      const anchor = anchorRef.current
      const popper = containerRef.current
      if (!anchor || !popper || !open) return

      const updatePosition = () => {
        const anchorRect = anchor.getBoundingClientRect()
        const popperRect = popper.getBoundingClientRect()

        const getPosition = () => {
          switch (placement) {
            case "top":
              return {
                left: anchorRect.left + anchorRect.width / 2 - popperRect.width / 2 + offsetX,
                top: anchorRect.top - popperRect.height - offsetY,
              }
            case "top-start":
              return {
                left: anchorRect.left + offsetX,
                top: anchorRect.top - popperRect.height - offsetY,
              }
            case "top-end":
              return {
                left: anchorRect.right - popperRect.width + offsetX,
                top: anchorRect.top - popperRect.height - offsetY,
              }
            case "bottom":
              return {
                left: anchorRect.left + anchorRect.width / 2 - popperRect.width / 2 + offsetX,
                top: anchorRect.bottom + offsetY,
              }
            case "bottom-start":
              return { left: anchorRect.left + offsetX, top: anchorRect.bottom + offsetY }
            case "bottom-end":
              return {
                left: anchorRect.right - popperRect.width + offsetX,
                top: anchorRect.bottom + offsetY,
              }
            case "left":
              return {
                left: anchorRect.left - popperRect.width - offsetX,
                top: anchorRect.top + anchorRect.height / 2 - popperRect.height / 2 + offsetY,
              }
            case "left-start":
              return {
                left: anchorRect.left - popperRect.width - offsetX,
                top: anchorRect.top + offsetY,
              }
            case "left-end":
              return {
                left: anchorRect.left - popperRect.width - offsetX,
                top: anchorRect.bottom - popperRect.height + offsetY,
              }
            case "right":
              return {
                left: anchorRect.right + offsetX,
                top: anchorRect.top + anchorRect.height / 2 - popperRect.height / 2 + offsetY,
              }
            case "right-start":
              return { left: anchorRect.right + offsetX, top: anchorRect.top + offsetY }
            case "right-end":
              return {
                left: anchorRect.right + offsetX,
                top: anchorRect.bottom - popperRect.height + offsetY,
              }
            default:
              return {
                left: anchorRect.left + anchorRect.width / 2 - popperRect.width / 2 + offsetX,
                top: anchorRect.bottom + offsetY,
              }
          }
        }

        const position = getPosition()
        const calculatedWidth =
          width === "anchor" ? anchorRect.width : width === "max-content" ? "max-content" : "auto"

        setStyle({
          position: "absolute",
          top: position.top + window.scrollY,
          left: position.left + window.scrollX,
          zIndex: POPOVER_ZINDEX,
          width: calculatedWidth,
        })
      }

      updatePosition()

      const roPopper = new ResizeObserver(updatePosition)
      roPopper.observe(popper)

      const roAnchor = new ResizeObserver(updatePosition)
      roAnchor.observe(anchor)

      window.addEventListener("scroll", updatePosition, true)
      window.addEventListener("resize", updatePosition)

      return () => {
        roPopper.disconnect()
        roAnchor.disconnect()
        window.removeEventListener("scroll", updatePosition, true)
        window.removeEventListener("resize", updatePosition)
      }
    }, [anchorRef, placement, offsetX, offsetY, open, width])

    useLayoutEffect(() => {
      if (!open) return

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return
        onClose?.()
      }

      const onPointerDownCapture = (e: PointerEvent) => {
        const popperEl = containerRef.current
        const anchorEl = anchorRef.current
        if (!popperEl) return

        const target = e.target as Node | null
        if (!target) return

        if (popperEl.contains(target)) return
        if (anchorEl && anchorEl.contains(target)) return
        onClose?.()
      }

      document.addEventListener("keydown", onKeyDown)
      document.addEventListener("pointerdown", onPointerDownCapture, true)

      return () => {
        document.removeEventListener("keydown", onKeyDown)
        document.removeEventListener("pointerdown", onPointerDownCapture, true)
      }
    }, [open, anchorRef, onClose])

    if (!open) return null

    return createPortal(
      <StyledPopper
        ref={(node) => {
          containerRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        placement={placement}
        height={height}
        style={style}
      >
        {showArrow && <Arrow placement={placement} />}
        {children}
      </StyledPopper>,
      document.body,
    )
  },
)

const StyledPopper = styled.div<{
  placement: DirectionalPlacement
  height: string
}>`
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.grayscale.white};
  box-shadow: ${({ theme }) => theme.shadows.elevation["8"]};
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  transition: opacity 0.2s ease;
  padding: 4px;
  height: auto;
  max-height: ${({ height }) => height};
  animation: ${popover} 0.2s cubic-bezier(0.25, 2, 0.5, 1) forwards;
`

const Arrow = styled.div<{ placement: DirectionalPlacement }>`
  width: 10px;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.grayscale.white};
  position: absolute;
  transform: rotate(45deg);

  ${({ placement }) => {
    switch (placement) {
      case "top":
        return css`
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
        `
      case "top-start":
        return css`
          bottom: -5px;
          left: 16px;
        `
      case "top-end":
        return css`
          bottom: -5px;
          right: 16px;
        `
      case "bottom":
        return css`
          top: -5px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
        `
      case "bottom-start":
        return css`
          top: -5px;
          left: 16px;
        `
      case "bottom-end":
        return css`
          top: -5px;
          right: 16px;
        `
      case "left":
        return css`
          right: -5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        `
      case "left-start":
        return css`
          right: -5px;
          top: 16px;
        `
      case "left-end":
        return css`
          right: -5px;
          bottom: 16px;
        `
      case "right":
        return css`
          left: -5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        `
      case "right-start":
        return css`
          left: -5px;
          top: 16px;
        `
      case "right-end":
        return css`
          left: -5px;
          bottom: 16px;
        `
      default:
        return ""
    }
  }}
`

export default Popper

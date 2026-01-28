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
/**---------------------------------------------------------------------------/
 *
 * ! Popper
 *
 * * anchorRef 기준으로 children을 document.body에 portal 렌더링하는 위치 고정 레이어 컴포넌트
 * * open=true일 때만 마운트되며, ResizeObserver + scroll/resize 이벤트로 위치를 동기화
 * * placement/offsetX/offsetY/width 옵션으로 기준 위치/오프셋/너비 정책을 제어
 * * RAF 스케줄링으로 1프레임 1회만 위치 계산을 수행해 연속 이벤트(scroll/resize/resizeObserver)를 합침
 * * ESC 및 바깥 클릭(pointerdown capture)으로 닫기(onClose) 트리거 지원
 * * showArrow 옵션으로 placement에 따라 화살표(Arrow) 위치를 분기 렌더링
 *
 * * 동작 규칙
 *   * 주요 분기 조건 및 처리 우선순위
 *     * open=false면 null 반환(언마운트)
 *     * anchorRef.current / containerRef.current가 없으면 위치 계산/옵저빙을 수행하지 않음
 *     * fixed 포지셔닝이 아닌 absolute + scrollX/scrollY 보정으로 문서 기준 좌표를 유지
 *     * width 정책: "anchor"면 anchorRect.width, "max-content"면 "max-content", 그 외 "auto"
 *   * 이벤트 처리 방식
 *     * scroll(캡처, true) / resize / ResizeObserver(popover/anchor) 발생 시 scheduleUpdate로 RAF 1회 업데이트
 *     * Escape 키 입력 시 onClose 호출
 *     * document pointerdown(capture, true)에서 popper/anchor 외부 클릭 시 onClose 호출
 *   * disabled 상태에서 차단되는 동작
 *     * 별도 disabled 없음(open 제어로만 동작)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * z-index: POPOVER_ZINDEX 사용
 *   * StyledPopper: max-height(height), overflow-y:auto, box-shadow/round/padding, popover keyframes 애니메이션 적용
 *   * Arrow: placement별로 top/bottom/left/right에 절대 배치, 45도 회전으로 삼각형 표현
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(필수/선택)
 *     * anchorRef: 필수(기준 엘리먼트 ref)
 *     * open: 필수(마운트/언마운트 제어)
 *     * placement/offsetX/offsetY/width/height/showArrow/onClose: 옵션
 *   * 내부 계산 로직 요약
 *     * anchorRect/popperRect 기반 base 좌표를 placement별로 계산 후 offsetX/Y 및 window.scrollX/Y를 더해 style 반영
 *     * scheduleUpdate로 RAF 단위로 updatePosition 호출을 합침
 *   * 서버 제어/클라이언트 제어 여부
 *     * 클라이언트 전용(DOM 측정/portal/observer 사용)
 *
 * @module Popper
 * anchorRef 기준으로 위치를 계산해 portal로 띄우는 팝오버/드롭다운 베이스 컴포넌트
 *
 * @usage
 * <Popper
 *   open={open}
 *   anchorRef={anchorRef}
 *   placement="bottom-start"
 *   onClose={() => setOpen(false)}
 * >
 *   {children}
 * </Popper>
 *
/---------------------------------------------------------------------------**/

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
    const rafIdRef = useRef<number | null>(null)

    // * ref 병합 (containerRef + forwardRef)
    const setMergedRef = (node: HTMLDivElement | null) => {
      containerRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    }

    // * 1프레임 1회로 위치 업데이트를 합치는 스케줄러
    const scheduleUpdate = () => {
      if (rafIdRef.current !== null) return
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null
        updatePosition()
      })
    }

    // * 실제 위치 계산/반영
    const updatePosition = () => {
      const anchor = anchorRef.current
      const popper = containerRef.current
      if (!anchor || !popper || !open) return

      const anchorRect = anchor.getBoundingClientRect()
      const popperRect = popper.getBoundingClientRect()

      const base = (() => {
        switch (placement) {
          case "top":
            return {
              left: anchorRect.left + anchorRect.width / 2 - popperRect.width / 2,
              top: anchorRect.top - popperRect.height,
            }
          case "top-start":
            return { left: anchorRect.left, top: anchorRect.top - popperRect.height }
          case "top-end":
            return {
              left: anchorRect.right - popperRect.width,
              top: anchorRect.top - popperRect.height,
            }

          case "bottom":
            return {
              left: anchorRect.left + anchorRect.width / 2 - popperRect.width / 2,
              top: anchorRect.bottom,
            }
          case "bottom-start":
            return { left: anchorRect.left, top: anchorRect.bottom }
          case "bottom-end":
            return { left: anchorRect.right - popperRect.width, top: anchorRect.bottom }

          case "left":
            return {
              left: anchorRect.left - popperRect.width,
              top: anchorRect.top + anchorRect.height / 2 - popperRect.height / 2,
            }
          case "left-start":
            return { left: anchorRect.left - popperRect.width, top: anchorRect.top }
          case "left-end":
            return {
              left: anchorRect.left - popperRect.width,
              top: anchorRect.bottom - popperRect.height,
            }

          case "right":
            return {
              left: anchorRect.right,
              top: anchorRect.top + anchorRect.height / 2 - popperRect.height / 2,
            }
          case "right-start":
            return { left: anchorRect.right, top: anchorRect.top }
          case "right-end":
            return { left: anchorRect.right, top: anchorRect.bottom - popperRect.height }

          default:
            return {
              left: anchorRect.left + anchorRect.width / 2 - popperRect.width / 2,
              top: anchorRect.bottom,
            }
        }
      })()

      const calculatedWidth: React.CSSProperties["width"] =
        width === "anchor" ? anchorRect.width : width === "max-content" ? "max-content" : "auto"

      setStyle({
        position: "absolute",
        top: base.top + offsetY + window.scrollY,
        left: base.left + offsetX + window.scrollX,
        zIndex: POPOVER_ZINDEX,
        width: calculatedWidth,
      })
    }

    useLayoutEffect(() => {
      if (!open) return

      const anchor = anchorRef.current
      const popper = containerRef.current
      if (!anchor || !popper) return

      updatePosition()

      const roPopper = new ResizeObserver(scheduleUpdate)
      roPopper.observe(popper)

      const roAnchor = new ResizeObserver(scheduleUpdate)
      roAnchor.observe(anchor)

      window.addEventListener("scroll", scheduleUpdate, true)
      window.addEventListener("resize", scheduleUpdate)

      return () => {
        roPopper.disconnect()
        roAnchor.disconnect()
        window.removeEventListener("scroll", scheduleUpdate, true)
        window.removeEventListener("resize", scheduleUpdate)

        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }
      }
    }, [open, placement, offsetX, offsetY, width])

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
      <StyledPopper ref={setMergedRef} placement={placement} height={height} style={style}>
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

Popper.displayName = "Popper"
export default Popper

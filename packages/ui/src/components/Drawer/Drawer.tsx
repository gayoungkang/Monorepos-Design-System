import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { BaseMixin } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import Box from "../Box/Box"
import { cssValue } from "../../utils/string"
import { canUseDOM } from "../../utils/canUseDOM"
import type { AxisPlacement } from "../../types/placement"

export type DrawerVariant = "fixed" | "absolute" | "flex"
export type DrawerCloseBehavior = "hidden" | "collapsed"

export type DrawerProps = BaseMixinProps & {
  open: boolean
  onClose?: () => void
  placement?: AxisPlacement
  variant?: DrawerVariant
  closeBehavior?: DrawerCloseBehavior
  width?: number | string
  height?: number | string
  collapsedSize?: number | string
  container?: HTMLElement
  disableBackdrop?: boolean
  overlay?: boolean
  boxShadow?: string
  children: ReactNode
}

const DRAWER_TRANSITION_MS = 300

// * AxisPlacement를 축 기준(left/right/top/bottom)으로 정규화
const normalizePlacement = (p: AxisPlacement): "left" | "right" | "top" | "bottom" => {
  if (p.startsWith("left")) return "left"
  if (p.startsWith("right")) return "right"
  if (p.startsWith("top")) return "top"
  if (p.startsWith("bottom")) return "bottom"
  return "left"
}

/**---------------------------------------------------------------------------/
 *
 * ! Drawer
 *
 * * 화면의 특정 방향(left/right/top/bottom)에서 슬라이드 인/아웃되는 Drawer 레이아웃 컴포넌트
 * * `variant(fixed|absolute|flex)`에 따라 렌더링 방식(포탈/비포탈)과 레이아웃 성격(overlay/inline)이 달라짐
 * * `closeBehavior(hidden|collapsed)`로 닫힘 시 처리(완전 숨김 vs 축소 유지)를 제어하며, overlay일 때는 Backdrop을 지원
 *
 * * 동작 규칙
 *   * placement 정규화
 *     * AxisPlacement(left-start 등)을 축 기준(left/right/top/bottom)으로 정규화하여 실제 배치 기준으로 사용
 *   * variant 처리
 *     * fixed: 기본적으로 portal로 document.body(또는 container) 아래에 렌더링
 *     * absolute/flex: 반드시 렌더 트리 내부에서 동작해야 하므로 portal을 사용하지 않음
 *   * overlay 처리
 *     * overlay는 `variant === "fixed"`일 때만 유효
 *     * `isOverlay = fixed && overlay`
 *     * overlay + open + !disableBackdrop이면 Backdrop을 렌더링하고 클릭 시 `onClose` 호출
 *   * closeBehavior 처리
 *     * hidden
 *       * overlay 모드에서만 “닫힘 시 언마운트”를 수행(transition 후 제거)
 *       * `shouldUnmount = isOverlay && closeBehavior === "hidden"`
 *     * collapsed
 *       * 닫힘 상태에서도 화면에 남기되, placement 축에 따라 width/height를 collapsedSize로 축소
 *   * 언마운트 타이밍
 *     * shouldUnmount가 true일 때
 *       * open → mounted=true 즉시 렌더
 *       * close → DRAWER_TRANSITION_MS(300ms) 후 mounted=false로 전환하여 렌더 제거
 *   * 이벤트 전파
 *     * DrawerContainer 내부 클릭은 `onClickCapture`로 stopPropagation하여 backdrop/외부 클릭 영향 최소화
 *   * SSR/테스트 안전
 *     * fixed + portal 경로에서 `document`가 없으면 null 반환
 *
 * * 레이아웃/스타일 관련 규칙
 *   * Backdrop
 *     * 화면 전체 fixed overlay(inset:0) + dim 색상 + modal z-index 사용
 *   * DrawerContainer
 *     * Box 기반 + BaseMixin 적용(외부 sx/spacing 확장 가능)
 *     * 배경: white, 그림자: boxShadow prop 또는 elevation[8]
 *     * 트랜지션: transform/width/height(300ms) + opacity(250ms)
 *     * variant별 positioning
 *       * fixed: position: fixed, z-index: modal+1
 *       * absolute: position: absolute, z-index: content
 *       * flex: position: relative, display:flex, flex-shrink:0
 *     * placement별 치수/고정 위치
 *       * left/right: width 지정 + height 100%
 *       * top/bottom: height 지정 + width 100%
 *     * open/close 표현
 *       * open: translate(0,0), opacity 1
 *       * collapsed: translate 유지 + width/height를 collapsedSize로 축소, opacity 1
 *       * hidden: placement 방향으로 -100%/+100% translate, opacity 0
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `open`은 표시 상태의 단일 기준 값
 *     * `onClose`는 backdrop 클릭 등 “외부 닫기 트리거”에서 호출
 *     * `width/height/collapsedSize`는 number|string을 지원하며 `cssValue`로 CSS 단위 문자열로 변환
 *     * `container`는 fixed variant portal 타겟을 지정(기본 document.body)
 *     * `disableBackdrop`은 overlay backdrop 렌더링을 비활성화
 *   * 내부 계산 로직
 *     * `resolvedPlacement/isFixed/isOverlay/shouldUnmount`로 렌더 경로 및 언마운트 정책을 결정
 *     * mounted state는 shouldUnmount가 true인 경우에만 사용하여 transition과 DOM 제거 타이밍을 분리
 *
 * @module Drawer
 * placement/variant/closeBehavior 조합으로 다양한 사용 시나리오(overlay/inline/축소 유지)를 지원하는 슬라이드 Drawer 컴포넌트
 *
 * @usage
 * <Drawer open={open} onClose={() => setOpen(false)} placement="right" variant="fixed" overlay />
 * <Drawer open={open} placement="top" variant="absolute" height={220} />
 * <Drawer open={open} placement="left" variant="fixed" closeBehavior="collapsed" collapsedSize={56} />
 *
/---------------------------------------------------------------------------**/

const Drawer = ({
  open,
  onClose,
  placement = "left",
  variant = "fixed",
  closeBehavior = "hidden",
  width = 280,
  height = 280,
  collapsedSize = 56,
  container,
  disableBackdrop = false,
  overlay = true,
  boxShadow,
  children,
  ...others
}: DrawerProps) => {
  const resolvedPlacement = useMemo(() => normalizePlacement(placement), [placement])

  const isFixed = variant === "fixed"
  const isOverlay = isFixed && overlay
  const shouldUnmount = isOverlay && closeBehavior === "hidden"

  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (!shouldUnmount) return

    if (open) {
      setMounted(true)
      return
    }

    const timer = setTimeout(() => setMounted(false), DRAWER_TRANSITION_MS)
    return () => clearTimeout(timer)
  }, [open, shouldUnmount])

  if (shouldUnmount && !mounted) return null

  const content = (
    <>
      {!disableBackdrop && isOverlay && open && <Backdrop onClick={onClose} />}

      <DrawerContainer
        $placement={resolvedPlacement}
        $variant={variant}
        $open={open}
        $closeBehavior={closeBehavior}
        $width={width}
        $height={height}
        $collapsedSize={collapsedSize}
        $boxShadow={boxShadow}
        onClickCapture={(e) => e.stopPropagation()}
        {...others}
      >
        {children}
      </DrawerContainer>
    </>
  )

  // * absolute/flex는 반드시 렌더 트리 내에서 동작해야 함(portal 금지)
  if (!isFixed) return content

  // * SSR/테스트 안전 처리
  if (!canUseDOM()) return null

  return createPortal(content, container ?? document.body)
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.dim.default};
  z-index: ${({ theme }) => theme.zIndex.modal};
`

const DrawerContainer = styled(Box)<{
  $placement: "left" | "right" | "top" | "bottom"
  $variant: DrawerVariant
  $open: boolean
  $closeBehavior: DrawerCloseBehavior
  $width: number | string
  $height: number | string
  $collapsedSize: number | string
  $boxShadow?: string
}>`
  ${BaseMixin};

  background-color: ${({ theme }) => theme.colors.grayscale.white};
  box-shadow: ${({ theme, $boxShadow }) => $boxShadow ?? theme.shadows.elevation[8]};

  transition:
    transform ${DRAWER_TRANSITION_MS}ms ease,
    width ${DRAWER_TRANSITION_MS}ms ease,
    height ${DRAWER_TRANSITION_MS}ms ease,
    opacity 250ms ease;

  ${({ theme, $variant }) => {
    switch ($variant) {
      case "fixed":
        return `position: fixed; z-index: ${theme.zIndex.modal + 1};`
      case "absolute":
        return `position: absolute; z-index: ${theme.zIndex.content};`
      case "flex":
        return `
          position: relative;
          display: flex;
          flex-shrink: 0;
        `
    }
  }}

  ${({ $placement, $width, $height }) => {
    switch ($placement) {
      case "left":
        return `left:0; top:0; width:${cssValue($width)}; height:100%;`
      case "right":
        return `right:0; top:0; width:${cssValue($width)}; height:100%;`
      case "top":
        return `top:0; left:0; width:100%; height:${cssValue($height)};`
      case "bottom":
        return `bottom:0; left:0; width:100%; height:${cssValue($height)};`
    }
  }}

  ${({ $open, $closeBehavior, $placement, $collapsedSize }) => {
    if ($open) return `transform: translate(0,0); opacity:1;`

    if ($closeBehavior === "collapsed") {
      return $placement === "left" || $placement === "right"
        ? `width:${cssValue($collapsedSize)}; transform: translate(0,0); opacity:1;`
        : `height:${cssValue($collapsedSize)}; transform: translate(0,0); opacity:1;`
    }

    switch ($placement) {
      case "left":
        return `transform: translateX(-100%); opacity:0;`
      case "right":
        return `transform: translateX(100%); opacity:0;`
      case "top":
        return `transform: translateY(-100%); opacity:0;`
      case "bottom":
        return `transform: translateY(100%); opacity:0;`
    }
  }}
`

export default Drawer

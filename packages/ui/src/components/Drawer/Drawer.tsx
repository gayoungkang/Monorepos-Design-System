import { ReactNode, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { AxisPlacement } from "../../types"
import { theme } from "../../tokens/theme"
import Box from "../Box/Box"
import { cssValue } from "../../utils/string"

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
/**---------------------------------------------------------------------------/

* ! Drawer
*
* * 화면 가장자리(left / right / top / bottom)에 표시되는 Drawer 컴포넌트
* * fixed / absolute / flex 레이아웃 변형 지원
* * open 상태에 따른 슬라이드 인·아웃 애니메이션 처리
* * hidden / collapsed 닫힘 동작 지원
* * fixed variant에서 overlay(backdrop) 렌더링 및 클릭 닫기 지원
* * 애니메이션 종료 후 unmount 제어 로직 포함
* * portal 기반 렌더링 또는 레이아웃 흐름 포함 렌더링 선택 가능
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상, shadow, z-index 시스템 활용
*
* @module Drawer
* 사이드 영역을 화면 가장자리에 표시하는 레이아웃 컴포넌트입니다.
* - `placement`에 따라 표시 방향(left/right/top/bottom) 결정
* - `variant`에 따라 fixed / absolute / flex 렌더링 방식 선택
* - `closeBehavior`를 통해 hidden(슬라이드 아웃) 또는 collapsed(축소) 동작 제어
* - fixed + hidden 조합 시 애니메이션 종료 후 DOM unmount 처리
* - backdrop 클릭을 통한 닫기 동작(onClose) 지원
*
* @usage
* <Drawer open placement="left">...</Drawer>
* <Drawer open={open} variant="flex" closeBehavior="collapsed">...</Drawer>

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
  const isOverlay = variant === "fixed" && overlay
  const shouldUnmount = isOverlay && closeBehavior === "hidden"

  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (!shouldUnmount) return

    if (open) {
      setMounted(true)
      return
    }

    const timer = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(timer)
  }, [open, shouldUnmount])

  if (shouldUnmount && !mounted) return null

  const content = (
    <>
      {!disableBackdrop && isOverlay && open && <Backdrop onClick={onClose} />}

      <DrawerContainer
        placement={placement}
        variant={variant}
        open={open}
        closeBehavior={closeBehavior}
        width={width}
        height={height}
        collapsedSize={collapsedSize}
        boxShadow={boxShadow}
        {...others}
      >
        {children}
      </DrawerContainer>
    </>
  )

  if (variant === "flex") return content

  return createPortal(content, container ?? document.body)
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${theme.colors.dim.default};
  z-index: ${theme.zIndex.modal};
`

const DrawerContainer = styled(Box)<{
  placement: AxisPlacement
  variant: DrawerVariant
  open: boolean
  closeBehavior: DrawerCloseBehavior
  width: number | string
  height: number | string
  collapsedSize: number | string
  boxShadow?: string
}>`
  ${BaseMixin};

  background-color: ${theme.colors.grayscale.white};
  box-shadow: ${({ boxShadow }) => boxShadow ?? theme.shadows.elevation[8]};

  transition:
    transform 0.3s ease,
    width 0.3s ease,
    height 0.3s ease,
    opacity 0.25s ease;

  ${({ variant }) => {
    switch (variant) {
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

  ${({ placement, width, height }) => {
    switch (placement) {
      case "left":
        return `left:0; top:0; width:${cssValue(width)}; height:100%;`
      case "right":
        return `right:0; top:0; width:${cssValue(width)}; height:100%;`
      case "top":
        return `top:0; left:0; width:100%; height:${cssValue(height)};`
      case "bottom":
        return `bottom:0; left:0; width:100%; height:${cssValue(height)};`
    }
  }}

  ${({ open, closeBehavior, placement, collapsedSize }) => {
    if (open) return `transform: translate(0,0); opacity:1;`

    if (closeBehavior === "collapsed") {
      return placement === "left" || placement === "right"
        ? `width:${cssValue(collapsedSize)};`
        : `height:${cssValue(collapsedSize)};`
    }

    switch (placement) {
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

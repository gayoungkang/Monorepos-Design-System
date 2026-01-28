import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { styled } from "../../tokens/customStyled"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { AxisPlacement } from "../../types/placement"

export type TooltipProps = BaseMixinProps & {
  children: ReactNode
  content: string
  maxWidth?: string
  placement?: AxisPlacement
}
/**---------------------------------------------------------------------------/
 *
 * ! Tooltip
 *
 * * 트리거(children)에 마우스 오버/포커스 시 고정 위치(position: fixed)로 툴팁 버블을 표시하는 컴포넌트입니다.
 * * `placement`(top/bottom/left/right)에 따라 트리거 요소 기준으로 표시 좌표를 계산하고, transform으로 앵커 정렬을 보정합니다.
 * * 스크롤/리사이즈/휠 이벤트 발생 시 requestAnimationFrame으로 좌표 재계산을 스로틀링하여 부드럽게 위치를 갱신합니다.
 * * `content`가 비어있으면 열리지 않으며, 열림 상태에서만 이벤트 리스너를 등록/해제합니다.
 * * BaseMixin 기반 외부 스타일 확장(sx 포함) 및 theme 토큰 기반 색상/레이어링을 사용합니다.
 *
 * * 주요 로직
 *   * calcPosition():
 *     * triggerRef.getBoundingClientRect() 기반으로 placement별 top/left를 계산합니다.
 *     * offset(8px)을 적용해 트리거와의 간격을 확보합니다.
 *     * 좌표는 FixedTooltipBubble에 sx로 주입됩니다({ top, left }).
 *   * scheduleCalc():
 *     * rafRef로 이전 RAF를 취소 후, 다음 프레임에 calcPosition()을 실행합니다.
 *     * 스크롤/리사이즈/휠 이벤트에서 연속 호출되더라도 1프레임 단위로 갱신합니다.
 *   * open()/close():
 *     * open(): content가 있을 때만 scheduleCalc() 후 isOpen=true 설정
 *     * close(): isOpen=false 설정
 *
 * * 이벤트/라이프사이클
 *   * TriggerWrapper:
 *     * onMouseEnter/open, onMouseLeave/close
 *     * onFocus/open, onBlur/close (tabIndex=0으로 키보드 포커스 가능)
 *   * isOpen === true 인 동안:
 *     * window scroll(true capture), resize, wheel(true capture) 이벤트로 scheduleCalc() 실행
 *   * unmount 시:
 *     * rafRef가 있으면 cancelAnimationFrame으로 정리
 *
 * * 스타일 규칙
 *   * TriggerWrapper:
 *     * inline-block + outline 제거(포커스 링은 외부에서 필요 시 sx로)
 *   * FixedTooltipBubble:
 *     * position: fixed (뷰포트 기준)
 *     * z-index: theme.zIndex.tooltip
 *     * pointer-events: none (툴팁이 마우스 이벤트를 가로채지 않음)
 *     * placement별 transform:
 *       * top:    translate(-50%, -100%)
 *       * bottom: translate(-50%, 0)
 *       * left:   translate(-100%, -50%)
 *       * right:  translate(0, -50%)
 *     * maxWidth 기본 300px, pre-wrap + break-word로 긴 텍스트 대응
 *
 * @module Tooltip
 * 호버/포커스 시 트리거 주변에 내용을 표시하는 툴팁 컴포넌트입니다.
 *
 * @usage
 * <Tooltip content="도움말" placement="top">
 *   <Button text="Hover" />
 * </Tooltip>
 *
/---------------------------------------------------------------------------**/

export const Tooltip = ({
  children,
  content,
  maxWidth,
  placement = "bottom",
  ...others
}: TooltipProps) => {
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const calcPosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const offset = 8
    let top = 0
    let left = 0

    switch (placement) {
      case "top":
        top = rect.top - offset
        left = rect.left + rect.width / 2
        break
      case "bottom":
        top = rect.bottom + offset
        left = rect.left + rect.width / 2
        break
      case "left":
        top = rect.top + rect.height / 2
        left = rect.left - offset
        break
      case "right":
        top = rect.top + rect.height / 2
        left = rect.right + offset
        break
      default:
        top = rect.bottom + offset
        left = rect.left + rect.width / 2
        break
    }

    setCoords({ top, left })
  }, [placement])

  const scheduleCalc = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      calcPosition()
      rafRef.current = null
    })
  }, [calcPosition])

  const open = () => {
    if (!content) return
    scheduleCalc()
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return

    const onScroll = () => scheduleCalc()
    const onResize = () => scheduleCalc()
    const onWheel = () => scheduleCalc()

    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)
    window.addEventListener("wheel", onWheel, true)

    return () => {
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("wheel", onWheel, true)
    }
  }, [isOpen, scheduleCalc])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <TriggerWrapper
      ref={triggerRef}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      tabIndex={0}
    >
      {children}

      {isOpen && !!content && (
        <FixedTooltipBubble
          {...others}
          $placement={placement}
          $maxWidth={maxWidth}
          style={{ top: coords.top, left: coords.left }}
        >
          {content}
        </FixedTooltipBubble>
      )}
    </TriggerWrapper>
  )
}

Tooltip.displayName = "Tooltip"

const TriggerWrapper = styled.div`
  display: inline-block;
  position: relative;
  outline: none;
`

const FixedTooltipBubble = styled.div<
  BaseMixinProps & {
    $maxWidth?: string
    $placement: AxisPlacement
  }
>`
  ${BaseMixin}
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  background: ${({ theme }) => theme.colors.grayscale[600]};
  color: ${({ theme }) => theme.colors.grayscale.white};
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  padding: 6px 12px;
  font-size: 12px;
  pointer-events: none;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: ${({ $maxWidth }) => $maxWidth ?? "300px"};

  ${({ $placement }) => {
    switch ($placement) {
      case "top":
        return `transform: translate(-50%, -100%);`
      case "bottom":
        return `transform: translate(-50%, 0);`
      case "left":
        return `transform: translate(-100%, -50%);`
      case "right":
        return `transform: translate(0, -50%);`
      default:
        return `transform: translate(-50%, 0);`
    }
  }}
`

export default Tooltip

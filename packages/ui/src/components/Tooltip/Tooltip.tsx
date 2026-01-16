import { ReactNode, useEffect, useRef, useState } from "react"
import { styled } from "../../tokens/customStyled"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { AxisPlacement } from "../../types/placement"

export type TooltipProps = BaseMixinProps & {
  children: ReactNode
  content: string
  maxWidth?: string
  placement?: AxisPlacement
}
/** ---------------------------------------------------------------------------

* ! `Tooltip` 컴포넌트

* * 마우스 호버 시 간단한 설명이나 메시지를 표시해주는 **커스텀 툴팁 컴포넌트**입니다.
* * `children` 요소에 마우스를 올리면 `Tooltip`이 위치 계산을 기반으로 화면에 고정(`position: fixed`)되어 렌더링됩니다.
* * 스크롤이 발생해도 위치를 자동으로 재계산하여 툴팁의 정확한 위치를 유지합니다.
* * `placement` 속성을 통해 툴팁이 표시될 방향을 설정할 수 있으며, 기본값은 `'bottom'`입니다.
* * 스타일은 `styled-components`를 사용해 동적으로 적용되며, 테마 색상 및 여백을 지원합니다.
* * `BaseMixin` 기반 스타일 확장

* 주요 Props:
* - `children`: 툴팁이 적용될 요소 (마우스 호버 대상).
* - `content`: 툴팁에 표시될 텍스트 콘텐츠.
* - `maxWidth`: 툴팁의 최대 너비를 설정합니다 (기본값: `'300px'`).
* - `placement`: 툴팁이 표시될 방향. `'top' | 'bottom' | 'left' | 'right'` 중 하나입니다.

* 예시:
* ```tsx
* <Tooltip content="설명 텍스트입니다" placement="top">
*   <button>버튼</button>
* </Tooltip>
* ```

--------------------------------------------------------------------------- **/

export const Tooltip = ({
  children,
  content,
  maxWidth,
  width = "max-content",
  placement = "bottom",
  ...otehrs
}: TooltipProps) => {
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  // * 툴팁 위치를 트리거 요소 기준으로 계산하여 설정
  const showTooltip = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
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
          break
      }

      setCoords({ top, left })
    }
  }

  // * 툴팁 숨김 핸들러
  const hideTooltip = () => {
    setIsOpen(false)
  }

  // * 마우스 hover 시 툴팁 노출 핸들러
  const handleMouseEnter = () => {
    showTooltip()
    setIsOpen(true)
  }

  // * 스크롤 시 툴팁 위치 재계산 및 갱신
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        showTooltip()
      }
    }

    window.addEventListener("scroll", handleScroll, true)
    return () => {
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [isOpen])

  return (
    <TriggerWrapper ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={hideTooltip}>
      {children}
      {isOpen && (
        <FixedTooltipBubble
          maxWidth={maxWidth}
          placement={placement}
          width={width}
          sx={{ top: coords.top, left: coords.left }}
          {...otehrs}
        >
          {content}
        </FixedTooltipBubble>
      )}
    </TriggerWrapper>
  )
}

const TriggerWrapper = styled.div`
  display: inline-block;
  position: relative;
`

const FixedTooltipBubble = styled.div<
  BaseMixinProps & {
    maxWidth?: string
    placement?: TooltipProps["placement"]
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
  max-width: ${({ maxWidth }) => maxWidth ?? "300px"};

  ${({ placement }) => {
    switch (placement) {
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

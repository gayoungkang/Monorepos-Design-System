import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { theme } from "../../tokens/theme"
import { styled } from "../../tokens/customStyled"
import { css } from "styled-components"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { ColorUiType, SizeUiType } from "../../types"
import IconButton from "../IconButton/IconButton"

export type TabOptionsType = {
  label: string
  value: string
  hidden?: boolean
  disabled?: boolean
}

export type TabProps = BaseMixinProps & {
  options: TabOptionsType[]
  value: string | null
  size: SizeUiType
  color?: ColorUiType | string
  onSelect: (value: string) => void
  scrollbarVisible?: boolean
  scrollButtonsVisible?: boolean
}

const resolveColor = (color: ColorUiType | string) => {
  if (color === "primary") return theme.colors.primary[400]
  if (color === "secondary") return theme.colors.secondary[400]
  if (color === "normal") return theme.colors.text.primary
  return color
}

const sizeStyle: Record<
  SizeUiType,
  { height: string; padding: string; fontSize: string; gap: string }
> = {
  S: { height: "28px", padding: "0 8px", fontSize: "12px", gap: "8px" },
  M: { height: "40px", padding: "0 12px", fontSize: "14px", gap: "16px" },
  L: { height: "48px", padding: "0 16px", fontSize: "16px", gap: "20px" },
}

const isScrollableX = (el: HTMLElement) => el.scrollWidth > el.clientWidth + 1
/**---------------------------------------------------------------------------/
 *
 * ! Tabs
 *
 * * 탭 목록(options)을 수평 스크롤 가능한 탭바로 렌더링하는 Tabs 컴포넌트입니다.
 * * `value`로 현재 선택된 탭을 결정하는 controlled 컴포넌트이며, 탭 클릭/키보드 선택 시 `onSelect`로 값을 전달합니다.
 * * `hidden` 옵션은 렌더 대상에서 제외하고, `disabled` 옵션은 선택/포커스 상호작용을 제한합니다.
 * * 활성 탭의 위치/폭을 기반으로 인디케이터(underline)를 계산하여 표시합니다.
 * * 컨테이너가 가로로 스크롤 가능한 경우, 휠(deltaY)을 가로 스크롤로 변환하고(옵션), 스크롤 버튼 표시도 지원합니다.
 * * ResizeObserver로 컨테이너 크기 변경 시 인디케이터 및 스크롤 가능 상태를 재계산합니다.
 *
 * * 동작 규칙
 *   * 표시 대상:
 *     * `visibleOptions = options.filter(o => !o.hidden)`로 hidden 탭은 제외합니다.
 *   * 활성 탭 인덱스:
 *     * `activeIndex = value === null ? -1 : visibleOptions.findIndex(o => o.value === value)`
 *   * 포커스 인덱스(focusIndex):
 *     * 초기값 0, activeIndex가 유효하면 focusIndex를 activeIndex로 동기화합니다.
 *     * 각 탭은 roving tabIndex 패턴을 사용하여 `idx === focusIndex`만 tabIndex=0, 나머지는 -1을 부여합니다.
 *   * 인디케이터(updateIndicator):
 *     * activeIndex가 -1이면 `{ left: 0, width: 0 }`로 숨김 상태를 유지합니다.
 *     * 활성 탭 DOM(tabRefs.current[activeIndex])의 `offsetLeft/offsetWidth`로 인디케이터 left/width를 갱신합니다.
 *   * 스크롤 버튼 활성화(updateScrollButtons):
 *     * `canScrollLeft = scrollLeft > 0`
 *     * `canScrollRight = scrollLeft + clientWidth < scrollWidth - 1`
 *   * 활성 탭 자동 노출(scrollActiveIntoView):
 *     * 활성 탭의 좌/우 경계가 뷰포트 밖이면 scrollTo로 보이도록 이동합니다.
 *   * 스크롤 버튼 동작:
 *     * `scrollByStep(delta)`로 smooth 스크롤 이동(좌/우 160px)합니다.
 *   * 키보드 제어(onKeyDownTabList):
 *     * ArrowRight/ArrowLeft: focusIndex ±1 이동 후 해당 버튼 focus + scrollIntoView
 *     * Home/End: 첫/마지막 탭으로 이동
 *     * Enter/Space: 현재 focusIndex 탭이 disabled가 아니면 `onSelect(value)` 호출
 *   * 휠 스크롤(onWheel):
 *     * 컨테이너가 가로 스크롤 가능(isScrollableX)한 경우, deltaY를 가로 스크롤로 변환하여 smooth 이동합니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 크기(sizeStyle):
 *     * size(S/M/L)에 따라 탭 높이/패딩/폰트/간격(gap)을 결정합니다.
 *   * 구조:
 *     * TabsWrapper: 좌/우 스크롤 버튼 영역 + ScrollContainer(tablist)로 구성됩니다.
 *     * ScrollContainer: overflow-x auto, gap 적용, scrollbarVisible=false면 스크롤바를 숨깁니다.
 *   * 탭 버튼(StyledTabButton):
 *     * disabled면 cursor not-allowed + opacity 0.5
 *     * focus-visible 시 primary[200] 링 표시
 *     * active면 ::after underline을 표시(색상은 resolveColor 기반)
 *   * 인디케이터(Indicator):
 *     * 활성 탭의 left/width로 absolute 이동하며 transition으로 부드럽게 변경됩니다.
 *     * width가 0이면 opacity 0으로 숨김 처리합니다.
 *   * 하단 라인:
 *     * ScrollContainer는 size가 M이 아닐 때(::before) 하단 1px 라인을 추가하여 베이스라인을 제공합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `options`: 탭 목록(label/value/hidden/disabled)
 *     * `value`: 선택된 탭 값(null 가능)
 *     * `onSelect`: 선택 콜백(탭 클릭/키보드 선택)
 *     * `size`: 탭 높이/패딩/폰트 및 레이아웃 기준
 *     * `color`: primary/secondary/normal 또는 임의 색상 문자열(선택/인디케이터 색상)
 *     * `scrollbarVisible`: 스크롤바 표시 여부
 *     * `scrollButtonsVisible`: 좌/우 스크롤 버튼 표시 여부
 *   * 내부 계산:
 *     * visibleOptions/activeIndex/focusIndex를 기반으로 roving tabIndex 및 인디케이터 위치를 계산합니다.
 *     * ResizeObserver/스크롤 이벤트로 스크롤 가능 상태(canScrollLeft/right)를 유지합니다.
 *   * 서버/클라이언트 제어:
 *     * 선택 상태는 외부 `value`가 단일 소스이며, 내부 상태는 UI(포커스/인디케이터/스크롤 가능 여부) 파생값만 관리합니다.
 *
 * @module Tabs
 * 스크롤 가능한 탭바와 인디케이터, 키보드 내비게이션, (옵션) 스크롤 버튼을 제공하는 controlled Tabs 컴포넌트입니다.
 *
 * @usage
 * <Tabs
 *   options={[{ label: "A", value: "a" }, { label: "B", value: "b" }]}
 *   value={value}
 *   size="M"
 *   onSelect={setValue}
 *   scrollButtonsVisible
 * />
 *
/---------------------------------------------------------------------------**/

export const Tabs = ({
  options,
  value,
  size,
  onSelect,
  scrollbarVisible = true,
  scrollButtonsVisible = false,
  color = "primary",
  ...props
}: TabProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)

  const visibleOptions = useMemo(() => options.filter((o) => !o.hidden), [options])
  const activeIndex = useMemo(
    () => (value === null ? -1 : visibleOptions.findIndex((o) => o.value === value)),
    [value, visibleOptions],
  )

  useEffect(() => {
    if (activeIndex >= 0) setFocusIndex(activeIndex)
  }, [activeIndex])

  const updateIndicator = useCallback(() => {
    if (!scrollRef.current) return
    if (activeIndex < 0) {
      setIndicator({ left: 0, width: 0 })
      return
    }

    const el = tabRefs.current[activeIndex]
    if (!el) return

    setIndicator({
      left: el.offsetLeft,
      width: el.offsetWidth,
    })
  }, [activeIndex])

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  const scrollActiveIntoView = useCallback(() => {
    const el = scrollRef.current
    const tabEl = activeIndex >= 0 ? tabRefs.current[activeIndex] : null
    if (!el || !tabEl) return

    const left = tabEl.offsetLeft
    const right = left + tabEl.offsetWidth
    const viewLeft = el.scrollLeft
    const viewRight = el.scrollLeft + el.clientWidth

    if (left < viewLeft) {
      el.scrollTo({ left, behavior: "smooth" })
      return
    }
    if (right > viewRight) {
      el.scrollTo({ left: right - el.clientWidth, behavior: "smooth" })
    }
  }, [activeIndex])

  useEffect(() => {
    updateIndicator()
    updateScrollButtons()
    scrollActiveIntoView()
  }, [updateIndicator, updateScrollButtons, scrollActiveIntoView, visibleOptions.length, size])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    updateScrollButtons()

    const ro = new ResizeObserver(() => {
      updateIndicator()
      updateScrollButtons()
    })
    ro.observe(el)

    return () => ro.disconnect()
  }, [updateIndicator, updateScrollButtons])

  const scrollByStep = (delta: number) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" })
  }

  const scrollLeft = () => scrollByStep(-160)
  const scrollRight = () => scrollByStep(160)

  const gap = sizeStyle[size].gap
  const height = sizeStyle[size].height

  const onKeyDownTabList: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!visibleOptions.length) return

    const moveFocus = (next: number) => {
      const clamped = Math.max(0, Math.min(visibleOptions.length - 1, next))
      setFocusIndex(clamped)
      const btn = tabRefs.current[clamped]
      btn?.focus()
      // * 포커스 이동 시도 시 해당 탭이 보이도록
      btn?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" })
    }

    if (e.key === "ArrowRight") {
      e.preventDefault()
      moveFocus(focusIndex + 1)
      return
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      moveFocus(focusIndex - 1)
      return
    }
    if (e.key === "Home") {
      e.preventDefault()
      moveFocus(0)
      return
    }
    if (e.key === "End") {
      e.preventDefault()
      moveFocus(visibleOptions.length - 1)
      return
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      const opt = visibleOptions[focusIndex]
      if (!opt || opt.disabled) return
      onSelect(opt.value)
    }
  }

  return (
    <TabsWrapper ref={wrapperRef} $height={height} {...props}>
      {scrollButtonsVisible && (
        <ScrollButtonWrapper>
          <IconButton icon="ArrowLeft" size={20} disabled={!canScrollLeft} onClick={scrollLeft} />
        </ScrollButtonWrapper>
      )}

      <ScrollContainer
        ref={scrollRef}
        role="tablist"
        aria-orientation="horizontal"
        tabIndex={0}
        $gap={gap}
        $size={size}
        $scrollbarVisible={scrollbarVisible}
        onScroll={updateScrollButtons}
        onKeyDown={onKeyDownTabList}
        onWheel={(e) => {
          const el = scrollRef.current
          if (!el) return
          if (!isScrollableX(el)) return
          e.preventDefault()
          el.scrollBy({ left: e.deltaY, behavior: "smooth" })
        }}
      >
        {visibleOptions.map((option, idx) => {
          const selected = option.value === value
          const disabled = !!option.disabled
          const tabIndex = idx === focusIndex ? 0 : -1

          return (
            <StyledTabButton
              key={`tab-${option.value}-${idx}`}
              ref={(node) => {
                tabRefs.current[idx] = node
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-disabled={disabled}
              disabled={disabled}
              $size={size}
              $active={selected}
              $color={color}
              tabIndex={tabIndex}
              onClick={() => {
                if (disabled) return
                onSelect(option.value)
              }}
              onFocus={() => setFocusIndex(idx)}
            >
              <Typography
                text={option.label}
                color={selected ? resolveColor(color) : theme.colors.text.primary}
                sx={{ fontSize: sizeStyle[size].fontSize }}
              />
            </StyledTabButton>
          )
        })}

        <Indicator
          $color={color}
          style={{
            left: indicator.left,
            width: indicator.width,
            opacity: indicator.width > 0 ? 1 : 0,
          }}
        />
      </ScrollContainer>

      {scrollButtonsVisible && (
        <ScrollButtonWrapper>
          <IconButton
            icon="ArrowRight"
            size={20}
            disabled={!canScrollRight}
            onClick={scrollRight}
          />
        </ScrollButtonWrapper>
      )}
    </TabsWrapper>
  )
}
Tabs.displayName = "Tabs"

const TabsWrapper = styled.div<{ $height: string }>`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  height: ${({ $height }) => $height};
`

const ScrollButtonWrapper = styled.div`
  flex: 0 0 auto;
  padding: 0 4px;
  z-index: 10;
`

const ScrollContainer = styled(Flex)<{
  $size: SizeUiType
  $scrollbarVisible: boolean
  $gap: string
}>`
  flex: 1;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;

  ${({ $scrollbarVisible }) =>
    !$scrollbarVisible &&
    css`
      -ms-overflow-style: none;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    `}

  ${BaseMixin};
  gap: ${({ $gap }) => $gap};

  ${({ theme, $size }) =>
    $size !== "M" &&
    css`
      &::before {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 1px;
        width: 100%;
        background: ${theme.colors.border.default};
        z-index: 0;
      }
    `}
`

const StyledTabButton = styled.button<{
  $size: SizeUiType
  $active?: boolean
  $color?: ColorUiType | string
}>`
  ${({ $size }) => css`
    padding: ${sizeStyle[$size].padding};
    height: ${sizeStyle[$size].height};
  `}

  white-space: nowrap;
  border: none;
  background: none;
  outline: none;
  position: relative;

  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:focus-visible {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[200]};
    border-radius: 8px;
  }

  ${({ $active, $color }) =>
    $active &&
    css`
      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        width: 100%;
        background-color: ${resolveColor($color || "primary")};
        border-radius: 2px;
        transition: all 0.25s ease;
        z-index: 2;
      }
    `}
`

const Indicator = styled.div<{ $color?: ColorUiType | string }>`
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: ${({ $color }) => resolveColor($color || "primary")};
  transition: all 0.25s ease;
  border-radius: 2px;
  z-index: 3;
`

export default Tabs

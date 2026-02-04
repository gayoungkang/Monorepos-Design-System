import { useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "styled-components"
import { BaseMixin, type BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import Icon, { type IconProps } from "../Icon/Icon"
import { Typography, type TypographyProps } from "../Typography/Typography"
import type { IconName } from "../Icon/icon-types"
import type { ColorUiType, SizeUiType } from "../../types/ui"
import type { AxisPlacement } from "../../types/placement"

type OptionType = {
  icon: IconName
  label?: string
  onClick?: () => void
}

export type FloatingButtonProps = BaseMixinProps & {
  item?: OptionType[]
  icon: IconName
  iconProps?: Partial<Omit<IconProps, "name">>
  TypographyProps?: Partial<Omit<TypographyProps, "text">>
  label?: string
  size?: SizeUiType
  color?: ColorUiType | string
  disabled?: boolean
  placement?: AxisPlacement
  onClick?: () => void
}

const sizeMap = {
  S: { diameter: 27, paddingX: 10, fontSize: 12 },
  M: { diameter: 37, paddingX: 14, fontSize: 14 },
  L: { diameter: 47, paddingX: 18, fontSize: 16 },
} as const

const getIconSizePx = (size: SizeUiType): string =>
  size === "S" ? "12px" : size === "L" ? "16px" : "14px"

const normalizePlacement = (p: AxisPlacement): "top" | "bottom" | "left" | "right" => {
  if (p.startsWith("top")) return "top"
  if (p.startsWith("bottom")) return "bottom"
  if (p.startsWith("left")) return "left"
  if (p.startsWith("right")) return "right"
  return "top"
}

const resolveBgColor = (theme: any, color: ColorUiType | string) => {
  if (color === "primary") return theme.colors.primary[400]
  if (color === "secondary") return theme.colors.secondary[400]
  if (color === "normal") return theme.colors.grayscale.white
  return color
}

const resolveContentColor = (theme: any, color: ColorUiType | string) => {
  if (color === "primary" || color === "secondary") return theme.colors.grayscale.white
  if (color === "normal") return theme.colors.text.primary
  return color
}
/**---------------------------------------------------------------------------/
 *
 * ! FloatingButton
 *
 * * 메인 FAB(원형/확장형)과 옵션 아이템들을 배치해 “플로팅 액션 버튼 + 확장 메뉴” 동작을 제공하는 컴포넌트
 * * `item`이 없거나 비어 있으면 단일 버튼으로 동작하며, `item`이 존재하면 클릭 시 옵션 리스트를 토글
 * * 옵션 아이템은 `placement(top|bottom|left|right)` 방향으로 누적 오프셋을 계산해 절대 배치로 펼쳐짐
 *
 * * 동작 규칙
 *   * 단일/확장 분기
 *     * `item`이 없거나 길이가 0이면 `toggle()`에서 메뉴를 열지 않고 `onClick?.()`만 실행
 *     * `item`이 존재하면 `toggle()`로 open 상태를 반전하여 옵션 아이템을 표시/숨김
 *   * 옵션 클릭
 *     * 각 아이템 클릭 시 `opt.onClick?.()` 실행 후 `setOpen(false)`로 메뉴를 닫음
 *   * 오프셋 계산
 *     * `itemRefs`에 저장된 각 옵션 버튼의 실제 DOM 크기를 `getBoundingClientRect()`로 측정
 *     * placement 축에 따라 누적 거리(dist)를 계산하여 `offsets[index]`로 저장
 *       * top/bottom: `rect.height + 20`을 누적
 *       * left/right: `rect.width + 40`을 누적
 *     * open/placement/size/item 변경 시 오프셋을 재계산(useEffect 의존성 포함)
 *   * disabled 처리
 *     * 메인 버튼은 `disabled` prop으로 비활성 상태를 표현(스타일/hover/active 차단)
 *     * item 토글 로직 자체는 disabled 가드가 없으며, 호출부에서 비활성화 정책을 맞추는 전제
 *
 * * 레이아웃/스타일 관련 규칙
 *   * Wrapper
 *     * relative 컨테이너를 기준으로 옵션(FabItem)을 absolute로 배치
 *   * MainFab
 *     * sizeMap(S/M/L) 기반 diameter/padding/fontSize를 적용
 *     * label 존재 시 extended(캡슐형)로 렌더링, 없으면 원형 버튼 형태
 *     * hover/active 시 그림자 및 scale 변형, disabled 시 opacity/box-shadow 제거
 *   * FabItem(옵션 버튼)
 *     * open 상태에 따라 opacity/scale 전환으로 펼침 애니메이션
 *     * placement + offset 조합으로 top/bottom/left/right 방향으로 누적 배치
 *   * 컬러 규칙
 *     * 배경색: `resolveColor(color)`로 theme 토큰(primary/secondary/normal) 또는 커스텀 문자열을 해석
 *     * 텍스트/아이콘: `getTextColor(color)`로 대비 색상을 결정(normal은 text.primary)
 *     * 메인 버튼 disabled 시 배경을 text.disabled로 강제하고 텍스트는 white로 보정
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `icon`은 메인 FAB 아이콘(필수)
 *     * `label`이 있으면 확장형(extended) FAB로 렌더링
 *     * `item`은 옵션 배열이며, 각 옵션은 icon/label(onClick)을 가질 수 있음
 *     * `placement`는 옵션이 펼쳐질 방향(기본 top)
 *     * `iconProps`/`TypographyProps`로 내부 Icon/Typography 옵션을 확장
 *   * 내부 계산 로직
 *     * `sizeMap/getSizePx`로 size별 지름/패딩/폰트/아이콘 크기를 결정
 *     * `offsets`는 DOM 측정 기반 누적 거리 배열이며 placement 축에 따라 다른 간격 상수를 사용
 *
 * @module FloatingButton
 * 플로팅 액션 버튼(FAB)과 옵션 확장 메뉴(placement 기반 누적 배치)를 제공하는 컴포넌트
 *
 * @usage
 * <FloatingButton icon="Plus" onClick={() => {}} />
 * <FloatingButton
 *   icon="Plus"
 *   label="New"
 *   placement="top"
 *   item={[
 *     { icon: "Edit", label: "Edit", onClick: ... },
 *     { icon: "Trash", label: "Delete", onClick: ... },
 *   ]}
 * />
 *
/---------------------------------------------------------------------------**/

const FloatingButton = ({
  item,
  icon,
  label,
  size = "M",
  color = "primary",
  disabled = false,
  placement = "top",
  onClick,
  iconProps,
  TypographyProps,
  ...others
}: FloatingButtonProps) => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [offsets, setOffsets] = useState<number[]>([])

  const hasLabel = Boolean(label)
  const hasMenu = !!item && item.length > 0
  const resolvedPlacement = useMemo(() => normalizePlacement(placement), [placement])

  const bg = useMemo(() => resolveBgColor(theme, color), [theme, color])
  const fg = useMemo(() => resolveContentColor(theme, color), [theme, color])

  const toggle = () => {
    if (disabled) return

    if (!hasMenu) {
      onClick?.()
      return
    }
    setOpen((prev) => !prev)
  }

  // * 외부 클릭 시 닫기 + ESC 닫기
  useEffect(() => {
    if (!open) return

    const onDocDown = (e: MouseEvent) => {
      const root = rootRef.current
      if (!root) return
      if (root.contains(e.target as Node)) return
      setOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onDocDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onDocDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  // * submenu offsets 측정(레이아웃 치수 기반) + 타이밍 안정화
  useEffect(() => {
    if (!hasMenu) return

    let raf = 0
    raf = window.requestAnimationFrame(() => {
      const gap = resolvedPlacement === "top" || resolvedPlacement === "bottom" ? 20 : 40

      const next: number[] = []
      let acc = 0

      itemRefs.current.forEach((el, index) => {
        if (!el) return
        const dist =
          resolvedPlacement === "top" || resolvedPlacement === "bottom"
            ? (el.offsetHeight || 0) + gap
            : (el.offsetWidth || 0) + gap

        acc += dist
        next[index] = acc
      })

      setOffsets(next)
    })

    return () => window.cancelAnimationFrame(raf)
  }, [hasMenu, resolvedPlacement, size, open])

  return (
    <Wrapper ref={rootRef} {...others}>
      {/* submenu */}
      {hasMenu &&
        item!.map((opt, i) => {
          const isExtended = Boolean(opt.label)
          const offset = offsets[i] ?? 0

          return (
            <FabItem
              key={`${opt.icon}-${i}`}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              $open={open}
              $offset={offset}
              $placement={resolvedPlacement}
              $size={size}
              $bg={bg}
              $fg={fg}
              $extended={isExtended}
              aria-hidden={!open}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                if (disabled) return
                opt.onClick?.()
                setOpen(false)
              }}
            >
              <Icon
                name={opt.icon}
                size={getIconSizePx(size)}
                color={fg as `#${string}`}
                {...iconProps}
              />
              {isExtended && opt.label && (
                <Typography
                  text={opt.label}
                  color={fg}
                  sx={{ fontSize: getIconSizePx(size) }}
                  {...TypographyProps}
                />
              )}
            </FabItem>
          )
        })}

      {/* MAIN FAB */}
      <MainFab
        type="button"
        onClick={toggle}
        $size={size}
        $bg={bg}
        $fg={fg}
        $extended={hasLabel}
        disabled={disabled}
        aria-expanded={hasMenu ? open : undefined}
      >
        <Icon
          name={icon}
          size={getIconSizePx(size)}
          color={(disabled ? theme.colors.grayscale.white : fg) as `#${string}`}
          {...iconProps}
        />
        {hasLabel && (
          <Typography
            text={label!}
            color={disabled ? theme.colors.grayscale.white : fg}
            sx={{ fontSize: getIconSizePx(size) }}
            {...TypographyProps}
          />
        )}
      </MainFab>
    </Wrapper>
  )
}

const Wrapper = styled.div<BaseMixinProps>`
  ${BaseMixin};
  position: relative;
  display: inline-flex;
`

const FabItem = styled.button<{
  $open: boolean
  $offset: number
  $placement: "top" | "bottom" | "left" | "right"
  $size: SizeUiType
  $bg: string
  $fg: string
  $extended: boolean
}>`
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  background-color: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  border: none;
  cursor: pointer;
  white-space: nowrap;

  height: ${({ $size }) => sizeMap[$size].diameter}px;
  min-width: ${({ $size }) => sizeMap[$size].diameter}px;

  border-radius: ${({ $extended }) => ($extended ? "28px" : "50%")};
  padding: ${({ $extended, $size }) => ($extended ? `0 ${sizeMap[$size].paddingX}px` : "0")};

  box-shadow: ${({ theme }) => theme.shadows.elevation[8]};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: ${({ $open }) => ($open ? "scale(1)" : "scale(0.6)")};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: all 0.25s ease-in-out;

  ${({ $placement, $offset }) =>
    $placement === "top" &&
    `
      bottom: ${$offset}px;
      left: 0;
    `}
  ${({ $placement, $offset }) =>
    $placement === "bottom" &&
    `
      top: ${$offset}px;
      left: 0;
    `}
  ${({ $placement, $offset }) =>
    $placement === "left" &&
    `
      right: ${$offset}px;
      top: 0;
    `}
  ${({ $placement, $offset }) =>
    $placement === "right" &&
    `
      left: ${$offset}px;
      top: 0;
    `}
`

const MainFab = styled.button<{
  $size: SizeUiType
  $bg: string
  $fg: string
  $extended: boolean
  disabled?: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  border: none;
  cursor: pointer;
  white-space: nowrap;

  background-color: ${({ theme, $bg, disabled }) => (disabled ? theme.colors.text.disabled : $bg)};
  color: ${({ $fg }) => $fg};

  height: ${({ $size }) => sizeMap[$size].diameter}px;
  min-width: ${({ $size }) => sizeMap[$size].diameter}px;

  border-radius: ${({ $extended }) => ($extended ? "28px" : "50%")};
  padding: ${({ $extended, $size }) => ($extended ? `0 ${sizeMap[$size].paddingX}px` : "0")};

  font-size: ${({ $size }) => sizeMap[$size].fontSize}px;

  box-shadow: ${({ theme }) => theme.shadows.elevation[8]};
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    box-shadow: ${({ theme }) => theme.shadows.elevation[10]};
  }
  &:active:not(:disabled) {
    box-shadow: ${({ theme }) => theme.shadows.elevation[6]};
    transform: scale(0.96);
  }
  &:disabled {
    opacity: 0.5;
    box-shadow: none;
    cursor: not-allowed;
  }
`

export default FloatingButton

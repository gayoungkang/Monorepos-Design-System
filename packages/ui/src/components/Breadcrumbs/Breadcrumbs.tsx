import type { ReactNode } from "react"
import { useMemo } from "react"
import { useTheme } from "styled-components"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import Flex from "../Flex/Flex"
import Icon from "../Icon/Icon"
import Link from "../Link/Link"
import { Typography } from "../Typography/Typography"

export type BreadcrumbItem = {
  label: string
  href?: string
  onClick?: () => void
}

export type BreadcrumbsProps = BaseMixinProps & {
  items: BreadcrumbItem[]
  separator?: ReactNode
  maxItems?: number
}
/**---------------------------------------------------------------------------/

* ! Breadcrumbs
*
* * 현재 위치를 단계적으로 표시하는 브레드크럼 네비게이션 컴포넌트
* * items 배열 기반 경로 렌더링
* * 각 아이템에 링크(href) 또는 클릭(onClick) 액션 지원
* * 마지막 아이템은 현재 위치로 간주(aria-current="page")하며 기본적으로 비클릭 처리
* * separator 커스터마이징 지원 (아이콘 또는 ReactNode)
* * maxItems 설정 시 중간 경로를 생략(...) 처리
* * Flex 기반 수평 정렬 레이아웃 구성
* * Link 컴포넌트와 조합하여 일관된 링크 UX 제공
* * BaseMixin 기반 외부 스타일 확장 지원
* * ThemeProvider 기반 색상 시스템 활용
*
* @module Breadcrumbs
* 페이지 계층 구조를 시각적으로 표현하고 상위 경로로의 이동을 돕는 컴포넌트입니다.
* - items 순서대로 경로를 렌더링
* - maxItems 초과 시 첫 항목과 마지막 항목을 유지하며 중간 항목 축약
* - separator를 통해 다양한 스타일의 구분자 표현 가능
*
* @usage
* <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Detail" }]} />
* <Breadcrumbs items={items} maxItems={3} />

/---------------------------------------------------------------------------**/

const Breadcrumbs = ({ items, separator, maxItems, ...others }: BreadcrumbsProps) => {
  const theme = useTheme()

  const resolvedSeparator = useMemo(() => {
    if (separator) return separator
    return <Icon name="ArrowRight" size={12} color={theme.colors.grayscale[600] as `#${string}`} />
  }, [separator, theme])

  // * maxItems가 설정된 경우 시작 아이템 + 생략("...") + 마지막 N개 아이템으로 축약
  const resolvedItems = useMemo(() => {
    const m = maxItems ?? 0
    if (!m || m < 2) return items
    if (items.length <= m) return items

    const tailCount = m - 1
    return [
      items[0],
      { label: "__ellipsis__" } as BreadcrumbItem,
      ...items.slice(items.length - tailCount),
    ]
  }, [items, maxItems])

  return (
    <Flex width="fit-content" justify="center" align="center" {...others}>
      {resolvedItems.map((item, index) => {
        const isLast = index === resolvedItems.length - 1
        const isEllipsis = item.label === "__ellipsis__"

        if (isEllipsis) {
          return (
            <Flex key="ellipsis" align="center">
              <Typography variant="b3Regular" text="..." color={theme.colors.text.tertiary} />
              {!isLast && <Separator>{resolvedSeparator}</Separator>}
            </Flex>
          )
        }

        const clickable = !isLast && (!!item.onClick || !!item.href)

        return (
          <Flex key={`${item.label}-${index}`} align="center">
            {clickable ? (
              <Link
                children={item.label}
                color={theme.colors.text.secondary}
                onClick={item.onClick}
                href={item.href}
                underline="hover"
              />
            ) : (
              <Typography
                text={item.label}
                variant="b3Regular"
                color={isLast ? theme.colors.text.secondary : theme.colors.text.tertiary}
                sx={{ userSelect: "none" }}
                {...(isLast
                  ? ({ as: "span", "aria-current": "page" } as any)
                  : ({ as: "span" } as any))}
              />
            )}

            {!isLast && <Separator>{resolvedSeparator}</Separator>}
          </Flex>
        )
      })}
    </Flex>
  )
}

const Separator = styled.span`
  display: inline-flex;
  align-items: center;
  margin: 0 4px;
`

export default Breadcrumbs

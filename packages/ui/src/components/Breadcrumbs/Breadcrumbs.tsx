import { ReactNode } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import Flex from "../Flex/Flex"
import Icon from "../Icon/Icon"
import { theme } from "../../tokens/theme"
import Link from "../Link/Link"

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
* * 마지막 아이템은 현재 위치로 간주하여 구분자 미표시
* * separator 커스터마이징 지원 (아이콘 또는 ReactNode)
* * maxItems 설정 시 중간 경로를 생략(...) 처리
* * Flex 기반 수평 정렬 레이아웃 구성
* * Link 컴포넌트와 조합하여 일관된 링크 UX 제공
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상 시스템 활용

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

const Breadcrumbs = ({
  items,
  separator = <Icon name="ArrowRight" size={12} color={theme.colors.grayscale[600]} />,
  maxItems,
  ...others
}: BreadcrumbsProps) => {
  // * maxItems가 설정된 경우 시작 아이템 + 생략("...") + 마지막 N개 아이템으로 축약
  const resolvedItems =
    maxItems && items.length > maxItems
      ? [items[0], { label: "..." }, ...items.slice(items.length - (maxItems - 1))]
      : items

  return (
    <Flex width={"fit-content"} justify="center" align="center" {...others}>
      {resolvedItems.map((item, index) => {
        // * 현재 아이템이 마지막인지 여부 판단 (separator 렌더링 제어)
        const isLast = index === resolvedItems.length - 1

        // * href 또는 onClick이 존재할 때만 링크 인터랙션 및 underline 활성화
        const isClickable = !!item.onClick || !!item.href

        return (
          <Flex key={`${item.label}-${index}`} align="center">
            <Link
              children={item.label}
              color={theme.colors.text.secondary}
              onClick={item.onClick}
              href={item.href}
              underline={isClickable ? "hover" : "none"}
            />
            {!isLast && <Separator>{separator}</Separator>}
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

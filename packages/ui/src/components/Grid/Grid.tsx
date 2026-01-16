import type { HTMLAttributes } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"

export type GridProps = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    columns: string
    gap?: number | string
  }
/**---------------------------------------------------------------------------/

* ! Grid
*
* * CSS Grid 기반 레이아웃을 제공하는 베이스 컴포넌트
* * columns(gridTemplateColumns) 문자열을 통해 컬럼 구조 직접 제어
* * gap 옵션으로 grid gap 간격 설정 지원
* * 내부적으로 style 병합을 통해 grid 관련 속성 적용
* * display: grid를 강제하며, 외부 style과 병합 처리
* * BaseMixin 기반 외부 스타일 확장 지원
*
* @module Grid
* CSS Grid 레이아웃을 간단히 사용할 수 있도록 래핑한 레이아웃 컴포넌트입니다.
* - columns에 grid-template-columns 문법을 그대로 전달합니다.
* - gap은 number | string 모두 지원합니다.
* - Flex/Box와 함께 공통 레이아웃 베이스 컴포넌트로 사용됩니다.
*
* @usage
* <Grid columns="1fr 1fr" gap={12} />
* <Grid columns="200px 1fr 1fr" />

/---------------------------------------------------------------------------**/

const Grid = ({ columns, gap, style, ...props }: GridProps) => {
  // * grid 레이아웃 필수 스타일(display/gridTemplateColumns)과 외부 style을 병합
  const mergedStyle = {
    display: "grid",
    gridTemplateColumns: columns,
    ...(gap !== undefined ? { gap } : {}),
    ...(style ?? {}),
  } as const

  return <Root {...props} style={mergedStyle} />
}

const Root = styled.div<BaseMixinProps>`
  ${BaseMixin};
`

export default Grid

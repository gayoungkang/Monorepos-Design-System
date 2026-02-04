import { css } from "styled-components"
import type { CSSObject } from "styled-components"
import { toCssValue } from "../utils/string"

/**---------------------------------------------------------------------------/

* ! SxProps / BaseMixin
*
* * sx 스타일 확장(SxProps) 및 padding/margin/size/background + sx 병합(BaseMixin) 유틸
* * SxProps는 `&:` / `@` prefix 키를 허용하여 selector/media 쿼리 스타일을 지원
* * BaseMixinProps 기반으로 p/pt/pr/pb/pl/px/py, m/mt/mr/mb/ml/mx/my, width/height, bgColor, sx 적용
* * addImportantToSx로 sx 내부 스타일 값에 !important를 부여(중첩 객체 재귀 지원)
* * shouldBlock/omittedBaseProps로 DOM 전달 방지 대상 base prop 필터링에 사용
*
* @module baseMixin
* styled-components 환경에서 공통 레이아웃/spacing 스타일을 props로 제어하기 위한 베이스 믹스인 유틸입니다.

/---------------------------------------------------------------------------**/

export type SxProps = CSSObject & {
  [K in `&:${string}` | `@${string}`]?: CSSObject
}

export type BaseMixinProps = {
  p?: string | number
  pt?: string | number
  pr?: string | number
  pb?: string | number
  pl?: string | number

  px?: string | number
  py?: string | number

  m?: string | number
  mt?: string | number
  mr?: string | number
  mb?: string | number
  ml?: string | number

  mx?: string | number
  my?: string | number

  sx?: SxProps

  width?: string | number
  height?: string | number

  bgColor?: string | number
}

export const omittedBaseProps = [
  "p",
  "pt",
  "pr",
  "pb",
  "pl",
  "px",
  "py",
  "m",
  "mt",
  "mr",
  "mb",
  "ml",
  "mx",
  "my",
  "sx",
  "width",
  "height",
  "bgColor",
] as const

type OmittedBaseProp = (typeof omittedBaseProps)[number]

// * base props를 DOM으로 전달하지 않기 위한 필터
export const shouldBlock = (prop: string): prop is OmittedBaseProp =>
  (omittedBaseProps as readonly string[]).includes(prop)

// * 주어진 SxProps의 모든 스타일 값에 !important를 부여(중첩 객체 재귀 처리)
export function addImportantToSx(styles: SxProps): SxProps {
  const result: SxProps = {}

  for (const key in styles) {
    const value = styles[key]

    if (typeof value === "string") {
      result[key] = value.includes("!important") ? value : `${value} !important`
    } else if (typeof value === "number") {
      result[key] = `${value} !important`
    } else if (typeof value === "object" && value !== null) {
      result[key] = addImportantToSx(value as SxProps)
    } else {
      result[key] = value
    }
  }

  return result
}

// * BaseMixinProps 기반 spacing/size/bg/sx 스타일을 styled-components css로 변환
export const BaseMixin = (props: BaseMixinProps) => css`
  padding-top: ${toCssValue(props.pt ?? props.py)};
  padding-right: ${toCssValue(props.pr ?? props.px)};
  padding-bottom: ${toCssValue(props.pb ?? props.py)};
  padding-left: ${toCssValue(props.pl ?? props.px)};
  ${props.p &&
  css`
    padding: ${toCssValue(props.p ?? props.p)};
  `};

  margin-top: ${toCssValue(props.mt ?? props.my)};
  margin-right: ${toCssValue(props.mr ?? props.mx)};
  margin-bottom: ${toCssValue(props.mb ?? props.my)};
  margin-left: ${toCssValue(props.ml ?? props.mx)};
  ${props.m &&
  css`
    margin: ${toCssValue(props.m ?? props.m)};
  `};

  width: ${toCssValue(props.width)};
  height: ${toCssValue(props.height)};

  background-color: ${toCssValue(props.bgColor)};

  ${props.sx && css(addImportantToSx(props.sx))}
`

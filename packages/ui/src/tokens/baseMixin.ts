import { css, CSSObject } from "styled-components"

/**
 * @typedef SxProps
 *
 * @description
 * `sx` 스타일 확장용 타입
 * `styled-components` 기반 컴포넌트에서 커스텀 스타일 객체를 타입 안전하게 정의할 수 있도록 지원
 *
 * @example
 * ```tsx
 * const style: SxProps = {
 *   fontSize: "16px",
 *   color: "black",
 *   "&:hover": {
 *     color: "blue",
 *   },
 *   "@media (max-width: 768px)": (theme) => ({
 *     color: theme.colors.primary,
 *   }),
 * };
 * ```
 *
 * @property [K in `&:${string}` | `@${string}`]
 *  `&:hover`, `@media` 등 CSS 선택자나 미디어 쿼리 키를 허용하며,
 *  각각에 대해 일반 `CSSObject` 또는 테마 기반 함수 `(theme) => CSSObject`를 적용 가능
 */

export type SxProps = CSSObject & {
  [K in `&:${string}` | `@${string}`]?: CSSObject
}

/**
 * @typedef BaseMixinProps
 * @description
 * 컴포넌트에 여백(padding/margin)을 주기 위한 props입니다.
 * 단일 방향(pt, ml 등) 또는 축 기반(px, my 등)으로 지정 가능합니다.
 *
 * - `px`는 `padding-left`와 `padding-right`를 동시에 지정
 * - `py`는 `padding-top`과 `padding-bottom`을 동시에 지정
 * - `mx`, `my`도 동일하게 margin에 대해 적용됩니다.
 *
 * 값을 지정하지 않으면 해당 속성은 렌더링되지 않습니다 (기존 스타일 유지).
 */
export type BaseMixinProps = {
  /** padding */
  p?: string | number
  /** padding-top */
  pt?: string | number
  /** padding-right */
  pr?: string | number
  /** padding-bottom */
  pb?: string | number
  /** padding-left */
  pl?: string | number

  /** 수평 padding (pr + pl) */
  px?: string | number
  /** 수직 padding (pt + pb) */
  py?: string | number

  /** margin */
  m?: string | number
  /** margin-top */
  mt?: string | number
  /** margin-right */
  mr?: string | number
  /** margin-bottom */
  mb?: string | number
  /** margin-left */
  ml?: string | number

  /** 수평 margin (mr + ml) */
  mx?: string | number
  /** 수직 margin (mt + mb) */
  my?: string | number

  /** sx 커스텀 스타일 */
  sx?: SxProps

  width?: string | number
  height?: string | number

  backgroundColor?: string | number
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
  "backgroundColor",
] as const

type OmittedBaseProp = (typeof omittedBaseProps)[number]
export const shouldBlock = (prop: string): prop is OmittedBaseProp =>
  (omittedBaseProps as readonly string[]).includes(prop)

/**
 * @function BaseMixin
 * @description
 * `BaseMixinProps`를 기반으로 padding/margin 관련 CSS 스타일을 동적으로 적용하는 styled-components 헬퍼입니다.
 *
 * - 각 속성(pt, pr 등)은 지정된 경우에만 렌더링됩니다.
 * - 축 기반(px, py, mx, my)은 방향 속성보다 우선순위가 낮습니다.
 * - 값이 undefined일 경우 기본값 `0`을 적용하지 않고, 해당 스타일을 아예 렌더링하지 않습니다.
 *
 * @example
 * ```tsx
 * const Box = styled.div<StyledBoxProps & BaseMixinProps>`
 *   ${BaseMixin}
 * `;
 *
 * <Box pt="8px" mx="16px" />
 * // 결과:
 * // padding-top: 8px;
 * // margin-left: 16px;
 * // margin-right: 16px;
 * ```
 */
const toCssValue = (value?: string | number): string | undefined => {
  if (value === undefined) return undefined
  return typeof value === "number" ? `${value}px` : value
}

/**
 * 주어진 CSSObject의 모든 속성 값에 !important를 붙입니다.
 * @param styles SxProps 타입 스타일 객체
 * @returns 모든 스타일 값에 !important가 붙은 새로운 객체
 */
export function addImportantToSx(styles: SxProps): SxProps {
  const result: SxProps = {}

  for (const key in styles) {
    const value = styles[key]

    if (typeof value === "string") {
      // 이미 !important가 포함되어 있으면 그대로 둠
      result[key] = value.includes("!important") ? value : `${value} !important`
    } else if (typeof value === "number") {
      // 숫자면 그냥 문자열로 변환 후 !important 붙이기 (px 단위가 필요한 경우 주의)
      result[key] = `${value} !important`
    } else if (typeof value === "object" && value !== null) {
      // 중첩된 객체는 재귀 호출
      result[key] = addImportantToSx(value as SxProps)
    } else {
      // 그 외 타입은 그대로 둠
      result[key] = value
    }
  }

  return result
}

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

  background-color: ${toCssValue(props.backgroundColor)};

  ${props.sx && css(addImportantToSx(props.sx))}
`

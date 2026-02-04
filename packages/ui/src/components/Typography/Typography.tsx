import type React from "react"
import type { JSX, ReactNode } from "react"
import { BaseMixin, type BaseMixinProps } from "../../tokens/baseMixin"
import { theme, type TypographyVariant, typographyVariants } from "../../tokens/theme"
import { styled } from "../../tokens/customStyled"

export type TypographyProps = BaseMixinProps & {
  variant?: TypographyVariant
  text: string
  as?: keyof JSX.IntrinsicElements
  color?: string
  italic?: boolean
  ellipsis?: boolean
  underline?: boolean
  align?: React.CSSProperties["textAlign"]
}
/**---------------------------------------------------------------------------/
 *
 * ! Typography
 *
 * * `variant` 기반 타이포 토큰을 적용해 문자열 텍스트를 렌더링하는 공통 텍스트 컴포넌트
 * * `text`가 문자열이면 `\n`을 기준으로 자동 줄바꿈(`<br />`)을 삽입하여 출력한다
 * * `as`로 렌더링 태그를 변경할 수 있으며, 색상/이탤릭/밑줄/정렬/말줄임 등 텍스트 표현 옵션을 props로 제어한다
 *
 * * 동작 규칙
 *   * 텍스트 처리
 *     * `text`는 문자열로 계약되어 있으며, 문자열인 경우 `\n`을 기준으로 분리해 각 줄 사이에 `<br />`를 삽입한다
 *     * 마지막 줄 뒤에는 `<br />`를 삽입하지 않는다
 *   * 렌더링 규칙
 *     * 실제 렌더링은 `StyledTypography` 1개 요소로 이루어지며, children으로 가공된 `renderText`를 전달한다
 *     * `as`가 지정되면 해당 HTML 태그로 렌더링된다(기본 `"p"`)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 기본 스타일
 *     * `width: max-content`를 사용해 콘텐츠 너비에 맞춰 요소 폭을 결정한다
 *     * `color`는 props로 전달된 문자열 값을 그대로 사용한다(기본값: `theme.colors.text.primary`)
 *   * 타이포 토큰 적용
 *     * `variant`에 해당하는 `typographyVariants[variant]` 스타일을 적용한다(없으면 `"b1Medium"` fallback)
 *   * 텍스트 옵션 스타일
 *     * `italic=true`이면 `font-style: italic`, 아니면 `normal`
 *     * `ellipsis=true`이면 한 줄 말줄임: `white-space: nowrap` + `overflow: hidden` + `text-overflow: ellipsis`
 *       그렇지 않으면 `white-space: normal` + `overflow: visible` + `text-overflow: initial`
 *     * `align`은 `text-align`로 적용되며, 미지정 시 `"left"`를 사용한다
 *     * `underline=true`이면 `text-decoration: underline`, 아니면 `none`
 *   * `BaseMixin`을 마지막에 적용하여 공통 믹스인 스타일을 추가로 반영한다
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(필수/선택)
 *     * 필수: `text: string`
 *     * 선택: `variant`, `as`, `color`, `italic`, `ellipsis`, `underline`, `align` 및 `BaseMixinProps` 확장 속성
 *   * 내부 계산 로직 요약
 *     * `renderText`는 `text.split("\n")` 결과를 reduce로 순회하며 줄 문자열과 `<br />`를 교차 삽입한 ReactNode 배열로 구성된다
 *   * 서버 제어/클라이언트 제어 여부
 *     * 순수 프레젠테이션 컴포넌트로, 서버 제어/클라이언트 제어 상태 로직은 포함하지 않는다
 *
 * @module Typography
 * 텍스트 스타일을 토큰(variant)과 옵션(props)으로 조합해 렌더링하는 공통 타이포그래피 컴포넌트
 *
 * @usage
 * <Typography
 *   {...props}
 * />
 *
/---------------------------------------------------------------------------**/

type StyledTypographyProps = BaseMixinProps & {
  $variant?: TypographyVariant
  $color: string
  $italic?: boolean
  $ellipsis?: boolean
  $underline?: boolean
  $align?: React.CSSProperties["textAlign"]
}

export const Typography = ({
  variant = "b1Medium",
  text,
  as = "p",
  color = theme.colors.text.primary,
  italic,
  ellipsis = false,
  underline,
  align,
  ...mixin
}: TypographyProps) => {
  const renderText =
    typeof text === "string"
      ? text.split("\n").reduce<ReactNode[]>((acc, line, index, arr) => {
          acc.push(line)
          if (index < arr.length - 1) acc.push(<br key={`br-${index}`} />)
          return acc
        }, [])
      : text

  return (
    <StyledTypography
      as={as}
      $color={color}
      $variant={variant}
      $ellipsis={ellipsis || undefined}
      $italic={italic || undefined}
      $underline={underline || undefined}
      $align={align}
      {...mixin}
    >
      {renderText}
    </StyledTypography>
  )
}

const StyledTypography = styled.p<StyledTypographyProps>`
  display: inline-block;
  max-width: 100%;

  color: ${({ $color }) => $color};

  ${({ $variant }) => typographyVariants[$variant ?? "b1Medium"]};

  font-style: ${({ $italic }) => ($italic ? "italic" : "normal")};
  white-space: ${({ $ellipsis }) => ($ellipsis ? "nowrap" : "normal")};
  overflow: ${({ $ellipsis }) => ($ellipsis ? "hidden" : "visible")};
  text-overflow: ${({ $ellipsis }) => ($ellipsis ? "ellipsis" : "initial")};
  text-align: ${({ $align }) => $align ?? "left"};
  text-decoration: ${({ $underline }) => ($underline ? "underline" : "none")};

  ${BaseMixin};
`

Typography.displayName = "Typography"

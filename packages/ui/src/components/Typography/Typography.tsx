import type React from "react"
import { JSX, ReactNode } from "react"
import { BaseMixin, BaseMixinProps } from "../tokens/baseMixin"
import { TypographyVariant, typographyVariants } from "../tokens/theme"
import { styled } from "../tokens/customStyled"

export type TypographyProps = BaseMixinProps & {
  variant: TypographyVariant
  text: string
  as?: keyof JSX.IntrinsicElements
  color?: string
  italic?: boolean
  ellipsis?: boolean
  underline?: boolean
  align?: React.CSSProperties["textAlign"]
}

/**
 * @module Typography
 * 텍스트 스타일링을 위한 재사용 가능한 타이포그래피 컴포넌트입니다.
 * - 텍스트 스타일을 `variant`로 지정 가능
 * - 줄바꿈 문자를 자동으로 `<br />`로 변환
 * - 이탤릭, 밑줄, 말줄임 등의 텍스트 속성 제공
 * - HTML 태그를 변경하여 다양한 구조로 출력 가능
 *
 * @props
 * - variant: 폰트 스타일을 지정하는 키 (예: "headline", "body", "caption" 등)
 * - text: 문자열 또는 ReactNode. 문자열인 경우 줄바꿈 문자를 `<br />`로 자동 처리
 * - as: HTML 태그 지정 (기본값: "p")
 * - color: 텍스트 색상 (기본값: "text.primary")
 * - italic: 텍스트를 이탤릭 처리할지 여부
 * - ellipsis: 텍스트가 넘칠 경우 말줄임(...) 처리할지 여부
 * - underline: 텍스트에 밑줄을 표시할지 여부
 * - align: 텍스트 정렬 방향 (기본값: left)
 * - ...mixin: 스타일 믹스인 또는 기타 스타일 속성
 *
 * @상세설명
 * - `text`가 문자열일 경우 `\n` 문자를 기준으로 자동 줄바꿈(`<br />`) 처리합니다.
 * - `ellipsis`를 true로 설정하면 `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis`가 적용되어 텍스트가 한 줄로 잘립니다.
 * - `variant`, `color`, `italic`, `underline` 등 다양한 스타일 속성을 조합하여 텍스트를 자유롭게 표현할 수 있습니다.
 * - `as` 속성을 사용하면 `p`, `span`, `div` 등 HTML 태그를 자유롭게 변경할 수 있어 유연한 레이아웃 구성이 가능합니다.
 *
 * @사용법
 * ```tsx
 * <Typography
 *   variant="body"
 *   text="안녕하세요\n반갑습니다"
 *   as="span"
 *   color="text.secondary"
 *   align="center"
 *   italic
 *   ellipsis
 * />
 * ```
 */

export const Typography = ({
  variant,
  text,
  as = "p",
  color = "text.primary",
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
      color={color}
      variant={variant}
      ellipsis={ellipsis}
      italic={italic}
      underline={underline}
      align={align}
      {...mixin}
    >
      {renderText}
    </StyledTypography>
  )
}

const StyledTypography = styled.p<Omit<TypographyProps, "text" | "as">>`
  width: max-content;
  color: ${({ color }) => color};

  ${({ variant }) => typographyVariants[variant]};

  font-style: ${({ italic }) => (italic ? "italic" : "normal")};
  white-space: ${({ ellipsis }) => (ellipsis ? "nowrap" : "normal")};
  overflow: ${({ ellipsis }) => (ellipsis ? "hidden" : "visible")};
  text-overflow: ${({ ellipsis }) => (ellipsis ? "ellipsis" : "initial")};
  text-align: ${({ align }) => align ?? "left"};
  text-decoration: ${({ underline }) => (underline ? "underline" : "none")};

  ${BaseMixin};
`

import { ReactNode } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { theme } from "../../tokens/theme"
import { styled } from "../../tokens/customStyled"
import { css } from "styled-components"

type PaperProps = BaseMixinProps & {
  children: ReactNode
  elevation?: number
  radius?: keyof typeof theme.borderRadius | string
}
/**
 * @module Paper
 * elevation(음영) 레벨과 radius를 적용할 수 있는 박스 컴포넌트입니다.
 *
 * - elevation: 0~24까지의 그림자 레벨을 지정 (기본값: 1)
 * - radius: 테두리 둥글기 (기본값: 4px)
 * - 배경색: theme 기반 기본 white
 *
 * @props
 * - elevation: 그림자 레벨 (0~24)
 * - radius: 테두리 둥글기 (theme.borderRadius 키 또는 px 문자열)
 * - children: 내부 컨텐츠
 */
const Paper = ({ children, elevation = 0, radius = 4, ...others }: PaperProps) => {
  return (
    <StyledPaper elevation={elevation} radius={radius} {...others}>
      {children}
    </StyledPaper>
  )
}

const StyledPaper = styled.div.withConfig({
  shouldForwardProp: (prop) => !["elevation", "radius"].includes(prop),
})<{
  elevation: number
  radius: keyof typeof theme.borderRadius | string
}>`
  ${({ theme, elevation, radius }) => css`
    box-shadow: ${theme.shadows.elevation[Math.min(elevation, 24)]};
    border-radius: ${typeof radius === "string" ? radius : theme.borderRadius[radius]};
    transition: box-shadow 0.2s ease-in-out;
    padding: 16px;
  `};

  ${(props) => BaseMixin(props as BaseMixinProps)}
`

export default Paper

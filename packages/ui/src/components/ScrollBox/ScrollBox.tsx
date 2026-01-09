import { ReactNode } from "react"
import { BaseMixinProps, toCssValue } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"

type ScrollBoxProps = BaseMixinProps & {
  children: ReactNode
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  overflow?: React.CSSProperties["overflow"]
}

const ScrollBox = ({
  children,
  width = "100%",
  height = "100%",
  minWidth = "initial",
  minHeight = "initial",
  maxWidth = "100%",
  maxHeight = "none",
  overflow = "auto",
  ...others
}: ScrollBoxProps) => {
  return (
    <Container
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      overflow={overflow}
      {...others}
    >
      {children}
    </Container>
  )
}

const Container = styled.div<ScrollBoxProps>`
  width: ${({ width }) => (typeof width === "number" ? toCssValue(width) : width)};
  height: ${({ height }) => (typeof height === "number" ? toCssValue(height) : height)};
  min-width: ${({ minWidth }) => (typeof minWidth === "number" ? toCssValue(minWidth) : minWidth)};
  min-height: ${({ minHeight }) =>
    typeof minHeight === "number" ? toCssValue(minHeight) : minHeight};
  max-width: ${({ maxWidth }) => (typeof maxWidth === "number" ? toCssValue(maxWidth) : maxWidth)};
  max-height: ${({ maxHeight }) =>
    typeof maxHeight === "number" ? toCssValue(maxHeight) : maxHeight};
  overflow: ${({ overflow }) => overflow};
`

export default ScrollBox

// ScrollBox.tsx
import { forwardRef, ReactNode } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { cssValue } from "../../utils/string"

export type ScrollBoxProps = BaseMixinProps & {
  children: ReactNode
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  overflow?: React.CSSProperties["overflow"]
}

const ScrollBox = forwardRef<HTMLDivElement, ScrollBoxProps>(
  (
    {
      children,
      width = "100%",
      height = "100%",
      minWidth = "initial",
      minHeight = "initial",
      maxWidth = "100%",
      maxHeight = "none",
      overflow = "auto",
      ...others
    },
    ref,
  ) => {
    return (
      <Container
        ref={ref}
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
  },
)

const Container = styled.div<ScrollBoxProps>`
  width: ${({ width }) => cssValue(width ?? "100%")};
  height: ${({ height }) => cssValue(height ?? "100%")};
  min-width: ${({ minWidth }) => cssValue(minWidth ?? "initial")};
  min-height: ${({ minHeight }) => cssValue(minHeight ?? "initial")};
  max-width: ${({ maxWidth }) => cssValue(maxWidth ?? "100%")};
  max-height: ${({ maxHeight }) => cssValue(maxHeight ?? "none")};
  overflow: ${({ overflow }) => overflow ?? "hidden"};
`

ScrollBox.displayName = "ScrollBox"
export default ScrollBox

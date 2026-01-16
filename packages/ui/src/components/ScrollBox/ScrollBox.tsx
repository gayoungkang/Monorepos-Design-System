import { ReactNode } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { cssValue } from "../../utils/string"

type ScrollBoxProps = BaseMixinProps & {
  children: ReactNode
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  overflow?: React.CSSProperties["overflow"]
}
/**---------------------------------------------------------------------------/

* ! ScrollBox
*
* * 내부 콘텐츠에 스크롤 영역을 제공하는 컨테이너 컴포넌트
* * width / height / min / max 사이즈를 number | string 형태로 유연하게 제어
* * number 타입 사이즈는 toCssValue를 통해 px 단위로 변환
* * overflow 속성(auto/hidden/scroll 등) 커스터마이징 지원
* * BaseMixinProps 기반 외부 스타일 확장 지원
*
* @module ScrollBox
* 지정된 영역 안에서 스크롤 가능한 레이아웃을 제공하는 래퍼 컴포넌트입니다.
* - 테이블, 리스트 등 고정 영역 + 스크롤 UI 구성에 사용됩니다.
* - min/max 사이즈를 함께 지정해 반응형 레이아웃 제어가 가능합니다.
*
* @usage
* <ScrollBox maxHeight={300}>...</ScrollBox>
* <ScrollBox width="100%" height={400} overflow="auto">...</ScrollBox>

/---------------------------------------------------------------------------**/

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
  width: ${({ width }) => cssValue(width ?? "100%")};
  height: ${({ height }) => cssValue(height ?? "100%")};
  min-width: ${({ minWidth }) => cssValue(minWidth ?? "initial")};
  min-height: ${({ minHeight }) => cssValue(minHeight ?? "initial")};
  max-width: ${({ maxWidth }) => cssValue(maxWidth ?? "100%")};
  max-height: ${({ maxHeight }) => cssValue(maxHeight ?? "none")};
  overflow: ${({ overflow }) => overflow ?? "hidden"};
`

export default ScrollBox

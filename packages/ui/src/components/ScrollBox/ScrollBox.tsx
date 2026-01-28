import type { CSSProperties, ReactNode } from "react"
import { forwardRef } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { cssValue } from "../../utils/string"

export type ScrollBoxProps = BaseMixinProps & {
  children: ReactNode
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  overflow?: CSSProperties["overflow"]
}

type StyledProps = BaseMixinProps & {
  $minWidth: string | number
  $minHeight: string | number
  $maxWidth: string | number
  $maxHeight: string | number
  $overflow: CSSProperties["overflow"]
}
/**---------------------------------------------------------------------------/
 *
 * ! ScrollBox
 *
 * * 자식 콘텐츠를 감싸며 스크롤(overflow)과 박스 크기 제약(min/max)을 일관된 방식으로 적용하는 컨테이너 컴포넌트입니다.
 * * `width`/`height` 기본값을 100%로 제공하여, 부모 영역을 채우는 스크롤 래퍼로 사용되는 것을 전제로 합니다.
 * * min/max 제약과 overflow를 props로 받아 스타일에 반영하며, 값은 `cssValue` 유틸로 CSS 단위 문자열로 정규화합니다.
 * * BaseMixinProps를 지원하여 공통 레이아웃/스타일 토큰(sx, p/m 등)을 함께 적용할 수 있습니다.
 *
 * * 동작 규칙
 *   * 렌더링:
 *     * `Container`(styled.div) 하나로만 렌더링되며, children을 그대로 출력합니다.
 *   * ref 전달:
 *     * forwardRef로 DOM div ref를 Container에 전달합니다.
 *   * 값 정규화:
 *     * width/height 및 min/max 값은 `cssValue(...)`로 변환되어 단위(px 등)를 일관되게 처리합니다.
 *   * overflow:
 *     * `overflow`가 제공되면 그대로 사용하고, 없으면 "auto"로 처리합니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 기본 크기:
 *     * `width`, `height` 기본값은 "100%"로 설정됩니다.
 *   * 제약 크기:
 *     * `minWidth`/`minHeight` 기본값은 "initial"
 *     * `maxWidth` 기본값은 "100%", `maxHeight` 기본값은 "none"
 *   * 스크롤:
 *     * `overflow` 기본값은 "auto"이며, 필요 시 "hidden"/"scroll" 등으로 오버라이드 가능합니다.
 *   * BaseMixin:
 *     * Container에 BaseMixin을 적용하여 BaseMixinProps 기반 스타일을 일괄 적용합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `children`은 필수이며, 그 외 `min/max/overflow`는 선택값입니다.
 *     * `width`/`height`는 BaseMixinProps에서 전달되며 기본값을 ScrollBox에서 설정합니다.
 *   * 내부 계산:
 *     * 단위 변환은 `cssValue`에 위임하며, 각 prop의 fallback은 컴포넌트/스타일 레벨에서 각각 보정합니다.
 *   * 서버/클라이언트 제어:
 *     * 순수 스타일/레이아웃 래퍼로, 런타임 상태나 클라이언트 계산 로직을 사용하지 않습니다.
 *
 * @module ScrollBox
 * 스크롤 가능한 컨테이너를 제공하며, min/max 크기 제약과 overflow 설정을 간단히 적용할 수 있습니다.
 *
 * @usage
 * <ScrollBox height={320} maxHeight="320px" overflow="auto">
 *   {children}
 * </ScrollBox>
 *
/---------------------------------------------------------------------------**/

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
        $minWidth={minWidth}
        $minHeight={minHeight}
        $maxWidth={maxWidth}
        $maxHeight={maxHeight}
        $overflow={overflow}
        {...others}
      >
        {children}
      </Container>
    )
  },
)

const Container = styled.div<StyledProps>`
  ${BaseMixin}
  width: ${({ width }) => cssValue(width ?? "100%")};
  height: ${({ height }) => cssValue(height ?? "100%")};

  min-width: ${({ $minWidth }) => cssValue($minWidth ?? "initial")};
  min-height: ${({ $minHeight }) => cssValue($minHeight ?? "initial")};

  max-width: ${({ $maxWidth }) => cssValue($maxWidth ?? "100%")};
  max-height: ${({ $maxHeight }) => cssValue($maxHeight ?? "none")};

  overflow: ${({ $overflow }) => $overflow ?? "auto"};
`

ScrollBox.displayName = "ScrollBox"
export default ScrollBox

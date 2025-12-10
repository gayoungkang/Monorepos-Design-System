import { HTMLAttributes, JSX, ReactNode, forwardRef } from "react";
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin";
import { styled } from "../../tokens/customStyled";

export type BoxProps = HTMLAttributes<HTMLElement> &
  BaseMixinProps & {
    children?: ReactNode;
    as?: keyof JSX.IntrinsicElements;
  };

/**
 * @module Box
 * 레이아웃을 위한 범용 래퍼 컴포넌트입니다.
 * - 별도의 스타일 없이 유연하게 사용 가능하며,
 * - padding, margin, sx 등 BaseMixin 유틸 속성을 지원합니다.
 *
 * @props
 * - children: 내부에 렌더링할 React 노드
 * - as: HTML 요소 태그명 (기본값: "div")
 * - ...기본 HTML 속성과 BaseMixin 스타일링 props 포함
 *
 * @상세설명
 * - Box 컴포넌트는 HTML 요소 태그를 자유롭게 지정할 수 있어 다양한 상황에서 레이아웃을 구성하는 데 활용됩니다.
 * - BaseMixin을 적용하여 패딩, 마진, flex, grid 등 스타일 유틸리티를 지원합니다.
 * - forwardRef를 사용해 ref 전달이 가능하여 부모 컴포넌트에서 직접 DOM 조작이 가능합니다.
 *
 * @사용법
 * ```tsx
 * <Box pt="12px" mx="16px" sx={{ background: "lightgray" }}>
 *   콘텐츠
 * </Box>
 * ```
 */
const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ as = "div", children, ...props }, ref) => {
    return (
      <StyledBox ref={ref} as={as} {...props}>
        {children}
      </StyledBox>
    );
  }
);

Box.displayName = "Box";

const StyledBox = styled.div<BoxProps>`
  ${BaseMixin};
`;

export default Box;

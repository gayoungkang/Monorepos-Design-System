import { ReactNode } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { indeterminateAnimation } from "../../tokens/keyframes"
import { theme } from "../../tokens/theme"
import { css } from "styled-components"

export type SkeletonProps = BaseMixinProps & {
  variant?: "text" | "rectangular" | "rounded" | "circular"
  width?: string | number
  height?: string | number
  animation?: "wave" | "none"
  children?: ReactNode
}
/**---------------------------------------------------------------------------/

* ! Skeleton
*
* * 로딩 상태를 표현하기 위한 스켈레톤 UI 컴포넌트
* * 텍스트, 사각형, 둥근 사각형, 원형 형태 지원
* * width / height 기반 크기 커스터마이징 가능
* * wave 애니메이션 또는 애니메이션 비활성화 옵션 제공
* * children 전달 시 실제 콘텐츠 영역을 숨기고 스켈레톤으로 대체 렌더링
* * pseudo-element 기반 shimmer(wave) 애니메이션 구현
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상 및 borderRadius 토큰 활용

* @module Skeleton
* 콘텐츠 로딩 중 자리 표시자로 사용되는 스켈레톤 컴포넌트입니다.
* - variant 옵션으로 다양한 형태의 스켈레톤 표현
* - animation 옵션으로 로딩 애니메이션 제어
* - children이 존재할 경우 실제 레이아웃을 유지한 채 로딩 상태 표현
*
* @usage
* <Skeleton variant="text" width="100%" />
* <Skeleton variant="circular" width={40} height={40} />
* <Skeleton>
*   <Content />
* </Skeleton>

/---------------------------------------------------------------------------**/

const Skeleton = ({
  variant = "text",
  width,
  height,
  animation = "wave",
  children,
  ...others
}: SkeletonProps) => {
  // * children가 있는 경우 실제 콘텐츠 위에 스켈레톤을 오버레이 형태로 렌더링
  if (children) {
    return (
      <SkeletonWrapper {...others}>
        <SkeletonItem variant={variant} width={width} height={height} animation={animation} />
        <ContentWrapper>{children}</ContentWrapper>
      </SkeletonWrapper>
    )
  }

  // * 단일 스켈레톤 아이템 렌더링
  return (
    <SkeletonItem
      {...others}
      variant={variant}
      width={width}
      height={height}
      animation={animation}
    />
  )
}

// * variant 값에 따라 border-radius 및 기본 높이 스타일을 반환
const getVariantStyle = (variant: SkeletonProps["variant"]) => {
  switch (variant) {
    case "circular":
      return `
          border-radius: 50%;
        `
    case "rounded":
      return `
          border-radius: ${theme.borderRadius[8]};
        `
    case "rectangular":
      return `
          border-radius: ${theme.borderRadius[0]};
        `
    case "text":
    default:
      return `
          border-radius: ${theme.borderRadius[4]};
          height: 1em;
        `
  }
}

const SkeletonWrapper = styled.div`
  position: relative;
  display: inline-block;
`

const ContentWrapper = styled.div`
  visibility: hidden;
`

const SkeletonItem = styled.div<{
  variant: SkeletonProps["variant"]
  width?: string | number
  height?: string | number
  animation: "wave" | "none"
}>`
  position: relative;
  overflow: hidden;
  background-color: ${theme.colors.grayscale[200]};
  width: ${({ width }) => (typeof width === "number" ? `${width}px` : (width ?? "100%"))};
  height: ${({ height }) => (typeof height === "number" ? `${height}px` : (height ?? "auto"))};

  ${({ variant }) => getVariantStyle(variant)}

  ${({ animation }) =>
    animation === "wave" &&
    css`
      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 40%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
        animation: ${indeterminateAnimation} 1.5s infinite linear;
      }
    `}

  ${BaseMixin};
`

export default Skeleton

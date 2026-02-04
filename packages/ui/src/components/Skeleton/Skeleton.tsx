import type { ReactNode } from "react"
import { BaseMixin, type BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { indeterminateAnimation } from "../../tokens/keyframes"
import { css } from "styled-components"

export type SkeletonProps = BaseMixinProps & {
  variant?: "text" | "rectangular" | "rounded" | "circular"
  width?: string | number
  height?: string | number
  animation?: "wave" | "none"
  children?: ReactNode
}

type SkeletonItemStyleProps = {
  variant: NonNullable<SkeletonProps["variant"]>
  width?: string | number
  height?: string | number
  animation: NonNullable<SkeletonProps["animation"]>
}
/**---------------------------------------------------------------------------/
 *
 * ! Skeleton
 *
 * * 로딩 상태에서 콘텐츠 자리 표시자로 사용되는 스켈레톤 UI 컴포넌트입니다.
 * * `variant`로 text / rectangular / rounded / circular 형태를 지원합니다.
 * * `width`/`height`로 크기를 지정할 수 있으며, `animation`으로 wave(쉬머) 또는 none을 선택합니다.
 * * `children`이 있으면 실제 콘텐츠 레이아웃을 유지한 채(visibility: hidden) 스켈레톤을 오버레이 형태로 렌더링합니다.
 * * pseudo-element(::after) + keyframes로 shimmer(wave) 애니메이션을 구현합니다.
 * * BaseMixinProps를 지원하여 외부 sx/p/m 등 공통 스타일 확장이 가능합니다.
 *
 * * 동작 규칙
 *   * children 처리:
 *     * `children`이 존재하면 `SkeletonWrapper` 내부에
 *       * 스켈레톤(SkeletonItem)
 *       * 숨겨진 실제 콘텐츠(ContentWrapper: visibility hidden)
 *       를 함께 렌더링하여 레이아웃 점프 없이 로딩 상태를 표현합니다.
 *   * 단일 렌더링:
 *     * `children`이 없으면 `SkeletonItem`만 렌더링합니다.
 *   * animation:
 *     * `animation === "wave"`일 때만 `::after` 쉬머 레이어를 생성하고 indeterminateAnimation을 적용합니다.
 *     * `animation === "none"`이면 애니메이션 레이어를 생성하지 않습니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 크기:
 *     * `width`/`height`는 number면 px로 변환, string이면 그대로 사용하며 기본 width는 "100%"입니다.
 *     * text variant는 기본적으로 `height: 1em`을 제공하여 텍스트 라인 높이에 맞춥니다.
 *   * variant 스타일(getVariantStyle):
 *     * circular: border-radius 50%
 *     * rounded: theme.borderRadius[8]
 *     * rectangular: theme.borderRadius[0]
 *     * text(기본): theme.borderRadius[4] + height 1em
 *   * wave 쉬머:
 *     * `::after`는 너비 40%의 그라데이션 레이어로, indeterminateAnimation으로 좌우 이동 애니메이션을 수행합니다.
 *   * 배경색:
 *     * 기본 배경은 theme.colors.grayscale[200]을 사용합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `variant`: 형태 결정(text/rectangular/rounded/circular)
 *     * `width`/`height`: 스켈레톤 크기
 *     * `animation`: "wave" | "none"
 *     * `children`: 존재 시 레이아웃 보존 모드(오버레이)로 동작
 *   * 내부 계산:
 *     * 형태별 기본 높이/라운딩은 getVariantStyle에서 결정됩니다.
 *   * 서버/클라이언트 제어:
 *     * 순수 프리젠테이션 컴포넌트로, 상태 관리나 외부 데이터 제어 로직을 포함하지 않습니다.
 *
 * @module Skeleton
 * 콘텐츠 로딩 중 자리 표시자로 사용되는 스켈레톤 컴포넌트입니다.
 *
 * @usage
 * <Skeleton variant="text" width="100%" />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton>
 *   <Content />
 * </Skeleton>
 *
/---------------------------------------------------------------------------**/

const Skeleton = ({
  variant = "text",
  width,
  height,
  animation = "wave",
  children,
  ...others
}: SkeletonProps) => {
  // * children이 있는 경우: 레이아웃 유지 + overlay가 실제 영역을 100% 덮도록 width/height 기본값을 100%로 강제
  if (children) {
    const overlayWidth = width ?? "100%"
    const overlayHeight = height ?? "100%"

    return (
      <SkeletonWrapper {...others}>
        <ContentWrapper>{children}</ContentWrapper>
        <Overlay>
          <SkeletonItem
            variant={variant}
            width={overlayWidth}
            height={overlayHeight}
            animation={animation}
          />
        </Overlay>
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

// * variant 값에 따라 border-radius 및 text 기본 높이(조건부) 적용
const getVariantCss = (variant: SkeletonProps["variant"], hasExplicitHeight: boolean) => {
  switch (variant) {
    case "circular":
      return css`
        border-radius: 50%;
      `
    case "rounded":
      return css`
        border-radius: ${({ theme }) => theme.borderRadius[8]};
      `
    case "rectangular":
      return css`
        border-radius: ${({ theme }) => theme.borderRadius[0]};
      `
    case "text":
    default:
      return css`
        border-radius: ${({ theme }) => theme.borderRadius[4]};
        ${hasExplicitHeight ? "" : "height: 1em;"}
      `
  }
}

const SkeletonWrapper = styled.div<BaseMixinProps>`
  position: relative;
  display: inline-block;
  width: 100%;

  ${({ ...props }) => BaseMixin(props as any)}
`

const ContentWrapper = styled.div`
  visibility: hidden;
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

const SkeletonItem = styled.div<SkeletonItemStyleProps & BaseMixinProps>`
  position: relative;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.grayscale[200]};

  width: ${({ width }) => (typeof width === "number" ? `${width}px` : (width ?? "100%"))};
  height: ${({ height }) => (typeof height === "number" ? `${height}px` : (height ?? "auto"))};

  ${({ variant, height }) => getVariantCss(variant, height !== undefined)}

  ${({ animation }) =>
    animation === "wave" &&
    css`
      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: -40%;
        height: 100%;
        width: 40%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
        animation: ${indeterminateAnimation} 1.5s infinite linear;
      }
    `}

  ${({ ...props }) => BaseMixin(props as any)}
`

export default Skeleton

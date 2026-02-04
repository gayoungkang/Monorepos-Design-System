import type { ReactNode } from "react"
import { BaseMixin } from "../../tokens/baseMixin"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { theme } from "../../tokens/theme"
import { styled } from "../../tokens/customStyled"
import { css } from "styled-components"

type PaperProps = BaseMixinProps & {
  children: ReactNode
  elevation?: number
  radius?: keyof typeof theme.borderRadius | number | string
}
/**---------------------------------------------------------------------------/
 *
 * ! Paper
 *
 * * elevation(그림자)과 radius(모서리 반경)를 제공하는 컨테이너 컴포넌트
 * * theme.shadows.elevation 토큰을 기반으로 box-shadow를 적용하며, elevation 범위는 최대 24로 클램프
 * * radius는 theme.borderRadius 키 또는 임의의 CSS 문자열 값으로 지정 가능
 * * BaseMixin을 통해 외부 spacing/sx 등 공통 스타일 확장을 지원
 *
 * * 동작 규칙
 *   * 주요 분기 조건 및 처리 우선순위
 *     * elevation은 theme.shadows.elevation 인덱스로 사용하며, 24를 초과하면 24로 보정
 *     * radius가 string이면 그대로 사용, 아니면 theme.borderRadius[radius]로 해석
 *     * shouldForwardProp로 elevation/radius는 DOM 속성으로 전달하지 않음
 *   * 이벤트 처리 방식
 *     * 없음(표시용 컨테이너)
 *   * disabled 상태에서 차단되는 동작
 *     * 해당 없음
 *
 * * 레이아웃/스타일 관련 규칙
 *   * box-shadow: theme.shadows.elevation[elevation] 적용
 *   * border-radius: radius 타입에 따라 string 또는 테마 토큰 적용
 *   * transition: box-shadow 0.2s ease-in-out 적용
 *   * padding: 16px 기본 적용
 *   * BaseMixin을 styled 하단에서 합성하여 공통 스타일 확장 지원
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(필수/선택)
 *     * children: 필수(내부 콘텐츠)
 *     * elevation: 옵션(기본 0), 최대 24로 보정
 *     * radius: 옵션(기본 4), theme.borderRadius 키 또는 CSS 문자열
 *   * 내부 계산 로직 요약
 *     * elevation 인덱스: Math.min(elevation, 24)
 *     * radius 해석: typeof radius === "string" ? radius : theme.borderRadius[radius]
 *   * 서버 제어/클라이언트 제어 여부
 *     * 순수 프리젠테이션 컴포넌트(상태/서버 제어 없음)
 *
 * @module Paper
 * elevation과 radius를 지원하는 카드/패널 형태의 컨테이너 컴포넌트
 *
 * @usage
 * <Paper elevation={2} radius={8}>
 *   {children}
 * </Paper>
 * <Paper elevation={10} radius="12px" />
 *
/---------------------------------------------------------------------------**/

const Paper = ({ children, elevation = 0, radius = 4, ...others }: PaperProps) => {
  return (
    <StyledPaper $elevation={elevation} $radius={radius} {...others}>
      {children}
    </StyledPaper>
  )
}

const StyledPaper = styled.div<
  {
    $elevation: number
    $radius: keyof typeof theme.borderRadius | number | string
  } & BaseMixinProps
>`
  ${({ theme, $elevation, $radius }) => {
    const resolvedRadius =
      typeof $radius === "string"
        ? $radius
        : typeof $radius === "number"
          ? theme.borderRadius[$radius as keyof typeof theme.borderRadius]
          : theme.borderRadius[$radius]

    return css`
      box-shadow: ${theme.shadows.elevation[Math.min($elevation, 24)]};
      border-radius: ${resolvedRadius};
      transition: box-shadow 0.2s ease-in-out;
      padding: 16px;
    `
  }}

  ${BaseMixin};
`

export default Paper

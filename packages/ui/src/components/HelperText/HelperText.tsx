import { useMemo } from "react"
import { useTheme } from "styled-components"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { BaseMixin } from "../../tokens/baseMixin"
import type { HelperTextUiType } from "../../types"
import { styled } from "../../tokens/customStyled"
import Icon, { type IconProps } from "../Icon/Icon"
import type { IconName } from "../Icon/icon-loader"
import { Typography, type TypographyProps } from "../Typography/Typography"

export type HelperTextProps = BaseMixinProps & {
  text: string
  status: HelperTextUiType
  typographyProps?: Partial<Omit<TypographyProps, "text" | "variant" | "color">>
  iconProps?: Partial<Omit<IconProps, "name">>
}

const STATUS_ICONS: Record<HelperTextUiType, IconName> = {
  error: "StatusError",
  success: "StatusSuccess",
  info: "StatusInfo",
  default: "StatusDefault",
}
/**---------------------------------------------------------------------------/
 *
 * ! HelperText
 *
 * * 입력/폼 컴포넌트 하단에 상태 메시지를 표시하는 보조 텍스트(HelperText) 컴포넌트
 * * `status(error|success|info|default)`에 따라 아이콘과 텍스트 색상을 동기화하여 피드백을 제공
 * * Typography/Icon 옵션은 `typographyProps`/`iconProps`로 확장 가능하며, BaseMixinProps로 외부 스타일 확장 지원
 *
 * * 동작 규칙
 *   * 상태 아이콘
 *     * `STATUS_ICONS` 맵으로 status에 대응하는 IconName을 선택하여 렌더링
 *   * 색상 결정
 *     * status별 theme 토큰 컬러를 매핑하여 아이콘/텍스트에 동일하게 적용
 *     * color 계산은 useMemo로 캐싱하여 렌더 비용을 최소화
 *   * 텍스트 표시
 *     * `Typography`에 `whiteSpace: pre-line`을 적용해 줄바꿈 문자열을 그대로 표시
 *
 * * 레이아웃/스타일 관련 규칙
 *   * Root는 flex row로 아이콘 + 텍스트를 수평 정렬
 *   * Icon은 고정 크기(0.75rem)로 표시하며, mr로 텍스트와 간격을 둠
 *   * BaseMixin을 통해 spacing/size/sx 등 공통 스타일을 외부에서 주입 가능
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `text`는 표시할 메시지 문자열
 *     * `status`는 표시 상태(색상/아이콘 결정의 단일 기준)
 *     * `typographyProps`는 text/variant/color를 제외한 Typography 옵션 확장 포인트
 *     * `iconProps`는 name을 제외한 Icon 옵션 확장 포인트
 *   * 내부 계산 로직
 *     * status → (color, icon) 매핑을 통해 UI 표현을 일관되게 유지
 *
 * @module HelperText
 * 폼 상태(error/success/info/default)에 맞춰 아이콘과 함께 안내 문구를 표시하는 HelperText 컴포넌트
 *
 * @usage
 * <HelperText status="error" text="필수 입력 항목입니다." />
 * <HelperText status="success" text="사용 가능한 값입니다." />
 *
/---------------------------------------------------------------------------**/

const HelperText = ({ text, status, typographyProps, iconProps, ...others }: HelperTextProps) => {
  const theme = useTheme()

  const color = useMemo(() => {
    const map: Record<HelperTextUiType, string> = {
      error: theme.colors.error[500],
      success: theme.colors.success[500],
      info: theme.colors.info[500],
      default: theme.colors.grayscale[500],
    }
    return map[status]
  }, [status, theme])

  return (
    <Root {...others}>
      <Icon name={STATUS_ICONS[status]} color={color} size={"0.75rem"} mr={4} {...iconProps} />
      <Typography
        text={text}
        variant="b2Regular"
        color={color}
        sx={{ whiteSpace: "pre-line" }}
        {...typographyProps}
      />
    </Root>
  )
}

const Root = styled.div<BaseMixinProps>`
  ${BaseMixin};
  display: flex;
  align-items: center;
`

export default HelperText

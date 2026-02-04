import { useMemo } from "react"
import { useTheme } from "styled-components"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import type { TypographyProps } from "../Typography/Typography"

export type LabelProps = BaseMixinProps & {
  text: string
  textAlign?: "left" | "right"
  placement?: "left" | "right"
  required?: boolean
  typographyProps?: Partial<TypographyProps>
}
/**---------------------------------------------------------------------------/
 *
 * ! Label
 *
 * * 폼 요소 옆/위에 표시되는 텍스트 라벨 컴포넌트
 * * textAlign/placement 조합으로 정렬과 required(*) 표시 위치를 제어
 * * required가 true일 때만 별표(*)를 렌더링하며, placement(left/right)에 따라 라벨 좌/우에 배치
 *
 * * 동작 규칙
 *   * 주요 분기 조건
 *     * required === false 이면 required 마크(*)를 렌더링하지 않음
 *     * required === true 이고 placement가 일치하는 side에서만 (*)를 렌더링
 *   * 이벤트 처리 방식
 *     * 별도 이벤트 없음(표시 전용)
 *   * disabled 상태에서 차단되는 동작
 *     * 해당 없음(표시 전용)
 *
 * * 레이아웃/스타일 관련 규칙
 *   * Flex 컨테이너로 라벨/별표를 수평 정렬
 *   * textAlign(left/right)을 justifyContent(flex-start/flex-end)로 변환해 정렬 제어
 *   * required(*)는 error 색상으로 표시하며, 위치에 따라 좌/우 margin(mr/ml)을 적용
 *   * 라벨 텍스트는 기본적으로 b1Medium + text.tertiary 컬러를 사용
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(필수/선택)
 *     * text: 필수(라벨 문자열)
 *     * textAlign: 정렬 기준("left"|"right"), 기본 "left"
 *     * placement: required 마크 위치("left"|"right"), 기본 "right"
 *     * required: required 마크 노출 여부, 기본 false
 *     * typographyProps: 라벨 Typography 커스터마이징(옵션)
 *   * 내부 계산 로직 요약
 *     * textAlign → justifyContent로 변환(useMemo)
 *     * renderRequiredMark(side)로 required/placement 조건에 따른 (*) 렌더링 제어
 *   * 클라이언트 제어 컴포넌트 (서버 제어 없음)
 *
 * @module Label
 * 폼 라벨 텍스트 및 required(*) 표시를 제공하는 라벨 컴포넌트
 *
 * @usage
 * <Label
 *   text="이름"
 *   required
 *   placement="right"
 * />
 *
/---------------------------------------------------------------------------**/

const Label = ({
  text,
  textAlign = "left",
  placement = "right",
  required = false,
  typographyProps,
  ...others
}: LabelProps) => {
  const theme = useTheme()

  // * textAlign(left/right)을 Flex justifyContent 값으로 변환
  const justify = useMemo(() => {
    return textAlign === "right" ? "flex-end" : "flex-start"
  }, [textAlign])

  // * required 표시(*) 렌더링
  const renderRequiredMark = (side: "left" | "right") => {
    if (!required || placement !== side) return null

    return (
      <Typography
        text="*"
        variant="b1Medium"
        color={theme.colors.error[500]}
        {...(side === "left" ? { mr: 2 } : { ml: 2 })}
      />
    )
  }

  return (
    <Flex align="center" justify={justify} {...others}>
      {renderRequiredMark("left")}
      <Typography
        text={text}
        variant="b1Medium"
        color={theme.colors.text.tertiary}
        {...typographyProps}
      />
      {renderRequiredMark("right")}
    </Flex>
  )
}

export default Label

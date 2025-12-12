import { theme } from "../../tokens/theme"
import { BaseMixinProps } from "../../tokens/baseMixin"
import Flex from "../Flex/Flex"
import { Typography, TypographyProps } from "../Typography/Typography"

export type LabelProps = BaseMixinProps & {
  text: string
  textAlign?: "left" | "right"
  placement?: "left" | "right"
  required?: boolean
  typographyProps?: Partial<TypographyProps>
}
/**
 * @module Label
 * 폼 요소를 위한 라벨 컴포넌트로, 텍스트와 함께 필수 항목 표시(*), 위치 지정(left/right), 커스텀 타이포그래피 스타일을 지원합니다.
 *
 * - `BaseMixin` 기반 스타일 확장
 * - 필수 항목(*) 렌더링 및 위치 지정
 * - Typography 스타일 커스터마이징 가능
 * - textAlign : 라벨 텍스트의 정렬 방식 ("left" | "right")
 *
 * @props
 * - text : 라벨 텍스트
 * - placement : 필수 마크(*) 위치 ("left" | "right")
 * - required : 필수 항목 여부
 * - typographyProps : Typography 컴포넌트에 전달할 추가 스타일 props
 *
 * @사용법
 * <Label text="이름" required placement="left" />
 */

const Label = ({
  text,
  textAlign = "left",
  placement = "right",
  required = false,
  typographyProps,
  ...others
}: LabelProps) => {
  // * 중요 표시 렌더링
  const RequiredMark = () => (
    <Typography
      text="*"
      variant="b1Medium"
      color={theme.colors.error[500]}
      {...(placement === "left" ? { mr: 2 } : { ml: 2 })}
    />
  )

  return (
    <Flex align="center" justify={textAlign} {...others}>
      {required && placement === "left" && <RequiredMark />}
      <Typography text={text} variant="b1Medium" color="text.tertiary" {...typographyProps} />
      {required && placement === "right" && <RequiredMark />}
    </Flex>
  )
}

export default Label

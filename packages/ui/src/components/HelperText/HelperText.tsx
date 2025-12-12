import { BaseMixinProps } from "../../tokens/baseMixin"
import { theme } from "../../tokens/theme"
import { HelperTextUiType } from "../../types"
import Box from "../Box/Box"

import Icon, { IconProps } from "../Icon/Icon"
import { IconName } from "../Icon/icon-loader"

import { Typography, TypographyProps } from "../Typography/Typography"

export type HelperTextProps = BaseMixinProps & {
  text: string
  status: HelperTextUiType
  typographyProps?: Partial<TypographyProps>
  iconProps?: Partial<Omit<IconProps, "name">>
}
/**
 * @module HelperText
 * 입력 필드 하단 등에 표시되는 상태 메시지용 컴포넌트로, 상태에 따른 아이콘과 컬러를 자동 적용합니다.
 *
 * - `BaseMixin` 기반 스타일 확장
 * - `status`에 따라 메시지 색상 및 아이콘 변경
 * - multi-line 텍스트 렌더링 지원 (white-space: pre-line)
 *
 * @props
 * - text : 표시할 메시지 텍스트
 * - status : 메시지 상태 ("error" | "success" | "info" | "default")
 * - typographyProps : Typography에 전달할 추가 스타일
 * - iconProps : Icon에 전달할 추가 스타일
 *
 * @사용법
 * <HelperText text="비밀번호가 일치하지 않습니다." status="error" />
 */

const HelperText = ({ text, status, typographyProps, iconProps, ...others }: HelperTextProps) => {
  // * 상태 값에 따른 컬러 변경
  const statusColors: Record<HelperTextUiType, string> = {
    error: theme.colors.error[500],
    success: theme.colors.success[500],
    info: theme.colors.info[500],
    default: theme.colors.grayscale[500],
  }
  // * 상태 값에 따른 아이콘 변경
  const statusIcons: Record<HelperTextUiType, IconName> = {
    error: "StatusError",
    success: "StatusSuccess",
    info: "StatusInfo",
    default: "StatusDefault",
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center" }} {...others}>
      <Icon
        name={statusIcons[status]}
        color={statusColors[status]}
        size={"0.75rem"}
        mr={4}
        {...iconProps}
      />
      <Typography
        text={text}
        variant="b2Regular"
        color={statusColors[status]}
        sx={{ whiteSpace: "pre-line" }}
        {...typographyProps}
      />
    </Box>
  )
}

export default HelperText

import type { ReactNode } from "react"
import { useMemo } from "react"
import { useTheme, type DefaultTheme } from "styled-components"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import type { CornerPlacement, StatusUiType } from "../../types"
import { styled } from "../../tokens/customStyled"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

export type BadgeProps = BaseMixinProps & {
  children: ReactNode
  content?: number | string
  max?: number
  showZero?: boolean
  invisible?: boolean
  status?: StatusUiType
  overlap?: "rectangular" | "circular"
  placement?: CornerPlacement
}
/**---------------------------------------------------------------------------/

* ! Badge
*
* * 자식 요소 위에 상태 또는 카운트 정보를 표시하는 배지 컴포넌트
* * 숫자 또는 문자열 content 렌더링 지원
* * max 초과 시 `${max}+` 형태로 자동 축약 표시(숫자 content에만 적용)
* * 0 값 표시 여부 제어 (showZero)
* * 강제 숨김 처리 옵션 제공 (invisible)
* * 상태 타입에 따른 색상 표현 (success / info / warning / error)
* * 겹침 형태 설정 가능 (rectangular / circular)
* * 코너 기준 위치 지정 지원 (top-right, top-left, bottom-right, bottom-left)
* * BaseMixin 기반 외부 스타일 확장 지원
* * ThemeProvider 기반 색상 및 radius 토큰 활용
*
* @module Badge
* 알림 개수, 상태 표시 등 보조 정보를 시각적으로 표현하기 위한 배지 컴포넌트입니다.
* - children 위에 배지를 겹쳐 렌더링하는 구조
* - content, max, showZero 조합으로 표시 로직 제어
* - status에 따라 배경색 자동 적용
* - overlap 및 placement 옵션으로 다양한 UI 케이스 대응
*
* @usage
* <Badge content={3}><Icon /></Badge>
* <Badge content={120} max={99}><Button /></Badge>
* <Badge status="success"><Avatar /></Badge>

/---------------------------------------------------------------------------**/

const Badge = ({
  children,
  content,
  max = 99,
  showZero = false,
  invisible = false,
  status = "error",
  overlap = "rectangular",
  placement = "top-right",
  ...others
}: BadgeProps) => {
  const theme = useTheme()

  const isZero = content === 0 || content === "0"

  // * invisible, content 없음, showZero=false 이면서 0인 경우 배지를 숨길지 여부 판단
  const shouldHide = invisible || content === undefined || content === null || (!showZero && isZero)

  // * 숫자 content가 max를 초과할 경우 `${max}+` 형태로 표시값 계산
  const displayContent = useMemo(() => {
    if (typeof content === "number" && content > max) return `${max}+`
    return content
  }, [content, max])

  return (
    <Wrapper {...others}>
      {children}
      {!shouldHide && (
        <StyledBadge $overlap={overlap} $placement={placement} $status={status}>
          <Typography
            text={String(displayContent)}
            variant="h2"
            color={theme.colors.grayscale.white}
            sx={{ lineHeight: "inherit" }}
          />
        </StyledBadge>
      )}
    </Wrapper>
  )
}

// * placement 값에 따라 배지의 위치와 transform 스타일을 반환
const getPlacementStyle = (placement: CornerPlacement) => {
  switch (placement) {
    case "top-left":
      return `
        top: 0;
        left: 0;
        transform: translate(-50%, -50%);
      `
    case "bottom-right":
      return `
        bottom: 0;
        right: 0;
        transform: translate(50%, 50%);
      `
    case "bottom-left":
      return `
        bottom: 0;
        left: 0;
        transform: translate(-50%, 50%);
      `
    case "top-right":
    default:
      return `
        top: 0;
        right: 0;
        transform: translate(50%, -50%);
      `
  }
}

// * status 타입에 따라 배지 배경 색상을 반환
const getStatusColor = (theme: DefaultTheme, status: StatusUiType) => {
  switch (status) {
    case "success":
      return theme.colors.success[500]
    case "info":
      return theme.colors.info[500]
    case "warning":
      return theme.colors.warning[500]
    case "error":
    default:
      return theme.colors.error[500]
  }
}

const Wrapper = styled(Box)`
  position: relative;
  display: inline-flex;
`

const StyledBadge = styled.div<{
  $status: StatusUiType
  $overlap: "rectangular" | "circular"
  $placement: CornerPlacement
}>`
  position: absolute;
  min-width: 16px;
  height: 16px;
  padding: ${({ $overlap }) => ($overlap === "rectangular" ? "0 6px" : "0px")};
  border-radius: ${({ $overlap, theme }) =>
    $overlap === "circular" ? theme.borderRadius[50] : theme.borderRadius[8]};
  background-color: ${({ theme, $status }) => getStatusColor(theme, $status)};
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  white-space: nowrap;

  ${({ $placement }) => getPlacementStyle($placement)}
`

export default Badge

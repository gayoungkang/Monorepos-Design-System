import { AnchorHTMLAttributes, ReactNode } from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { Typography, TypographyProps } from "../Typography/Typography"
import { theme } from "../../tokens/theme"

export type LinkProps = BaseMixinProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: string | ReactNode
    underline?: "none" | "hover" | "always"
    color?: string
    disabled?: boolean
    typographyProps?: Partial<TypographyProps>
  }
/**---------------------------------------------------------------------------/

* ! Link
*
* * 텍스트 또는 ReactNode를 감싸는 링크 컴포넌트
* * underline 옵션 제공 (none / hover / always)
* * 비활성화 상태 지원 (disabled)
* * disabled 시 클릭 이벤트 및 href 차단
* * Typography 기반 텍스트 렌더링 지원
* * typographyProps를 통한 타이포그래피 세부 스타일 제어
* * 문자열 children / ReactNode children 모두 대응
* * AnchorHTMLAttributes 확장으로 기본 a 태그 속성 지원
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 텍스트 색상 시스템 활용

* @module Link
* 내비게이션 또는 외부 링크를 표현하기 위한 링크 컴포넌트입니다.
* - 문자열 children일 경우 Typography로 감싸 일관된 타이포그래피 제공
* - underline 옵션으로 링크 스타일 제어
* - disabled 상태에서 접근성과 인터랙션 모두 차단
*
* @usage
* <Link href="/home">Home</Link>
* <Link underline="always" color="red">Docs</Link>
* <Link disabled>Disabled Link</Link>

/---------------------------------------------------------------------------**/

const Link = ({
  children,
  underline = "always",
  color = theme.colors.text.primary,
  disabled = false,
  onClick,
  href,
  typographyProps,
  ...others
}: LinkProps) => {
  // * disabled 상태일 때 기본 링크 동작을 막고, 활성 상태일 때만 onClick을 위임
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <StyledLink
      href={disabled ? undefined : href}
      onClick={handleClick}
      underline={underline}
      disabled={disabled}
      $color={color}
      {...others}
    >
      {typeof children === "string" ? (
        <Typography
          variant="b1Bold"
          text={children}
          color={disabled ? theme.colors.text.disabled : color}
          sx={{ lineHeight: "inherit" }}
          {...typographyProps}
        />
      ) : (
        <>{children}</>
      )}
    </StyledLink>
  )
}

const StyledLink = styled.a<{
  underline: "none" | "hover" | "always"
  disabled: boolean
  $color: string
}>`
  display: inline;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  color: ${({ disabled, $color }) => (disabled ? theme.colors.text.disabled : $color)};
  text-decoration: ${({ underline }) => (underline === "always" ? "underline" : "none")};

  &:hover {
    color: ${({ theme }) => theme.colors.primary[400]};
    text-decoration: ${({ underline }) => (underline === "hover" ? "underline" : "none")};
  }
`

export default Link

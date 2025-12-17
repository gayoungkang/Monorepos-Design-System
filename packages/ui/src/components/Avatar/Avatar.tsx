import { useState } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import { Typography } from "../Typography/Typography"
import { SizeUiType } from "../../types"

export type AvatarProps = BaseMixinProps & {
  src?: string
  alt?: string
  name?: string
  size?: SizeUiType
  bgColor?: string
  fgColor?: string
}

const sizeMap = {
  S: { size: 24, fontSize: "10px" },
  M: { size: 32, fontSize: "12px" },
  L: { size: 40, fontSize: "14px" },
}

// * name 문자열을 기반으로 아바타에 표시할 이니셜(최대 2자)을 생성
// * 유효하지 않은 경우 "?"를 반환
const getInitials = (name?: string): string => {
  if (!name) return "?"
  const n = name.trim()
  if (!n) return "?"

  const parts = n.split(" ")

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? "?"
  }

  const first = parts[0][0] ?? ""
  const second = parts[1][0] ?? ""
  const initials = `${first}${second}`.toUpperCase()

  return initials || "?"
}
/**---------------------------------------------------------------------------/

* ! Avatar
*
* * 사용자 프로필을 표시하는 아바타 컴포넌트
* * 이미지(src) 우선 렌더링, 로드 실패 시 이니셜 대체 표시
* * name 기반 이니셜 자동 생성 로직 포함
* * 사이즈 옵션 제공 (S, M, L)
* * 배경색(bgColor) 및 전경색(fgColor) 커스터마이징 지원
* * 원형(circle) 아바타 형태 고정
* * 이미지 에러 상태를 내부 상태로 관리
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상 시스템 활용

* @module Avatar
* 사용자 또는 엔티티를 시각적으로 표현하기 위한 아바타 컴포넌트입니다.
* - `src`가 존재하고 정상 로드되면 이미지 아바타 렌더링
* - 이미지가 없거나 에러 발생 시 name 기반 이니셜 표시
* - size에 따라 아바타 크기 및 텍스트 크기 자동 조정
* - 접근성을 위한 alt 텍스트 지원
*
* @usage
* <Avatar src="/profile.png" name="Jane Doe" />
* <Avatar name="John Smith" size="L" />
* <Avatar name="Guest" bgColor="#999" />

/---------------------------------------------------------------------------**/
const Avatar = ({
  src,
  alt,
  name,
  size = "M",
  bgColor,
  fgColor = theme.colors.grayscale.white,
  ...props
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false)

  const initials = getInitials(name)
  const dimension = sizeMap[size].size

  // * 이미지 로드 실패 시 fallback 렌더링을 위해 에러 상태를 설정
  const handleImgError = () => setImgError(true)

  return (
    <AvatarWrapper
      width={`${dimension}px`}
      height={`${dimension}px`}
      $dimension={dimension}
      $bgColor={bgColor ?? theme.colors.primary[400]}
      {...props}
    >
      {src && !imgError ? (
        <AvatarImg src={src} alt={alt ?? name ?? ""} onError={handleImgError} />
      ) : (
        <Typography
          text={initials}
          color={fgColor}
          sx={{
            fontSize: sizeMap[size].fontSize,
            fontWeight: 600,
            lineHeight: 1,
            userSelect: "none",
          }}
        />
      )}
    </AvatarWrapper>
  )
}

const AvatarWrapper = styled.div<
  BaseMixinProps & {
    $dimension: number
    $bgColor: string
  }
>`
  ${BaseMixin};

  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  width: ${({ $dimension }) => $dimension}px;
  height: ${({ $dimension }) => $dimension}px;
  flex-shrink: 0;
  user-select: none;
`

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

export default Avatar

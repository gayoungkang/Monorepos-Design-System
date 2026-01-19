import { ForwardedRef, forwardRef } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { IconName } from "../Icon/icon-loader"
import Progress, { ProgressProps } from "../Progress/Progress"
import Icon, { IconProps } from "../Icon/Icon"
import { Typography, TypographyProps } from "../Typography/Typography"
import { theme } from "../../tokens/theme"
import { styled } from "../../tokens/customStyled"
import { ColorUiType, SizeUiType, VariantUiType } from "packages/ui/src/types"
import { DefaultTheme } from "styled-components"

export type ButtonProps = BaseMixinProps & {
  text: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  color?: ColorUiType
  variant?: VariantUiType
  size?: SizeUiType
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"]
  disabled?: boolean
  startIcon?: IconName
  endIcon?: IconName
  fileUrl?: string
  fileName?: string
  loading?: boolean
  progressProps?: ProgressProps
  iconProps?: Partial<Omit<IconProps, "name">>
  typographyProps?: Partial<TypographyProps>
}

// * 버튼 variant, color, disabled 상태에 따라 텍스트 색상 결정 함수
const getButtonTextColor = (
  theme: DefaultTheme,
  variant: VariantUiType,
  color: ColorUiType,
  disabled: boolean,
): string => {
  const { colors } = theme
  const cv = color ?? "primary"
  const v = variant ?? "contained"

  const map: Record<ColorUiType, Record<VariantUiType, string>> = {
    primary: {
      contained: colors.grayscale.white,
      text: disabled ? colors.text.disabled : colors.primary[400],
      outlined: disabled ? colors.primary[100] : colors.primary[400],
    },
    secondary: {
      contained: colors.grayscale.white,
      text: disabled ? colors.grayscale[200] : colors.secondary[400],
      outlined: disabled ? colors.grayscale[200] : colors.secondary[400],
    },
    normal: {
      contained: disabled ? colors.text.disabled : colors.text.secondary,
      text: disabled ? colors.text.disabled : colors.text.secondary,
      outlined: disabled ? colors.text.disabled : colors.text.secondary,
    },
  }

  return map[cv][v]
}
/**---------------------------------------------------------------------------/

* ! Button
*
* * 텍스트/아이콘/로딩 상태를 지원하는 공통 버튼 컴포넌트
* * variant(contained/text/outlined), color(primary/secondary/normal), size(S/M/L) 조합 지원
* * disabled 상태에 따른 스타일/텍스트/아이콘 컬러 분기 처리
* * startIcon/endIcon 렌더링 지원 (loading 중에는 아이콘 미표시)
* * loading=true일 때 Progress(Circular, indeterminate)로 대체 렌더링
* * fileUrl + fileName 제공 시 클릭 시점에 파일 다운로드 동작 지원
* * BaseMixin 기반 외부 스타일 확장(width/height/p/sx 등) 지원
* * forwardRef로 button DOM ref 전달 지원
*
* * 스타일/컬러 계산 유틸
*   * getButtonTextColor: theme + variant + color + disabled 기반 텍스트 컬러 결정
*   * getIconColor: variant + color + disabled 기반 아이콘 컬러 결정
*   * getButtonSize: size(S/M/L) 기반 padding 값 결정
*
* * 클릭 처리
*   * fileUrl/fileName이 있으면 handleDownload를 우선 실행(다운로드 링크 생성/클릭/제거)
*   * 그 외에는 onClick 콜백 호출
*
* * ButtonStyle(스타일)
*   * color/variant/disabled 조합으로 base 스타일(background/border/color) 매핑
*   * disabled가 아니면 hover/active 스타일 매핑을 추가 적용
*   * disabled 여부에 따라 cursor(no-drop/pointer) 분기
*
* @module Button
* 디자인 시스템의 기본 버튼 컴포넌트입니다.
* - 텍스트 기반 버튼을 중심으로 아이콘과 로딩 상태를 조합해 사용할 수 있습니다.
* - fileUrl/fileName 조합으로 다운로드 버튼 패턴을 내장 지원합니다.
*
* @usage
* <Button text="저장" onClick={...} />
* <Button text="삭제" variant="outlined" color="secondary" />
* <Button text="로딩" loading />
* <Button text="다운로드" fileUrl="/a.xlsx" fileName="a.xlsx" />

/---------------------------------------------------------------------------**/

const Button = forwardRef(
  (
    {
      text,
      color = "primary",
      variant = "contained",
      disabled = false,
      width,
      height,
      startIcon,
      endIcon,
      onClick,
      fileUrl,
      fileName,
      size = "M",
      loading = false,
      iconProps,
      progressProps,
      type = "button",
      typographyProps,
      ...others
    }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    // * fileUrl/fileName이 존재할 때 a 태그를 생성하여 다운로드를 트리거
    const handleDownload = () => {
      if (!fileUrl || !fileName) return
      const link = document.createElement("a")
      link.href = fileUrl
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // * 다운로드 버튼/일반 버튼 클릭을 분기하여 실행
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (fileUrl && fileName) handleDownload()
      else onClick?.(e)
    }

    // * variant/color/disabled 상태에 따라 아이콘 색상을 계산
    const getIconColor = (
      variant: VariantUiType,
      colorVariant: ButtonProps["color"],
      theme: DefaultTheme,
      disabled: boolean,
    ): string => {
      const { grayscale, primary, text } = theme.colors

      if (disabled) {
        switch (colorVariant) {
          case "primary":
            return variant === "contained" ? grayscale.white : primary[200]
          case "secondary":
            return grayscale[200]
          case "normal":
            return variant === "text" ? grayscale[300] : text.disabled
          default:
            return text.disabled
        }
      }

      switch (colorVariant) {
        case "primary":
          return grayscale.white
        case "secondary":
          return variant === "contained" ? grayscale.white : grayscale[700]
        case "normal":
          return variant === "text" ? grayscale[600] : text.secondary
        default:
          return grayscale[900]
      }
    }

    // * size(S/M/L)에 따라 padding 값을 반환
    const getButtonSize = (size: SizeUiType): string => {
      switch (size) {
        case "S":
          return "3px 9px"
        case "M":
          return "5px 15px"
        case "L":
          return "7px 21px"
        default:
          return "5px 15px"
      }
    }

    // * 텍스트 컬러는 variant/color/disabled 조합으로 계산
    const textColor = getButtonTextColor(theme, variant, color, disabled)

    return (
      <ButtonStyle
        ref={ref}
        type={type}
        width={width}
        height={height}
        variant={variant}
        disabled={disabled}
        onClick={handleClick}
        color={color}
        p={getButtonSize(size)}
        {...others}
      >
        {startIcon && !loading && (
          <Icon
            color={getIconColor(variant, color, theme, disabled) as `#${string}`}
            size={12}
            name={startIcon}
            mr="2px"
            {...iconProps}
          />
        )}

        {loading ? (
          <Progress
            size="12px"
            color={color === "normal" ? theme.colors.grayscale[700] : theme.colors.grayscale.white}
            backgroundColor="transparent"
            type="Circular"
            variant="indeterminate"
            {...progressProps}
          />
        ) : (
          <Typography variant="b1Bold" text={text} color={textColor} {...typographyProps} />
        )}

        {endIcon && !loading && <Icon size={12} name={endIcon} ml="2px" {...iconProps} />}
      </ButtonStyle>
    )
  },
)

const ButtonStyle = styled.button<Omit<ButtonProps, "text">>`
  ${BaseMixin}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  width: ${({ width }) => width ?? "auto"};
  height: ${({ height }) => height ?? "auto"};
  transition: all 0.2s ease-in-out;

  ${({ variant, theme, disabled, color }) => {
    const { colors } = theme

    const cv = color ?? "primary"
    const v = variant ?? "contained"

    const base: Record<ColorUiType, Record<VariantUiType, string>> = {
      primary: {
        contained: `
          background-color: ${disabled ? colors.text.disabled : colors.primary[400]};
          color: ${colors.grayscale.white};
        `,
        text: `
          background-color: transparent;
          color: ${disabled ? colors.text.disabled : colors.primary[400]};
        `,
        outlined: `
          background-color: ${colors.grayscale.white};
          border: 1px solid ${disabled ? colors.primary[100] : colors.primary[400]};
          color: ${disabled ? colors.primary[100] : colors.primary[400]};
        `,
      },

      secondary: {
        contained: `
          background-color: ${disabled ? colors.grayscale[200] : colors.grayscale[700]};
          color: ${colors.grayscale.white};
        `,
        text: `
          background-color: transparent;
          color: ${disabled ? colors.grayscale[200] : colors.secondary[400]};
        `,
        outlined: `
          background-color: ${colors.grayscale.white};
          border: 1px solid ${disabled ? colors.grayscale[200] : colors.secondary[400]};
          color: ${disabled ? colors.grayscale[200] : colors.secondary[400]};
        `,
      },

      normal: {
        contained: `
          background-color: ${disabled ? colors.grayscale[200] : colors.border.thick};
          color: ${disabled ? colors.text.disabled : colors.text.secondary};
        `,
        text: `
          background-color: transparent;
          color: ${disabled ? colors.text.disabled : colors.text.secondary};
        `,
        outlined: `
          background-color: ${disabled ? colors.grayscale[100] : colors.grayscale.white};
          border: 1px solid ${colors.border.thick};
          color: ${disabled ? colors.text.disabled : colors.text.secondary};
        `,
      },
    }

    const active = !disabled
      ? {
          primary: {
            contained: `
              &:hover { background-color: ${colors.primary[300]}; }
              &:active { background-color: ${colors.primary[200]}; }
            `,
            text: `
              &:hover { color: ${colors.primary[300]}; }
              &:active { color: ${colors.primary[200]}; }
            `,
            outlined: `
              &:hover { background-color: ${colors.primary[100]}; }
              &:active { background-color: ${colors.primary[200]}; }
            `,
          },

          secondary: {
            contained: `
              &:hover { background-color: ${colors.grayscale[600]}; }
              &:active { background-color: ${colors.grayscale[500]}; }
            `,
            text: `
              &:hover { color: ${colors.grayscale[600]}; }
              &:active { color: ${colors.grayscale[500]}; }
            `,
            outlined: `
              &:hover { background-color: ${colors.grayscale[100]}; }
              &:active { background-color: ${colors.grayscale[500]}; }
            `,
          },

          normal: {
            contained: `
              &:hover { background-color: ${colors.grayscale[100]}; }
              &:active { background-color: ${colors.grayscale[50]}; }
            `,
            text: `
              &:hover {
                background-color: ${colors.background.default};
                color: ${colors.grayscale[600]};
              }
              &:active {
                background-color: ${colors.background.dark};
                color: ${colors.grayscale[500]};
              }
            `,
            outlined: `
              &:hover { background-color: ${colors.background.default}; }
              &:active { background-color: ${colors.background.dark}; }
            `,
          },
        }
      : {
          primary: { contained: "", text: "", outlined: "" },
          secondary: { contained: "", text: "", outlined: "" },
          normal: { contained: "", text: "", outlined: "" },
        }

    // * disabled 여부에 따라 커서 스타일을 결정
    const cursor = disabled ? "cursor: no-drop;" : "cursor: pointer;"

    return `
      ${base[cv][v]}
      ${cursor}
      ${active[cv][v]}
    `
  }}
`

Button.displayName = "Button"
export default Button

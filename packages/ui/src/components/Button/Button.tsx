import { ForwardedRef, forwardRef } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { IconName } from "../Icon/icon-loader"
import Progress, { ProgressProps } from "../Progress/Progress"
import Icon, { IconProps } from "../Icon/Icon"
import { Typography, TypographyProps } from "../Typography/Typography"
import { theme } from "../../tokens/theme"
import { styled } from "../../tokens/customStyled"
import { SizeUiType, VariantUiType } from "packages/ui/src/types"
import { DefaultTheme } from "styled-components"

export type ButtonProps = BaseMixinProps & {
  text: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  colorVariant?: "primary" | "secondary" | "tertiary"
  variant?: VariantUiType
  size?: SizeUiType
  type?: "button" | "submit" | "reset"
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
/**
 * @module Button
 * 재사용 가능한 커스텀 Button 컴포넌트로, 다양한 스타일 변형(variant), 색상(colorVariant), 상태(disabled, loading 등),
 * 아이콘(startIcon, endIcon) 및 파일 다운로드 기능(fileUrl + fileName)을 지원합니다.
 *
 * - colorVariant
 * - `BaseMixin` 기반 스타일 확장
 * - 기본 텍스트 버튼, 로딩 인디케이터, 시작/끝 아이콘 포함 가능
 * - `contained`, `text`, `outlined` variant 지원
 * - `primary`, `secondary`, `tertiary` 색상계열 지원
 *
 * @props
 * - text : 버튼 텍스트
 * - colorVariant : 색상 테마
 * - variant : 버튼 스타일 (contained, text, outlined)
 * - size : 버튼 크기
 * - type : * HTML button type
 * - disabled: 비활성화 여부
 * - startIcon : 시작 아이콘
 * - endIcon: 끝 아이콘
 * - onClick : 클릭 핸들러
 * - fileUrl : 파일 다운로드 URL
 * - fileName : 다운로드 파일 이름
 * - loading : 로딩 상태
 * - progressProps : Progress 컴포넌트 props
 * - iconProps : Icon 컴포넌트 props 일부
 * - typographyProps : Typography 컴포넌트 props 일부
 *
 * @사용법
 * <Button
 *  startIcon="Building5Line"
 *  colorVariant="tertiary"
 *  variant="text"
 *  text="버튼"
 *  disabled
 *  />
 *
 */
const Button = forwardRef(
  (
    {
      text,
      colorVariant = "primary",
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
    // *  파일 다운로드 핸들러
    const handleDownload = () => {
      if (!fileUrl || !fileName) return
      const link = document.createElement("a")
      link.href = fileUrl
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // *  onClick 핸들러
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (fileUrl && fileName) handleDownload()
      else onClick?.(e)
    }

    // *  버튼 variant, colorVariant 상태에 따라 텍스트 색상 결정 함수
    const getTypographyColor = (
      colorVariant: ButtonProps["colorVariant"],
      disabled: boolean,
    ): string => {
      if (disabled) {
        switch (colorVariant) {
          case "primary":
            return "grayscale.white"
          case "secondary":
            return "grayscale.white"
          case "tertiary":
            return "text.disabled"
          default:
            return "text.disabled"
        }
      } else {
        switch (colorVariant) {
          case "primary":
            return "grayscale.white"
          case "secondary":
            return "grayscale.white"
          case "tertiary":
            return "text.secondary"
          default:
            return "grayscale.white"
        }
      }
    }

    // * 버튼 variant, colorVariant 상태에 따라 아이콘 색상 결정 함수
    const getIconColor = (
      variant: VariantUiType,
      colorVariant: ButtonProps["colorVariant"],
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
          case "tertiary":
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
        case "tertiary":
          return variant === "text" ? grayscale[600] : text.secondary
        default:
          return grayscale[900]
      }
    }

    // * 버튼 size에 따라 padding 결정되는 함수
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

    return (
      <ButtonStyle
        ref={ref}
        type={type}
        width={width}
        height={height}
        variant={variant}
        disabled={disabled}
        onClick={handleClick}
        colorVariant={colorVariant}
        p={getButtonSize(size)}
        {...others}
      >
        {startIcon && !loading && (
          <Icon
            color={getIconColor(variant, colorVariant, theme, disabled) as `#${string}`}
            size={12}
            name={startIcon}
            mr="2px"
            {...iconProps}
          />
        )}
        {loading ? (
          <Progress
            size="12px"
            color={
              colorVariant === "tertiary"
                ? theme.colors.grayscale[700]
                : theme.colors.grayscale.white
            }
            backgroundColor="transparent"
            type="Circular"
            variant="indeterminate"
            {...progressProps}
          />
        ) : (
          <Typography
            variant="b1Bold"
            text={text}
            color={getTypographyColor(colorVariant, disabled)}
            {...typographyProps}
          />
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

  ${({ variant, theme, disabled, colorVariant }) => {
    const { colors } = theme

    const cv = colorVariant ?? "primary"
    const v = variant ?? "contained"

    const base: Record<"primary" | "secondary" | "tertiary", Record<VariantUiType, string>> = {
      primary: {
        contained: `
          background-color: ${disabled ? colors.text.disabled : colors.primary[400]};
          color: ${colors.grayscale.white};
        `,
        text: `
          background-color: transparent;
          color: ${disabled ? colors.primary[200] : colors.primary[400]};
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
          color: ${disabled ? colors.grayscale[200] : colors.grayscale[700]};
        `,
        outlined: `
          background-color: ${colors.grayscale.white};
          border: 1px solid ${disabled ? colors.grayscale[200] : colors.grayscale[700]};
          color: ${disabled ? colors.grayscale[200] : colors.grayscale[700]};
        `,
      },

      tertiary: {
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

    //
    // active styles (hover/active)
    //
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

          tertiary: {
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
          tertiary: { contained: "", text: "", outlined: "" },
        }

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

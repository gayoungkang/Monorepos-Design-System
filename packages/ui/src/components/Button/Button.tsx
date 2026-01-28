import type { ButtonHTMLAttributes, ForwardedRef, MouseEvent } from "react"
import { forwardRef } from "react"
import { useTheme, type DefaultTheme } from "styled-components"
import { BaseMixin, type BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import type { IconName } from "../Icon/icon-loader"
import Icon, { type IconProps } from "../Icon/Icon"
import Progress, { type ProgressProps } from "../Progress/Progress"
import { Typography, type TypographyProps } from "../Typography/Typography"
import type { ColorUiType, SizeUiType, VariantUiType } from "packages/ui/src/types"

export type ButtonProps = BaseMixinProps & {
  text: string
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  color?: ColorUiType
  variant?: VariantUiType
  size?: SizeUiType
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"]
  disabled?: boolean
  startIcon?: IconName
  endIcon?: IconName
  fileUrl?: string
  fileName?: string
  loading?: boolean
  onDownload?: () => void | Promise<void>
  progressProps?: ProgressProps
  iconProps?: Partial<Omit<IconProps, "name">>
  typographyProps?: Partial<TypographyProps>
}
/**---------------------------------------------------------------------------/
 *
 * ! Button
 *
 * * 텍스트/아이콘/로딩/다운로드 트리거를 단일 인터페이스로 제공하는 베이스 버튼 컴포넌트
 * * `variant(contained|text|outlined)` + `color(primary|secondary|normal)` + `disabled/loading` 조합으로 스타일/상호작용을 제어
 * * `fileUrl + fileName`이 제공되면 “다운로드 버튼”으로 동작하며, `onDownload`가 있으면 이를 우선 실행
 *
 * * 동작 규칙
 *   * disabled/loading 처리
 *     * `isDisabled = disabled || loading`으로 통합 판단
 *     * 비활성 상태에서는 클릭을 차단하고, `aria-disabled`/`data-loading`으로 상태를 노출
 *   * 클릭 처리 우선순위
 *     1) `isDisabled`면 아무 동작도 하지 않음
 *     2) `fileUrl && fileName`이 있으면 다운로드 분기로 진입
 *        * `onDownload`가 있으면 await 실행(사용자 정의 다운로드/권한 체크 등)
 *        * 없으면 `triggerAnchorDownload(fileUrl, fileName)`로 a 태그 다운로드를 트리거
 *     3) 일반 버튼이면 `onClick(e)` 호출
 *   * 로딩 상태 표시
 *     * `loading`이면 텍스트 대신 `Progress(Circular, indeterminate)` 렌더링
 *     * 로딩 중에는 start/end 아이콘을 렌더링하지 않음
 *
 * * 레이아웃/스타일 관련 규칙
 *   * ButtonStyle
 *     * inline-flex 중앙 정렬 + borderRadius 토큰 적용
 *     * width/height는 BaseMixinProps에서 전달된 값을 그대로 사용(없으면 auto)
 *     * focus-visible: primary[200] 색상의 outline로 접근성 포커스 표시
 *   * padding
 *     * `size(S|M|L)`에 따라 `getButtonPadding`으로 패딩을 결정
 *   * variant/color 스타일
 *     * `getButtonVariantStyles(theme, variant, color, disabled)`로 배경/보더/텍스트/hover/active/cursor를 문자열로 생성
 *   * 텍스트/아이콘 색상
 *     * 텍스트: `getButtonTextColor(theme, variant, color, isDisabled)`로 계산
 *     * 아이콘: `getIconColor(theme, variant, color, isDisabled)`로 계산(로딩 중은 미표시)
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약
 *     * `text`는 버튼 라벨로 사용(로딩이 아닐 때 Typography로 렌더)
 *     * `startIcon/endIcon`은 IconName 기반이며, `iconProps`로 세부 옵션을 확장
 *     * `progressProps`로 로딩 인디케이터 옵션을 확장
 *     * `typographyProps`로 라벨 Typography 옵션을 확장
 *   * 내부 계산 로직
 *     * 색상/스타일은 theme 토큰을 기반으로 variant/color/disabled 조합 맵을 통해 결정
 *     * 다운로드 트리거는 DOM a 태그 생성/클릭/제거 방식으로 수행
 *
 * @module Button
 * 디자인 시스템의 기본 버튼(변형/색상/크기/로딩/다운로드)을 제공하는 공통 베이스 컴포넌트
 *
 * @usage
 * <Button text="저장" onClick={...} />
 * <Button text="다운로드" fileUrl="/file.csv" fileName="file.csv" />
 * <Button text="로딩" loading />
 *
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
      loading = false,
      onDownload,
      size = "M",
      iconProps,
      progressProps,
      type = "button",
      typographyProps,
      ...others
    }: ButtonProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    const theme = useTheme()
    const isDisabled = disabled || loading

    // * 다운로드 버튼/일반 버튼 클릭을 분기하여 실행 (onDownload 우선)
    const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return

      if (fileUrl && fileName) {
        if (onDownload) await onDownload()
        else triggerAnchorDownload(fileUrl, fileName)
        return
      }

      onClick?.(e)
    }

    // * 텍스트 컬러는 variant/color/isDisabled 조합으로 계산
    const textColor = getButtonTextColor(theme, variant, color, isDisabled)

    return (
      <ButtonStyle
        ref={ref}
        type={type}
        width={width}
        height={height}
        variant={variant}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading || undefined}
        data-loading={loading ? "true" : undefined}
        onClick={handleClick}
        color={color}
        p={getButtonPadding(size)}
        {...others}
      >
        {startIcon && !loading && (
          <Icon
            color={getIconColor(theme, variant, color, isDisabled) as `#${string}`}
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

const ButtonStyle = styled.button<Omit<ButtonProps, "text" | "onDownload">>`
  ${BaseMixin}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius[4]};
  width: ${({ width }) => width ?? "auto"};
  height: ${({ height }) => height ?? "auto"};
  transition: all 0.2s ease-in-out;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary[200]};
    outline-offset: 2px;
  }

  ${({ variant, theme, disabled, color }) =>
    getButtonVariantStyles(theme, variant ?? "contained", color ?? "primary", !!disabled)}
`

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

// * variant/color/disabled 상태에 따라 아이콘 색상을 계산
const getIconColor = (
  theme: DefaultTheme,
  variant: VariantUiType,
  colorVariant: ColorUiType,
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
const getButtonPadding = (size: SizeUiType): string => {
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

// * fileUrl/fileName이 존재할 때 a 태그를 생성하여 다운로드를 트리거
const triggerAnchorDownload = (fileUrl?: string, fileName?: string) => {
  if (!fileUrl || !fileName) return
  const link = document.createElement("a")
  link.href = fileUrl
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// * variant/color/disabled 조합으로 버튼 스타일 문자열을 생성
const getButtonVariantStyles = (
  theme: DefaultTheme,
  variant: VariantUiType,
  color: ColorUiType,
  disabled: boolean,
) => {
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
}

Button.displayName = "Button"
export default Button

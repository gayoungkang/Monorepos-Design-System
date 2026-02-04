import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import type {
  ChangeEvent,
  FocusEventHandler,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  MouseEvent,
  Ref,
} from "react"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import type { AxisPlacement, SizeUiType, VariantFormType } from "../../types"
import Flex from "../Flex/Flex"
import Label from "../Label/Label"
import type { LabelProps } from "../Label/Label"
import Box from "../Box/Box"
import Icon from "../Icon/Icon"
import type { IconProps } from "../Icon/Icon"
import IconButton from "../IconButton/IconButton"
import HelperText from "../HelperText/HelperText"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import type { IconName } from "../Icon/icon-loader"
import { css } from "styled-components"

export type TextFieldProps = BaseMixinProps & {
  variant?: VariantFormType
  size?: SizeUiType
  type?: HTMLInputTypeAttribute
  name?: string
  label?: string
  placeholder?: string
  value?: string
  onlyNumber?: boolean
  maxLength?: number
  onClear?: () => void
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onFocus?: () => void
  onSearch?: (value: string, isEnter?: boolean) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onKeyUp?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
  onMouseDown?: (event: MouseEvent<HTMLDivElement>) => void
  onMouseUp?: (event: MouseEvent<HTMLDivElement>) => void
  disabled?: boolean
  error?: boolean
  helperText?: string
  startIcon?: IconName
  endIcon?: IconName
  required?: boolean
  readOnly?: boolean
  labelPlacement?: AxisPlacement
  labelProps?: Partial<Omit<LabelProps, "text">>
  iconProps?: Partial<Omit<IconProps, "name">>
  multiline?: boolean
  rows?: number
  clearable?: boolean
  autoFocus?: boolean
  onSearchEnter?: (value: string, isEnter: boolean) => void
}

type InputWrapperStyleProps = {
  $variant?: VariantFormType
  $size?: SizeUiType
  $isActive?: boolean
  $error?: boolean
  $disabled?: boolean
  $readOnly?: boolean
  $multiline?: boolean
}

type InputStyleProps = {
  $multiline?: boolean
  $labelPlacement?: AxisPlacement
  $readOnly?: boolean
}
/**---------------------------------------------------------------------------/
 *
 * ! TextField
 *
 * * 단일 라인(input) 및 멀티라인(textarea)을 지원하는 입력 컴포넌트입니다.
 * * `value` 변경을 감지하여 내부 입력값을 동기화하는 controlled 지원 구조이며, 내부 상태(`inputValue`)로 표시 값을 관리합니다.
 * * `variant/size`에 따라 외곽선/배경/최소 높이 및 아이콘 크기를 결정합니다.
 * * 라벨(label)은 `labelPlacement`에 따라 상/하/좌/우로 배치되며, required 표기를 지원합니다.
 * * `type`에 따라 검색(search) / 비밀번호(password) 보조 UI(아이콘 버튼)를 노출합니다.
 * * `onlyNumber` 및 `maxLength` 옵션으로 입력 문자열을 정규화하며, 정규화 결과는 내부 상태에만 반영합니다.
 * * `clearable` + 포커스 활성 상태에서 값이 있을 때 clear 버튼을 노출하고, 클릭 시 내부 값만 초기화 후 포커스를 유지합니다.
 *
 * * 동작 규칙
 *   * 입력 모드:
 *     * `multiline=false`이면 input, `multiline=true`이면 textarea를 렌더링합니다.
 *     * forwardRef는 현재 모드에 맞는 엘리먼트(input/textarea)를 노출합니다(useImperativeHandle).
 *   * controlled 동기화:
 *     * 외부 `value`가 변경되면 `inputValue`를 `value ?? ""`로 동기화합니다.
 *   * autoFocus:
 *     * `autoFocus && !disabled && !readOnly`일 때 requestAnimationFrame으로 해당 엘리먼트 focus를 수행합니다.
 *   * 값 정규화(normalizeValue):
 *     * `onlyNumber`가 true면 숫자 이외 문자를 제거합니다(`/[^0-9]/g`).
 *     * `maxLength`가 유효하면 길이를 초과하는 문자열을 slice로 자릅니다.
 *   * onChange 처리:
 *     * 입력값은 정규화 후 `inputValue`에 반영됩니다.
 *     * `onChange`는 원본 이벤트를 그대로 전달하며(이벤트 객체 변형 금지), 정규화 값은 이벤트에 주입하지 않습니다.
 *   * clear 버튼(handleClear):
 *     * `setInputValue("")`로 내부 값만 초기화합니다.
 *     * `onClear` 콜백을 호출하고, 현재 입력 엘리먼트를 다시 focus합니다.
 *     * 노출 조건: `inputValue !== "" && !multiline && clearable && !readOnly && isActive`
 *   * 검색(search):
 *     * `type === "search" && !multiline`에서 검색 아이콘 버튼을 노출합니다.
 *     * 클릭 시 `onSearch(trimmed, false)`를 호출합니다.
 *     * Enter 입력 시 `onSearch(trimmed, true)`를 호출하며 기본 Enter 동작을 prevent합니다.
 *     * Enter 검색 시 `onSearchEnter(trimmed, true)`도 함께 호출됩니다.
 *   * 비밀번호 표시(password):
 *     * `type === "password" && !multiline`에서 눈 아이콘 버튼을 노출합니다.
 *     * 클릭 시 `isPasswordVisible` 토글, 실제 input type을 `text/password`로 전환합니다.
 *   * focus/blur:
 *     * focus 시 `isActive=true`, blur 시 `isActive=false`로 래퍼 강조 스타일을 제어합니다.
 *     * 외부 `onFocus/onBlur`를 각각 호출합니다.
 *   * disabled/readOnly:
 *     * disabled는 입력 및 버튼의 상호작용을 제한하고 스타일을 비활성화 상태로 전환합니다.
 *     * readOnly는 입력은 읽기 전용으로 유지하며, clear/search/password 토글 등 일부 보조 상호작용을 제한합니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 아이콘 크기:
 *     * size(S/M/L)에 따라 `14/16/18px`로 계산하며(상위에서 계산 규칙), start/end/search/clear/password 버튼에 동일 적용합니다.
 *   * InputWrapper(외곽 래퍼):
 *     * size에 따라 최소 높이: L=32px, M=28px, S=24px
 *     * variant:
 *       * outlined: 테두리 1px + borderRadius 적용
 *       * filled: 배경 `theme.colors.background.default`
 *       * standard: 투명 배경 + 하단 보더
 *     * 활성 상태(isActive)에서:
 *       * standard: border-bottom을 info[300]으로 강조
 *       * outlined/filled: border-color를 info[300]으로 강조
 *     * error 상태에서:
 *       * standard: border-bottom을 error[300]
 *       * outlined/filled: border-color를 error[300]
 *     * disabled/readOnly에서(outlined/filled):
 *       * border-color grayscale[200], background background.default, cursor not-allowed
 *   * 입력 요소 공통 스타일(commonInputStyle):
 *     * flex:1, border/outline 제거, 투명 배경
 *     * placeholder/disabled 색상은 theme 토큰 사용
 *     * readOnly는 cursor를 no-drop으로 설정
 *   * 멀티라인:
 *     * textarea는 resize none + font-family inherit 적용
 *     * 래퍼 align-items를 flex-start로 전환
 *   * 라벨 배치:
 *     * top/bottom은 renderTopBottomLabel로 렌더링(해당 placement일 때만)
 *     * left/right는 입력 래퍼 좌/우에 인라인 렌더링
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약(필수/선택):
 *     * 값/이벤트: value, onChange, onBlur, onFocus, onKeyDown/onKeyUp
 *     * 모드/제어: multiline, rows, type(search/password), clearable, readOnly, disabled
 *     * 정규화: onlyNumber, maxLength
 *     * 보조 기능: onSearch, onSearchEnter, onClear, startIcon/endIcon, iconProps
 *     * 표시: label, labelPlacement, required, helperText/error
 *   * 내부 계산 로직:
 *     * `inputType`은 password + visible 상태에 따라 text/password로 변환됩니다.
 *     * search는 `trim()`된 값을 기준으로 콜백을 호출합니다.
 *   * 서버/클라이언트 제어 여부:
 *     * 외부 `value` 제공 시 controlled로 동작하며, 내부 `inputValue`는 표시/상호작용을 위한 상태로 유지됩니다.
 *
 * @module TextField
 * variant/size, label placement, search/password/clear 보조 UI를 포함한 입력 컴포넌트입니다.
 *
 * @usage
 * <TextField label="Name" value={v} onChange={onChange} />
 * <TextField type="search" onSearch={(q) => ...} />
 * <TextField type="password" />
 * <TextField multiline rows={6} />
 *
/---------------------------------------------------------------------------**/

const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  (
    {
      variant = "outlined",
      size = "M",
      name,
      type = "text",
      label,
      placeholder,
      value,
      onlyNumber = false,
      maxLength,
      onChange,
      onBlur,
      onFocus,
      onSearch,
      onKeyDown,
      onKeyUp,
      onClick,
      onMouseDown,
      onMouseUp,
      disabled = false,
      helperText,
      startIcon,
      endIcon,
      required,
      readOnly = false,
      labelProps,
      iconProps,
      error,
      onClear,
      multiline = false,
      rows = 20,
      clearable = true,
      labelPlacement = "top",
      autoFocus,
      onSearchEnter,
      ...others
    },
    ref: Ref<HTMLInputElement | HTMLTextAreaElement | null>,
  ) => {
    const [inputValue, setInputValue] = useState(value ?? "")
    const [isActive, setIsActive] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const inputRef = useRef<HTMLInputElement | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // * size에 따라 아이콘 크기 계산(상위에서 계산 규칙 준수: 이 컴포넌트가 상위)
    const getIconSize = (s: SizeUiType): string => {
      switch (s) {
        case "S":
          return "14px"
        case "M":
          return "16px"
        case "L":
          return "18px"
        default:
          return "16px"
      }
    }

    // * forwardRef에 현재 모드에 맞는 엘리먼트 노출
    useImperativeHandle(ref, () => (multiline ? textareaRef.current! : inputRef.current!), [
      multiline,
    ])

    // * password visibility 반영
    const inputType = type === "password" && isPasswordVisible ? "text" : type

    // * 외부 value 변경 시 내부 동기화(controlled 지원)
    useEffect(() => {
      setInputValue(value ?? "")
    }, [value])

    // * autoFocus 동작
    useEffect(() => {
      if (!autoFocus || disabled || readOnly) return
      const el = multiline ? textareaRef.current : inputRef.current
      if (!el) return

      const id = requestAnimationFrame(() => el.focus())
      return () => cancelAnimationFrame(id)
    }, [autoFocus, disabled, readOnly, multiline])

    // * 값 정제(onlyNumber/maxLength)
    const normalizeValue = (raw: string) => {
      let v = raw
      if (onlyNumber) v = v.replace(/[^0-9]/g, "")
      if (typeof maxLength === "number" && maxLength >= 0 && v.length > maxLength)
        v = v.slice(0, maxLength)
      return v
    }

    // * 입력 변경 핸들러 (이벤트 객체 변형 금지)
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const next = normalizeValue(e.target.value)
      setInputValue(next)
      onChange?.(e)
    }

    // * clear 버튼 클릭 시 내부 값만 초기화 (가짜 이벤트 생성 금지)
    const handleClear = () => {
      setInputValue("")
      onClear?.()
      const el = multiline ? textareaRef.current : inputRef.current
      el?.focus()
    }

    // * search 실행
    const fireSearch = (isEnter: boolean) => {
      const trimmed = inputValue.trim()
      onSearch?.(trimmed, isEnter)
      if (isEnter) onSearchEnter?.(trimmed, true)
    }

    const handleSearchClick = () => fireSearch(false)

    // * Enter 시 검색(검색 타입일 때만)
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (type === "search" && e.key === "Enter") {
        e.preventDefault()
        fireSearch(true)
      }
      onKeyDown?.(e)
    }

    const handleFocus = () => {
      setIsActive(true)
      onFocus?.()
    }

    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsActive(false)
      onBlur?.(event)
    }

    const renderTopBottomLabel = (position: "top" | "bottom") => {
      if (!label) return null
      if (position === "top" && labelPlacement !== "top") return null
      if (position === "bottom" && labelPlacement !== "bottom") return null

      return (
        <Flex align="flex-start">
          <Label
            text={label}
            required={required}
            mb={position === "top" ? 4 : 0}
            mt={position === "bottom" ? 4 : 0}
            {...labelProps}
          />
        </Flex>
      )
    }

    const iconSize = getIconSize(size)

    return (
      <Box width="100%" sx={{ position: "relative", backgroundColor: "transparent" }} {...others}>
        {renderTopBottomLabel("top")}

        <Flex width="100%" height="fit-content" align="center" justify="space-between">
          {label && labelPlacement === "left" && (
            <Label text={label} required={required} mr={4} {...labelProps} />
          )}

          <InputWrapper
            $variant={variant}
            $error={!!error}
            $disabled={disabled}
            $isActive={isActive}
            $readOnly={readOnly}
            $multiline={multiline}
            $size={size}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
          >
            {startIcon && <Icon size={iconSize} name={startIcon} ml={8} {...iconProps} />}

            {multiline ? (
              <StyledTextarea
                ref={textareaRef}
                $multiline
                $labelPlacement={labelPlacement}
                $readOnly={readOnly}
                placeholder={placeholder}
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                onKeyUp={onKeyUp}
                disabled={disabled}
                readOnly={readOnly}
                name={name}
                rows={rows}
              />
            ) : (
              <StyledInput
                ref={inputRef}
                $labelPlacement={labelPlacement}
                $readOnly={readOnly}
                type={inputType}
                placeholder={placeholder}
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                onKeyUp={onKeyUp}
                disabled={disabled}
                readOnly={readOnly}
                name={name}
              />
            )}

            {inputValue !== "" && !multiline && clearable && !readOnly && isActive && (
              <IconButton
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                icon="CloseLine"
                size={iconSize}
                disabled={disabled}
                iconProps={{ color: theme.colors.grayscale[300] }}
                mr={8}
                sx={{ padding: 0, backgroundColor: "transparent" }}
              />
            )}

            {type === "search" && !multiline && (
              <IconButton
                onClick={handleSearchClick}
                icon="SearchLine"
                size={iconSize}
                mr={8}
                iconProps={{ color: theme.colors.grayscale[300] }}
                disabled={readOnly || disabled}
                sx={{ padding: 0, backgroundColor: "transparent" }}
              />
            )}

            {endIcon && <Icon size={iconSize} name={endIcon} mr={8} {...iconProps} />}

            {type === "password" && !multiline && (
              <IconButton
                onClick={() => setIsPasswordVisible((p) => !p)}
                icon={isPasswordVisible ? "Eye" : "EyeOff"}
                size={iconSize}
                mr={8}
                disabled={readOnly || disabled}
                iconProps={{ color: theme.colors.grayscale[300] }}
                sx={{ padding: 0, backgroundColor: "transparent" }}
              />
            )}
          </InputWrapper>

          {label && labelPlacement === "right" && (
            <Label text={label} required={required} ml={4} {...labelProps} />
          )}
        </Flex>

        {renderTopBottomLabel("bottom")}

        {error && <HelperText status="error" text={helperText ?? ""} mt={3} />}
      </Box>
    )
  },
)

TextField.displayName = "TextField"

const InputWrapper = styled.div<InputWrapperStyleProps>`
  display: flex;
  align-items: ${({ $multiline }) => ($multiline ? "flex-start" : "center")};
  width: 100%;
  height: auto;
  min-height: ${({ $size }) => ($size === "L" ? "32px" : $size === "M" ? "28px" : "24px")};

  border-radius: ${({ theme, $variant }) => ($variant === "outlined" ? theme.borderRadius[4] : 0)};
  transition: all 0.2s ease-in-out;

  background-color: ${({ theme, $variant }) => {
    switch ($variant) {
      case "filled":
        return theme.colors.background.default
      case "standard":
        return "transparent"
      default:
        return theme.colors.grayscale.white
    }
  }};

  border: ${({ $variant }) =>
    $variant === "outlined" ? `1px solid ${theme.colors.border.default}` : "0"};

  border-bottom: ${({ theme, $variant }) =>
    $variant === "standard"
      ? `1px solid ${theme.colors.border.default}`
      : `1px solid ${theme.colors.border.default}`};

  ${({ $isActive, $variant, $disabled, $readOnly }) =>
    $isActive &&
    !$disabled &&
    !$readOnly &&
    ($variant === "standard"
      ? `
        border-bottom: 1px solid ${theme.colors.info[300]};
      `
      : `
        border-color: ${theme.colors.info[300]};
      `)}

  ${({ $error, $variant }) =>
    $error &&
    `
      ${
        $variant === "standard"
          ? `border-bottom: 1px solid ${theme.colors.error[300]};`
          : `border-color: ${theme.colors.error[300]};`
      }
    `}

  ${({ $disabled, $readOnly, $variant }) =>
    ($disabled || $readOnly) &&
    ($variant === "outlined" || $variant === "filled") &&
    `
      border-color: ${theme.colors.grayscale[200]};
      background-color: ${theme.colors.background.default};
      cursor: not-allowed;
    `}
`

const commonInputStyle = css<InputStyleProps>`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: ${theme.colors.text.secondary};
  width: 100%;
  font-size: 12px;
  padding: 4px 8px;
  text-align: left;

  &::placeholder {
    font-size: 12px;
    color: ${theme.colors.text.disabled};
  }

  &:disabled {
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }

  ${({ $readOnly }) =>
    $readOnly &&
    `
      cursor: no-drop;
    `}
`

const StyledInput = styled.input<InputStyleProps>`
  ${commonInputStyle};
`

const StyledTextarea = styled.textarea<InputStyleProps>`
  ${commonInputStyle};
  resize: none;
  font-family: inherit;
`

export default TextField

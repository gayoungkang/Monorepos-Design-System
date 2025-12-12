import {
  ChangeEvent,
  FocusEventHandler,
  forwardRef,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  MouseEvent,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { BaseMixinProps } from "../../tokens/baseMixin"
import { LabelPlacement, SizeUiType, VariantFormType } from "../../types"
import Flex from "../Flex/Flex"
import Label, { LabelProps } from "../Label/Label"
import Box from "../Box/Box"
import Icon, { IconProps } from "../Icon/Icon"
import IconButton from "../IconButton/IconButton"
import HelperText from "../HelperText/HelperText"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import { IconName } from "../Icon/icon-loader"

export type textFieldProps = BaseMixinProps & {
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
  labelPlacement?: LabelPlacement
  labelProps?: Partial<Omit<LabelProps, "text">>
  iconProps?: Partial<Omit<IconProps, "name">>
  multiline?: boolean
  rows?: number
  clearable?: boolean
  autoFocus?: boolean
  onSearchEnter?: (value: string, isEnter: boolean) => void
}

type InputWrapperStyleProps = {
  variant?: VariantFormType
  size?: SizeUiType
  isActive?: boolean
  error?: boolean
  disabled?: boolean
  readOnly?: boolean
  multiline?: boolean
}
/**
 * @module InputField
 * 다양한 입력 필드를 위한 커스텀 컴포넌트로, 텍스트, 패스워드, 검색, 멀티라인 입력 등을 지원합니다.
 * - 입력 필드에 라벨, 아이콘, 비밀번호 보이기/숨기기, 클리어 버튼, 검색 기능 등 다양한 추가 기능 제공
 * - `multiline` 옵션으로 텍스트 영역으로 변경 가능, `resizableMultiline`로 크기 조절 기능까지 제공
 * - 기본 텍스트 필드, 패스워드 필드, 검색 필드 등을 지원하며, `helperText`를 통한 에러 메시지 제공
 *
 * @props
 * - variant : 버튼 스타일 (outlined, filled, standard)
 * - size : 필드 크기 (기본값: "M")
 * - type : 입력 타입 (text, password, search 등)
 * - name : HTML input name
 * - label : 필드 라벨
 * - placeholder : 입력 필드에 placeholder 텍스트
 * - value : 입력 값
 * - autoFocus : 자동 포커스
 * - onlyNumber : 숫자만 허용 여부
 * - maxLength : 최대 입력 길이
 * - onChange : 입력 값 변경 핸들러
 * - onBlur : 필드 포커스 아웃 시 처리
 * - onFocus : 필드 포커스 시 처리
 * - onSearch : 검색 버튼 클릭 시 호출되는 핸들러
 * - onClear : 클리어 버튼 클릭 시 호출되는 핸들러
 * - onClick : 인풋 필드 자체 클릭 이벤트
 * - disabled : 입력 필드 비활성화 여부
 * - error : 에러 상태 표시 여부
 * - helperText : 에러 메시지 텍스트
 * - startIcon : 입력 필드 왼쪽에 배치할 아이콘
 * - endIcon : 입력 필드 오른쪽에 배치할 아이콘
 * - required : 필수 입력 여부
 * - readOnly : 읽기 전용 여부
 * - labelProps : 라벨 관련 추가 props
 * - iconProps : 아이콘 관련 추가 props
 * - rows : 멀티라인 텍스트 필드의 줄 수
 * - clearable: 값 제거 버튼 표시 여부
 * - labelPlacement : Label 컴포넌트 위치 변경
 *
 * @상세설명
 * - `type`에 따라 텍스트, 패스워드, 검색 등의 입력 필드 유형을 자동으로 처리합니다.
 * - `startIcon`과 `endIcon`을 사용하여 입력 필드의 왼쪽/오른쪽에 아이콘을 추가할 수 있습니다.
 * - 패스워드 입력 시 `isPasswordVisible`을 이용해 텍스트를 보이거나 숨길 수 있습니다.
 * - 클리어 버튼을 클릭하면 입력 값이 초기화됩니다.
 *
 * @사용법
 * <InputField
 *   label="이메일"
 *   placeholder="이메일을 입력하세요"
 *   value={email}
 *   onChange={handleChange}
 *   error={emailError}
 *   startIcon="Mail"
 *   endIcon="Check"
 *   helperText="유효한 이메일을 입력하세요."
 * />
 *
 */

const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, textFieldProps>(
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
      ...others
    },
    ref: Ref<HTMLInputElement | HTMLTextAreaElement | null>,
  ) => {
    const [inputValue, setInputValue] = useState(value ?? "")
    const [isActive, setIsActive] = useState(false)
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)

    const inputRef = useRef<HTMLInputElement | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // *  size에 따라 결정되는 함수
    const getSize = (size: SizeUiType): string => {
      switch (size) {
        case "S":
          return "9px"
        case "M":
          return "12px"
        case "L":
          return "16px"
        default:
          return "12px"
      }
    }

    // * forwardRef에 적절한 ref 노출
    useImperativeHandle(ref, () => (multiline ? textareaRef.current! : inputRef.current!), [
      multiline,
    ])

    // * input type password에 따른 설정
    const inputType = type === "password" && isPasswordVisible ? "text" : type

    // * 외부 value prop이 변경되면 내부 상태 동기화
    useEffect(() => {
      setInputValue(value ?? "")
    }, [value])

    // * 포커스 동작 설정
    useEffect(() => {
      if (!autoFocus || disabled || readOnly) return
      const el = multiline ? textareaRef.current : inputRef.current
      if (!el) return

      const id = requestAnimationFrame(() => {
        el.focus()
      })
      return () => cancelAnimationFrame(id)
    }, [autoFocus, disabled, readOnly, multiline])

    // * 입력 변경 시 상태 업데이트 및 콜백 호출 핸들러
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let newValue = e.target.value

      if (onlyNumber) {
        newValue = newValue.replace(/[^0-9]/g, "")
      }

      if (maxLength && newValue.length > maxLength) {
        newValue = newValue.slice(0, maxLength)
      }

      e.target.value = newValue
      setInputValue(newValue)
      onChange?.(e)
    }

    // * clear 버튼 클릭 시 값 초기화 핸들러
    const handleClear = () => {
      setInputValue("")
      onChange?.({
        target: { name, value: "" },
      } as ChangeEvent<HTMLInputElement>)
      onClear?.()
    }

    // * 검색 버튼 클릭 또는 Enter 시 검색 핸들러
    // * enter 인경우 isEnter(boolean) 값 전달
    const handleSearch = (isEnter?: boolean) => {
      if (onSearch) {
        const trimmedValue = inputValue.trim()
        const effectiveIsEnter = trimmedValue && isEnter

        if (effectiveIsEnter) {
          onSearch(trimmedValue, true)
        } else {
          onSearch(trimmedValue)
        }
      }
    }

    const handleSearchClick = () => {
      onSearch?.(inputValue, false) // 버튼 클릭은 항상 false
    }

    // * Enter 키 입력 시 검색 실행
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (type === "search" && e.key === "Enter") {
        e.preventDefault()
        handleSearch(true)
      }
      onKeyDown?.(e)
    }

    // * 포커스 시 active 상태로 변경 핸들러
    const handleFocus = () => {
      setIsActive(true)
      onFocus?.()
    }

    // * 블러 시 active 해제 및 콜백 호출 핸들러
    const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsActive(false)
      onBlur?.(event)
    }

    // * 라벨 위치 렌더링 함수
    const renderLabel = (position: "top" | "bottom") => {
      const isTop = labelPlacement?.startsWith("top")
      const isBottom = labelPlacement?.startsWith("bottom")
      const align = labelPlacement?.endsWith("start") ? "flex-start" : "flex-end"

      if (label && ((position === "top" && isTop) || (position === "bottom" && isBottom))) {
        return (
          <Flex align={align}>
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

      return null
    }

    return (
      <Box width="100%" sx={{ position: "relative", backgroundColor: "transparent" }} {...others}>
        {renderLabel("top")}
        <Flex width="100%" height="fit-content" align="center" justify="space-between">
          {label && labelPlacement === "left" && (
            <Label text={label} required={required} mr={4} {...labelProps} />
          )}
          <InputWrapper
            variant={variant}
            error={!!error}
            disabled={disabled}
            isActive={isActive}
            readOnly={readOnly}
            multiline={multiline}
            size={size}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
          >
            {startIcon && <Icon size={getSize(size)} name={startIcon} ml={8} {...iconProps} />}

            <StyledInput
              ref={inputRef}
              labelPlacement={labelPlacement}
              as={multiline ? "textarea" : "input"}
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
              multiline={multiline}
              rows={multiline ? rows : undefined}
            />

            {inputValue !== "" && !multiline && clearable && !readOnly && isActive && (
              <IconButton
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                icon="InputClose"
                size={getSize(size)}
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
                size={getSize(size)}
                mr={8}
                iconProps={{ color: theme.colors.grayscale[300] }}
                disabled={readOnly || disabled}
                sx={{ padding: 0, backgroundColor: "transparent" }}
              />
            )}

            {endIcon && <Icon size={getSize(size)} name={endIcon} mr={8} {...iconProps} />}

            {type === "password" && !multiline && (
              <IconButton
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                icon={isPasswordVisible ? "Eye" : "EyeOff"}
                size={getSize(size)}
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
        {renderLabel("bottom")}
        {error && <HelperText status="error" text={helperText ?? ""} mt={3} />}
      </Box>
    )
  },
)

const InputWrapper = styled.div<InputWrapperStyleProps>`
  display: flex;
  align-items: ${({ multiline }) => (multiline ? "flex-start" : "center")};
  width: 100%;
  height: auto;
  min-height: ${({ size }) => (size === "L" ? "32px" : size === "M" ? "28px" : "24px")};

  border-radius: ${({ theme, variant }) => (variant === "outlined" ? theme.borderRadius[4] : 0)};
  transition: all 0.2s ease-in-out;
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case "filled":
        return theme.colors.background.default
      case "standard":
        return "transparent"
      default:
        return theme.colors.grayscale.white
    }
  }};

  border: ${({ variant }) =>
    variant === "outlined" ? `1px solid  ${theme.colors.border.default}` : "0"};

  border-bottom: ${({ theme, variant }) =>
    variant === "standard"
      ? `1px solid ${theme.colors.border.default}`
      : `1px solid ${theme.colors.border.default}`};

  ${({ isActive, variant, theme, disabled, readOnly }) =>
    isActive &&
    !disabled &&
    !readOnly &&
    (variant === "standard"
      ? `
        border-bottom: 1px solid ${theme.colors.info[300]};
      `
      : `
        border-color: ${theme.colors.info[300]};
      `)}

  ${({ error, theme, variant }) =>
    error &&
    `
        ${
          variant === "standard"
            ? `border-bottom: 1px solid ${theme.colors.primary[300]};`
            : `border-color: ${theme.colors.error[300]};`
        }
      `}
  
    ${({ disabled, readOnly, variant, theme }) =>
    (disabled || readOnly) &&
    (variant === "outlined" || variant === "filled") &&
    `
        border-color: ${theme.colors.grayscale[200]};
        background-color: ${theme.colors.background.default};
        cursor: not-allowed;
        
      `}
`

const StyledInput = styled.input<{
  multiline?: boolean
  resizableMultiline?: boolean
  labelPlacement?: LabelPlacement
}>`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: ${theme.colors.text.secondary};
  width: 100%;
  font-size: 12px;
  resize: none;
  padding: 4px 8px;
  text-align: left;

  ${({ multiline, resizableMultiline }) =>
    multiline &&
    `
          font-family: inherit;
          ${resizableMultiline ? `width: 100%; height: 100%;` : ""}
        `}

  &::placeholder {
    font-size: 12px;
    color: ${theme.colors.text.disabled};
  }

  &:disabled {
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
  }

  ${({ readOnly }) =>
    readOnly &&
    `
          cursor: no-drop;
        `}
`

export default TextField

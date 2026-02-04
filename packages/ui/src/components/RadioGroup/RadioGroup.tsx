import { useId, useMemo } from "react"
import type { ChangeEvent } from "react"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import type { AxisPlacement, DirectionType, SizeUiType } from "../../types"
import Label from "../Label/Label"
import type { LabelProps } from "../Label/Label"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import HelperText from "../HelperText/HelperText"
import { styled } from "../../tokens/customStyled"

export type DataType<Value extends string | number> = {
  text: string
  value: Value
}

export type RadioGroupProps<Value extends string | number> = BaseMixinProps & {
  value?: Value
  onChange?: (value: Value) => void
  data: DataType<Value>[]
  direction?: DirectionType
  disabled?: boolean
  name?: string
  label?: string
  required?: boolean
  error?: boolean
  helperText?: string
  labelProps?: Partial<Omit<LabelProps, "text">>
  labelPlacement?: AxisPlacement
  size?: SizeUiType
}

type NormalizedAxis = "top" | "bottom" | "left" | "right"
type AlignCss = "flex-start" | "center" | "flex-end"

const normalizeAxisPlacement = (placement?: AxisPlacement): NormalizedAxis => {
  if (!placement) return "top"
  if (placement.startsWith("top")) return "top"
  if (placement.startsWith("bottom")) return "bottom"
  if (placement.startsWith("left")) return "left"
  if (placement.startsWith("right")) return "right"
  return "top"
}

const getPlacementAlign = (placement?: AxisPlacement): AlignCss => {
  if (!placement) return "flex-start"
  if (placement.endsWith("start")) return "flex-start"
  if (placement.endsWith("end")) return "flex-end"
  return "flex-start"
}

const getTextFontSize = (size: SizeUiType): string => {
  switch (size) {
    case "S":
      return "7px"
    case "M":
      return "10px"
    case "L":
      return "13px"
    default:
      return "10px"
  }
}

type RadioSizeTokens = {
  outer: number
  inner: number
}

const RADIO_SIZE_TOKENS: Record<SizeUiType, RadioSizeTokens> = {
  S: { outer: 14, inner: 4 },
  M: { outer: 16, inner: 6 },
  L: { outer: 20, inner: 9 },
}
/**---------------------------------------------------------------------------/
 *
 * ! RadioGroup
 *
 * * 라디오 버튼 선택지를 `data` 기반으로 렌더링하는 그룹 컴포넌트입니다.
 * * `value`(controlledValue)를 외부에서 받아 선택 상태를 결정하며, 변경 시 `onChange`로 값만 전달합니다.
 * * `direction`에 따라 가로/세로 레이아웃을 전환하고, `size`에 따라 라디오 크기 및 텍스트 폰트 크기를 조정합니다.
 * * `disabled`, `error` 상태에 따라 입력 차단/스타일(테두리·배경) 및 helperText 노출을 제어합니다.
 *
 * * 동작 규칙
 *   * 선택 변경:
 *     * input change 이벤트에서 `event.target.value`를 Value로 캐스팅하여 `onChange?.(selectedValue)`로 전달합니다.
 *     * 선택 여부는 `controlledValue === item.value`로 결정합니다.
 *   * disabled:
 *     * input 자체 disabled로 변경 이벤트가 차단되며, 커서/색상 스타일이 비활성 상태로 렌더링됩니다.
 *   * error:
 *     * 라디오 border 색상이 error 톤으로 변경되며, 하단에 HelperText(status="error")가 렌더링됩니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * 방향:
 *     * `direction === "horizontal"`이면 row + 각 항목 간 mr(12), vertical이면 column + mb(12)로 간격을 둡니다.
 *   * 라벨 배치:
 *     * `labelPlacement`가 top/bottom일 때 `renderLabel("top"|"bottom")`로 상/하단에 Label을 렌더링합니다.
 *     * `labelPlacement`가 left/right일 때 그룹 내부 좌/우에 Label을 렌더링합니다.
 *   * size:
 *     * `getSizeStyle(size)`로 라디오 외곽 크기 및 `::after`(내부 점) 크기를 결정합니다.
 *     * 텍스트는 `getFontSize(size)`로 fontSize만 보정하여 Typography에 적용합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `data`: { text, value } 배열(필수)로 선택지 목록을 구성합니다.
 *     * `value`: 현재 선택 값(선택 상태 결정용, controlled)
 *     * `onChange`: 선택 시 value만 콜백으로 전달합니다.
 *     * `name`: 동일 name으로 브라우저 라디오 그룹 동작을 보장합니다.
 *   * 내부 계산:
 *     * `isHorizontal`로 방향 분기, `isChecked`로 체크 상태 계산, labelPlacement 문자열 prefix/suffix로 정렬/노출 위치를 계산합니다.
 *   * 서버/클라이언트 제어:
 *     * 선택 상태는 외부 `value`로 제어되는 controlled 패턴이며, 내부에 선택 상태를 저장하지 않습니다.
 *
 * @module RadioGroup
 * data 기반 라디오 그룹을 제공하며, 레이아웃(direction)과 라벨 배치(labelPlacement), 상태(disabled/error)를 지원합니다.
 *
 * @usage
 * <RadioGroup
 *   value={value}
 *   onChange={setValue}
 *   data={[{ text: "A", value: "A" }, { text: "B", value: "B" }]}
 *   direction="horizontal"
 *   label="라벨"
 *   labelPlacement="top"
 * />
 *
/---------------------------------------------------------------------------**/

const RadioGroup = <Value extends string | number>({
  value: controlledValue,
  onChange,
  data,
  direction = "horizontal",
  disabled = false,
  name,
  label,
  required,
  error = false,
  helperText,
  labelProps,
  labelPlacement = "top",
  size = "M",
  ...others
}: RadioGroupProps<Value>) => {
  const reactId = useId()
  const groupName = name ?? `radio-group-${reactId}`
  const helperTextId = `radio-group-helper-${reactId}`

  const axis = useMemo(() => normalizeAxisPlacement(labelPlacement), [labelPlacement])
  const labelAlign = useMemo(() => getPlacementAlign(labelPlacement), [labelPlacement])

  const isHorizontal = direction === "horizontal"
  const fontSize = getTextFontSize(size)
  const sizeTokens = RADIO_SIZE_TOKENS[size]

  // * 라디오 선택 시 value 매핑(문자열/숫자 안전)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    const found = data.find((d) => String(d.value) === raw)
    if (!found) return
    onChange?.(found.value)
  }

  const renderTopLabel = () => {
    if (!label) return null
    if (axis !== "top") return null
    return (
      <Flex align={labelAlign}>
        <Label text={label} required={required} mb={4} {...labelProps} />
      </Flex>
    )
  }

  const renderBottomLabel = () => {
    if (!label) return null
    if (axis !== "bottom") return null
    return (
      <Flex align={labelAlign}>
        <Label text={label} required={required} mt={4} {...labelProps} />
      </Flex>
    )
  }

  const renderLeftLabel = () => {
    if (!label) return null
    if (axis !== "left") return null
    return <Label text={label} required={required} mr={4} {...labelProps} />
  }

  const renderRightLabel = () => {
    if (!label) return null
    if (axis !== "right") return null
    return <Label text={label} required={required} ml={4} {...labelProps} />
  }

  const describedBy = error && helperText ? helperTextId : undefined

  return (
    <Box width="100%" sx={{ position: "relative", backgroundColor: "transparent" }} {...others}>
      {renderTopLabel()}

      <Flex
        width="fit-content"
        align="center"
        direction={isHorizontal ? "row" : "column"}
        wrap="wrap"
        role="radiogroup"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        {renderLeftLabel()}

        {data.map((item, index) => {
          const checked = controlledValue === item.value
          const itemId = `radio-${groupName}-${index}`

          return (
            <Flex
              key={String(item.value)}
              gap="4px"
              mr={isHorizontal ? 12 : 0}
              mb={isHorizontal ? 0 : 12}
              height={others.height}
              align="center"
            >
              <StyledRadio
                id={itemId}
                $sizeTokens={sizeTokens}
                type="radio"
                name={groupName}
                value={String(item.value)}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                $error={error}
              />
              <label htmlFor={itemId}>
                <Typography
                  text={item.text}
                  variant="b2Regular"
                  color={disabled ? "text.disabled" : "text.secondary"}
                  sx={{ fontSize }}
                />
              </label>
            </Flex>
          )
        })}

        {renderRightLabel()}
      </Flex>

      {renderBottomLabel()}

      {error && helperText && (
        <Box id={helperTextId}>
          <HelperText status="error" text={helperText} mt={6} />
        </Box>
      )}
    </Box>
  )
}

const StyledRadio = styled.input<{
  $sizeTokens: RadioSizeTokens
  $error?: boolean
}>`
  margin: 0;
  appearance: none;
  border: 1px solid
    ${({ theme, $error }) => ($error ? theme.colors.error[300] : theme.colors.border.thick)};
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;

  width: ${({ $sizeTokens }) => `${$sizeTokens.outer}px`};
  height: ${({ $sizeTokens }) => `${$sizeTokens.outer}px`};

  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.background.default : theme.colors.grayscale.white};

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${({ $sizeTokens }) => `${$sizeTokens.inner}px`};
    height: ${({ $sizeTokens }) => `${$sizeTokens.inner}px`};
    background-color: ${({ theme }) => theme.colors.grayscale.white};
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.2s ease;
  }

  &:checked {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[400]};
    background-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[400]};
  }

  &:checked::after {
    transform: translate(-50%, -50%) scale(1);
  }

  &:hover {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.border.thick : theme.colors.primary[200]};
  }

  &:checked:hover {
    border-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[300]};
    background-color: ${({ theme, disabled }) =>
      disabled ? theme.colors.primary[200] : theme.colors.primary[300]};
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:disabled:hover {
    border-color: ${({ theme, $error }) =>
      $error ? theme.colors.error[300] : theme.colors.border.thick};
  }

  &:disabled:checked:hover {
    border-color: ${({ theme }) => theme.colors.primary[200]};
    background-color: ${({ theme }) => theme.colors.primary[200]};
  }
`

export default RadioGroup

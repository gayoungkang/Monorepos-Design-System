import { HTMLAttributes, ReactNode, useMemo } from "react"
import { BaseMixin, BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import { Typography, TypographyProps } from "../Typography/Typography"
import { DirectionType } from "../../types"
import Divider from "../Divider/Divider"
import Icon from "../Icon/Icon"
import { IconName } from "../Icon/icon-loader"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"

export type StepperOptionType<Value extends string | number = string> = {
  children?: string | ReactNode | IconName
  value: Value
  hidden?: boolean
  disabled?: boolean
  completed?: boolean
  error?: boolean
  label?: ReactNode
  onClick?: () => void
}

export type StepperProps<Value extends string | number = string> = BaseMixinProps &
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps> & {
    options: StepperOptionType<Value>[]
    value: Value | null
    orientation?: DirectionType
    linear?: boolean
    connector?: ReactNode
    onSelect?: (value: Value, index: number) => void
    TypographyProps?: Partial<TypographyProps>
  }

// * children이 IconName 타입인지 여부를 판별
const isIconName = (v: unknown): v is IconName => typeof v === "string"

/**---------------------------------------------------------------------------/

* ! Stepper
*
* * 단계(step) 흐름을 시각적으로 표현하는 Stepper 컴포넌트
* * horizontal / vertical 방향 레이아웃 지원
* * linear / non-linear 흐름 제어 지원
* * 현재 값(value)을 기준으로 active / completed / disabled / error 상태 계산
* * hidden 옵션을 제외한 step만 렌더링
* * step 클릭 시 onSelect 또는 option.onClick 콜백 호출
* * 완료(completed) 상태 시 체크 아이콘 렌더링
* * children 값에 따라 아이콘 / 커스텀 아이콘 / step 번호 자동 판별
* * 커넥터(connector) 커스터마이징 또는 기본 Divider 렌더링 지원
* * BaseMixin 기반 외부 스타일 확장 지원
* * theme 기반 색상, z-index, 타이포그래피 시스템 활용
*
* @module Stepper
* 다단계 진행 상태를 표현하기 위한 Stepper 컴포넌트입니다.
* - `options`를 기반으로 step 목록을 구성하며 hidden 옵션은 렌더링에서 제외
* - `value`를 기준으로 현재 활성 step 및 완료 상태를 자동 계산
* - `linear`가 true인 경우 이전 step까지만 선택 가능
* - `non-linear` 흐름에서는 자유로운 step 선택 가능
* - `connector`를 통해 단계 간 연결 UI를 커스터마이징 가능
* - label은 문자열 또는 ReactNode 모두 지원
*
* @usage
* <Stepper options={options} value={value} onSelect={setValue} />
* <Stepper options={options} value={value} orientation="vertical" linear={false} />

/---------------------------------------------------------------------------**/

const Stepper = <Value extends string | number = string>({
  options,
  value,
  orientation = "horizontal",
  linear = true,
  connector,
  onSelect,
  TypographyProps: typographyProps,
  ...baseProps
}: StepperProps<Value>) => {
  // * hidden 옵션을 제외한 표시 대상 step 목록
  const visibleOptions = useMemo(() => options.filter((o) => !o.hidden), [options])

  // * 현재 value 기준 활성 step index 계산 (없으면 -1)
  const activeIndex = useMemo(() => {
    if (value === null) return -1
    return visibleOptions.findIndex((o) => o.value === value)
  }, [value, visibleOptions])

  // * 현재 step 상태를 옵션/activeIndex 기준으로 계산
  const getStepState = (idx: number, option: StepperOptionType<Value>) => {
    const active = idx === activeIndex
    const completed =
      typeof option.completed === "boolean"
        ? option.completed
        : activeIndex >= 0
          ? idx < activeIndex
          : false
    const disabled = !!option.disabled
    const error = !!option.error
    return { active, completed, disabled, error }
  }

  // * 클릭 이벤트는 linear 여부에 따라 제어
  const handleSelect = (idx: number, option: StepperOptionType<Value>) => {
    if (!onSelect && !option.onClick) return

    const { disabled } = getStepState(idx, option)
    if (disabled) return

    if (linear && idx > activeIndex && activeIndex >= 0) return

    option.onClick?.()
    onSelect?.(option.value, idx)
  }

  // * 아이콘 영역: completed면 체크, children이 IconName이면 아이콘, 없으면 빈 박스, 그 외는 step 번호
  const renderIconContent = (
    idx: number,
    children: StepperOptionType<Value>["children"],
    completed?: boolean,
  ) => {
    if (completed) return <Icon name="CheckLine" size={12} />
    if (children === null || children === undefined) return <Box />
    if (typeof children === "string" && isIconName(children))
      return <Icon name={children} size={14} />
    return idx + 1
  }

  // * 커넥터 렌더링 (connector 우선, 없으면 Divider)
  const renderConnector = () => {
    if (connector) return connector
    return <Divider direction={orientation} sx={{ zIndex: theme.zIndex.base }} />
  }

  return (
    <Flex
      direction={orientation === "vertical" ? "column" : "row"}
      justify="center"
      align="center"
      width={"100%"}
      {...baseProps}
    >
      {visibleOptions.map((option, idx) => {
        const { active, completed, disabled, error } = getStepState(idx, option)

        // * linear=false일 때만 임의 step 선택 허용 (disabled는 별도 차단)
        const clickable =
          !!(onSelect || option.onClick) && (!linear || idx <= activeIndex || activeIndex < 0)

        return (
          <StepRoot
            key={`step-${String(option.value)}-${idx}`}
            $orientation={orientation}
            $linear={linear}
            $clickable={clickable}
            $disabled={disabled}
            onClick={clickable ? () => handleSelect(idx, option) : undefined}
          >
            {idx !== 0 ? (
              <ConnectorWrap $orientation={orientation} $linear={linear}>
                {renderConnector()}
              </ConnectorWrap>
            ) : null}

            <StepLabelRoot $orientation={orientation} $linear={linear}>
              <Flex direction="column" align={"center"} gap={6}>
                <DefaultIconRoot $active={active} $completed={completed} $error={error}>
                  {renderIconContent(idx, option.children, completed)}
                </DefaultIconRoot>

                {option.label ? (
                  typeof option.label === "string" ? (
                    <Typography
                      variant="b3Regular"
                      color={theme.colors.text.primary}
                      text={option.label}
                      ellipsis
                      sx={{
                        fontSize: "10px",
                        position: "relative",
                        zIndex: theme.zIndex.content,
                        display: "inline-block",
                        lineHeight: "11px",
                        backgroundColor: "inherit",
                        maxWidth: "120px",
                      }}
                      {...typographyProps}
                    />
                  ) : (
                    option.label
                  )
                ) : null}
              </Flex>
            </StepLabelRoot>
          </StepRoot>
        )
      })}
    </Flex>
  )
}

const StepRoot = styled.div<
  BaseMixinProps & {
    $orientation: DirectionType
    $linear: boolean
    $clickable: boolean
    $disabled: boolean
  }
>`
  ${BaseMixin}
  display: flex;
  position: relative;

  ${({ $orientation }) =>
    $orientation === "vertical" ? "flex-direction: row;" : "flex-direction: column;"}

  ${({ $orientation }) =>
    $orientation === "horizontal"
      ? `
          align-items: center;
          flex: 1 1 0%;
        `
      : `
          align-items: center;
          padding-left: 16px;
        `}

  ${({ $orientation, $linear }) =>
    $orientation === "vertical" && $linear
      ? `
          padding-bottom: 20px;
        `
      : ""}

  &:last-child {
    padding-bottom: 0;
  }

  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  ${({ $clickable, $disabled }) =>
    $clickable && !$disabled
      ? `
          cursor: pointer;
          user-select: none;
        `
      : ""}
`

const StepLabelRoot = styled.div<
  BaseMixinProps & {
    $orientation: DirectionType
    $linear: boolean
  }
>`
  ${BaseMixin}
  display: flex;
  gap: 12px;

  ${({ $orientation }) =>
    $orientation === "vertical"
      ? `
          align-items: baseline;
          flex-direction: row;
        `
      : `
          align-items: center;
          flex-direction: column;
        `}

  ${({ $orientation }) =>
    $orientation === "horizontal"
      ? `
          align-items: center;
          flex-direction: column;
          text-align: center;
        `
      : ""}
`

const DefaultIconRoot = styled.div<{
  $active: boolean
  $completed: boolean
  $error: boolean
}>`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;

  border: 2px solid
    ${({ $error, $active, $completed }) => {
      if ($error) return theme.colors.error[500]
      if ($completed) return theme.colors.primary[400]
      if ($active) return theme.colors.primary[400]
      return theme.colors.border.default
    }};

  background: ${({ $completed }) =>
    $completed ? theme.colors.primary[400] : theme.colors.grayscale.white};

  color: ${({ $completed, $error, $active }) => {
    if ($completed) return theme.colors.background.default
    if ($error) return theme.colors.error[500]
    if ($active) return theme.colors.primary[400]
    return theme.colors.text.primary
  }};
`

const ConnectorWrap = styled.div<{
  $orientation: DirectionType
  $linear: boolean
}>`
  position: absolute;
  z-index: ${({ theme }) => theme.zIndex.content};
  pointer-events: none;

  ${({ $orientation }) =>
    $orientation === "horizontal"
      ? `
          top: 12px;
          left: calc(-50% + 12px);
          right: calc(50% + 12px);
          height: 1px;
        `
      : `
          left: 28px;
          top: 28px;
          bottom: 0;
          width: 1px;
          height: auto;
        `}

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $orientation }) =>
    $orientation === "vertical"
      ? `
          & > * {
            height: 100%;
            align-self: stretch;
          }
        `
      : ""}
`

Stepper.displayName = "Stepper"
export default Stepper

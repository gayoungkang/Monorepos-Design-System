import { useCallback, useMemo } from "react"
import type { HTMLAttributes, ReactNode } from "react"
import { BaseMixin } from "../../tokens/baseMixin"
import type { BaseMixinProps } from "../../tokens/baseMixin"
import { styled } from "../../tokens/customStyled"
import { theme } from "../../tokens/theme"
import { Typography } from "../Typography/Typography"
import type { TypographyProps } from "../Typography/Typography"
import Divider from "../Divider/Divider"
import Icon from "../Icon/Icon"
import Flex from "../Flex/Flex"
import type { IconName } from "../Icon/icon-types"
import type { DirectionType } from "../../types/layout"

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
  Omit<HTMLAttributes<HTMLDivElement>, keyof BaseMixinProps | "onSelect"> & {
    options: StepperOptionType<Value>[]
    value: Value | null
    orientation?: DirectionType
    linear?: boolean
    connector?: ReactNode
    onSelect?: (value: Value, index: number) => void
    TypographyProps?: Partial<TypographyProps>

    circleSize?: number | string
    iconSize?: number | string
    completedIconSize?: number | string
    stepIconSize?: number | string
  }

// * children이 IconName 타입인지 여부를 판별(프로젝트 정책: string이면 아이콘으로 처리)
const isIconName = (v: unknown): v is IconName => typeof v === "string"
/**---------------------------------------------------------------------------/
 *
 * ! Stepper
 *
 * * 단계(steps) 흐름을 시각화하고 선택(선택 가능 시)을 제공하는 Stepper 컴포넌트입니다.
 * * `options` 목록을 기반으로 step을 렌더링하며, `hidden` 옵션은 렌더 대상에서 제외됩니다.
 * * `value`로 현재 활성(step)을 결정하고, `linear` 규칙에 따라 미래 step(아직 도달하지 않은 step) 선택을 제한합니다.
 * * 각 step은 active/completed/disabled/error 상태를 내부 계산 규칙으로 결정하며, 아이콘/번호/커스텀 노드 표시를 지원합니다.
 * * 커넥터는 `connector` prop이 우선이며, 없으면 Divider를 orientation 방향에 맞게 사용합니다.
 * * 아이콘 크기 관련 값은 circleSize를 기준으로 기본값을 계산하고, 외부에서 전달된 값이 있으면 이를 우선합니다(상위 계산 규칙 준수).
 *
 * * 동작 규칙
 *   * 표시 대상:
 *     * `visibleOptions = options.filter(o => !o.hidden)`로 hidden step은 제외합니다.
 *   * 활성 step 계산:
 *     * `activeIndex`는 `value`가 null이면 -1, 아니면 visibleOptions에서 value 매칭 index입니다.
 *   * 상태 계산(getStepState):
 *     * `active = idx === activeIndex`
 *     * `completed`:
 *       * option.completed가 boolean이면 그 값을 우선 사용
 *       * 아니면 `activeIndex >= 0`일 때 `idx < activeIndex`면 completed로 처리
 *     * `disabled = !!option.disabled`, `error = !!option.error`
 *   * 선택 처리(handleSelect):
 *     * onSelect/option.onClick 둘 다 없으면 선택 로직을 수행하지 않습니다.
 *     * disabled면 선택을 차단합니다.
 *     * `linear === true`이고 `activeIndex >= 0`일 때, `idx > activeIndex`(미래 step)는 선택을 차단합니다.
 *     * 허용되는 경우 `option.onClick()` 후 `onSelect(option.value, idx)`를 호출합니다.
 *   * 클릭 가능 여부(clickable):
 *     * `(onSelect || option.onClick)`이 존재하고,
 *       `!linear || idx <= activeIndex || activeIndex < 0` 조건을 만족하면 clickable로 처리합니다.
 *     * clickable && !disabled일 때만 onClick을 부여하고 cursor/user-select을 활성화합니다.
 *   * 아이콘 콘텐츠(renderIconContent):
 *     * completed면 CheckLine 아이콘을 표시합니다.
 *     * children이 없으면 step 번호(idx + 1)를 표시합니다.
 *     * children이 string이면 IconName으로 간주하여 아이콘으로 렌더링합니다.
 *     * 그 외 ReactNode는 그대로 렌더링합니다.
 *
 * * 레이아웃/스타일 관련 규칙
 *   * orientation:
 *     * 루트는 orientation에 따라 Flex direction을 column/row로 전환합니다.
 *     * StepRoot는 horizontal이면 column(아이콘+라벨), vertical이면 row(커넥터+아이콘) 형태로 구성됩니다.
 *   * 커넥터(ConnectorWrap):
 *     * idx !== 0일 때만 이전 step과의 연결을 렌더링합니다.
 *     * horizontal: 가운데 라인을 좌우로 확장(left/right calc)하여 연결선을 표현합니다.
 *     * vertical: 좌측 고정 x 위치(left: 28px)에서 위(28px)부터 아래까지 세로 라인을 표현합니다.
 *     * pointer-events: none으로 커넥터가 클릭을 가로채지 않도록 합니다.
 *   * 아이콘 원형(DefaultIconRoot):
 *     * circleSize를 width/height로 사용하며, 상태에 따라 border/background/color가 변경됩니다.
 *       * error: error[500] 우선
 *       * completed/active: primary[400]
 *       * 기본: border.default
 *     * completed일 때는 배경 primary[400] + 텍스트(아이콘) 색상을 background.default로 반전합니다.
 *   * 라벨:
 *     * option.label이 string이면 Typography로 렌더링하며 ellipsis 및 maxWidth 등을 적용합니다.
 *     * option.label이 ReactNode면 그대로 렌더링합니다.
 *   * disabled 시각 처리:
 *     * StepRoot에 opacity 0.5를 적용하여 비활성 상태를 표시합니다.
 *
 * * 데이터 처리 규칙
 *   * 입력 props 계약:
 *     * `options`: 각 step 정의(value, label/children, hidden/disabled/completed/error, onClick)
 *     * `value`: 현재 활성 step value (null 가능)
 *     * `orientation`: "horizontal" | "vertical"
 *     * `linear`: true면 순차 진행만 허용(미래 step 선택 제한)
 *     * `connector`: 커넥터 커스텀 노드(우선 적용)
 *     * `onSelect`: step 선택 콜백(value, index)
 *     * `TypographyProps`: label이 string일 때 Typography에 전달되는 추가 props
 *     * `circleSize/iconSize/completedIconSize/stepIconSize`: 아이콘/원형 크기(기본은 circleSize 기반 계산)
 *   * 내부 계산:
 *     * visibleOptions/activeIndex 기반으로 completed 자동 계산을 수행합니다(명시 completed가 없을 때만).
 *     * 아이콘 크기 기본값은 circleSize를 수치로 환산한 비율로 산출합니다.
 *   * 서버/클라이언트 제어:
 *     * 활성 step은 외부 `value`가 단일 소스이며, 내부에서는 파생 상태(activeIndex/completed 등)만 계산합니다.
 *
 * @module Stepper
 * 단계 흐름 UI를 제공하며, orientation/linear 규칙, 상태(active/completed/disabled/error) 표시 및 선택 이벤트(onSelect)를 지원합니다.
 *
 * @usage
 * <Stepper
 *   options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
 *   value={"a"}
 *   orientation="horizontal"
 *   linear
 *   onSelect={(v) => setValue(v)}
 * />
 *
/---------------------------------------------------------------------------**/

const Stepper = <Value extends string | number = string>({
  options,
  value,
  orientation = "horizontal",
  linear = true,
  connector,
  onSelect,
  TypographyProps: typographyProps,
  circleSize = 24,
  iconSize,
  completedIconSize,
  stepIconSize,
  ...baseProps
}: StepperProps<Value>) => {
  // * hidden 옵션을 제외한 표시 대상 step 목록
  const visibleOptions = useMemo(() => options.filter((o) => !o.hidden), [options])

  // * 현재 value 기준 활성 step index 계산 (없으면 -1)
  const activeIndex = useMemo(() => {
    if (value === null) return -1
    return visibleOptions.findIndex((o) => o.value === value)
  }, [value, visibleOptions])

  const resolvedSizes = useMemo(() => {
    const cs = circleSize
    const toNumber = (v: number | string) => (typeof v === "number" ? v : Number(v))
    const csNum = typeof cs === "number" ? cs : toNumber(cs)

    const defaultCompletedIcon = Number.isFinite(csNum) ? Math.max(10, Math.round(csNum * 0.5)) : 12
    const defaultStepIcon = Number.isFinite(csNum) ? Math.max(10, Math.round(csNum * 0.58)) : 14

    return {
      circleSize: cs,
      completedIconSize: completedIconSize ?? defaultCompletedIcon,
      stepIconSize: stepIconSize ?? iconSize ?? defaultStepIcon,
    }
  }, [circleSize, completedIconSize, iconSize, stepIconSize])

  // * 현재 step 상태를 옵션/activeIndex 기준으로 계산
  const getStepState = useCallback(
    (idx: number, option: StepperOptionType<Value>) => {
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
    },
    [activeIndex],
  )

  // * 클릭 이벤트는 linear 여부에 따라 제어
  const handleSelect = useCallback(
    (idx: number, option: StepperOptionType<Value>) => {
      if (!onSelect && !option.onClick) return

      const { disabled } = getStepState(idx, option)
      if (disabled) return

      if (linear && idx > activeIndex && activeIndex >= 0) return

      option.onClick?.()
      onSelect?.(option.value, idx)
    },
    [activeIndex, getStepState, linear, onSelect],
  )

  // * 아이콘 영역: completed면 체크, children이 string이면 아이콘, ReactNode면 그대로, 없으면 step 번호
  const renderIconContent = useCallback(
    (idx: number, children: StepperOptionType<Value>["children"], completed?: boolean) => {
      if (completed) return <Icon name="CheckLine" size={resolvedSizes.completedIconSize} />
      if (children === null || children === undefined) return idx + 1
      if (typeof children === "string" && isIconName(children))
        return <Icon name={children} size={resolvedSizes.stepIconSize} />
      return children
    },
    [resolvedSizes.completedIconSize, resolvedSizes.stepIconSize],
  )

  // * 커넥터 렌더링 (connector 우선, 없으면 Divider)
  const renderConnector = useCallback(() => {
    if (connector) return connector
    return <Divider direction={orientation} sx={{ zIndex: theme.zIndex.base }} />
  }, [connector, orientation])

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
                <DefaultIconRoot
                  $size={resolvedSizes.circleSize}
                  $active={active}
                  $completed={completed}
                  $error={error}
                >
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
  $size: number | string
  $active: boolean
  $completed: boolean
  $error: boolean
}>`
  width: ${({ $size }) => (typeof $size === "number" ? `${$size}px` : $size)};
  height: ${({ $size }) => (typeof $size === "number" ? `${$size}px` : $size)};
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

import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import Stepper, { StepperOptionType, StepperProps } from "./Stepper"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Button from "../Button/Button"
import Divider from "../Divider/Divider"
import { DirectionType } from "../../types"

type ValueType = string

const StepperString = (props: StepperProps<ValueType>) => <Stepper<ValueType> {...props} />

const meta: Meta<typeof StepperString> = {
  title: "Components/Stepper",
  component: StepperString,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    options: { control: false },
    value: { control: false },
    orientation: { control: { type: "radio" }, options: ["horizontal", "vertical"] },
    linear: { control: { type: "boolean" } },
    connector: { control: false },
    onSelect: { control: false },
    TypographyProps: { control: false },
    circleSize: { control: { type: "text" } },
    iconSize: { control: { type: "text" } },
    completedIconSize: { control: { type: "text" } },
    stepIconSize: { control: { type: "text" } },
  },
  args: {
    orientation: "horizontal",
    linear: true,
    circleSize: 24,
    iconSize: 14,
    completedIconSize: 12,
    stepIconSize: 14,
  },
}

export default meta
type Story = StoryObj<typeof StepperString>

const buildOptions = (
  overrides?: Partial<StepperOptionType<ValueType>>[],
): StepperOptionType<ValueType>[] => {
  const base: StepperOptionType<ValueType>[] = [
    { value: "step-1", label: "Step 1", children: "CheckLine" },
    { value: "step-2", label: "Step 2", children: "CloseLine" },
    { value: "step-3", label: "Step 3" },
    { value: "step-4", label: "Step 4" },
  ]

  if (!overrides) return base
  return base.map((o, i) => ({ ...o, ...(overrides[i] ?? {}) }))
}

const Controlled = (args: StepperProps<ValueType>) => {
  const [orientation, setOrientation] = useState<DirectionType>(
    (args.orientation ?? "horizontal") as DirectionType,
  )
  const [linear, setLinear] = useState<boolean>(args.linear ?? true)
  const [value, setValue] = useState<ValueType | null>("step-1")
  const [useCustomConnector, setUseCustomConnector] = useState(false)

  const options = useMemo(() => buildOptions(), [])

  const connector = useMemo(() => {
    if (!useCustomConnector) return undefined
    return (
      <Divider
        direction={orientation}
        sx={{
          zIndex: 1,
          opacity: 0.6,
        }}
      />
    )
  }, [orientation, useCustomConnector])

  return (
    <Flex direction="column" gap="12px" width="760px">
      <Flex justify="space-between" align="center">
        <Typography text="Stepper Playground" variant="h3" />
        <Flex gap="8px">
          <Button
            text={orientation === "horizontal" ? "Horizontal" : "Vertical"}
            variant="outlined"
            onClick={() => setOrientation((p) => (p === "horizontal" ? "vertical" : "horizontal"))}
          />
          <Button
            text={linear ? "Linear: ON" : "Linear: OFF"}
            variant="outlined"
            onClick={() => setLinear((p) => !p)}
          />
          <Button
            text={useCustomConnector ? "Connector: Custom" : "Connector: Default"}
            variant="outlined"
            onClick={() => setUseCustomConnector((p) => !p)}
          />
          <Button text="Reset" onClick={() => setValue("step-1")} />
        </Flex>
      </Flex>

      <Box sx={{ padding: "12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
        <Typography
          variant="b2Regular"
          text={`value: ${value ?? "null"} / orientation: ${orientation} / linear: ${String(linear)}`}
        />
      </Box>

      <StepperString
        {...args}
        options={options}
        value={value}
        orientation={orientation}
        linear={linear}
        connector={connector}
        onSelect={(v, idx) => {
          setValue(v)
        }}
      />
    </Flex>
  )
}

export const Playground: Story = {
  render: (args) => <Controlled {...(args as StepperProps<ValueType>)} />,
}

export const Variants: Story = {
  render: (args) => {
    const [valueA, setValueA] = useState<ValueType | null>("step-2")
    const [valueB, setValueB] = useState<ValueType | null>("step-1")

    const optionsDefault = useMemo(() => buildOptions(), [])
    const optionsStates = useMemo(
      () =>
        buildOptions([
          { completed: true, label: "Completed" },
          { error: true, label: "Error" },
          { disabled: true, label: "Disabled" },
          { hidden: false, label: "Normal" },
        ]),
      [],
    )

    const optionsWithHidden = useMemo(
      () =>
        buildOptions([
          { label: "Visible" },
          { hidden: true, label: "Hidden" },
          { label: "Visible" },
          { label: "Visible" },
        ]),
      [],
    )

    return (
      <Flex direction="column" gap="18px" width="980px">
        <Typography text="Horizontal / Linear" variant="h3" />
        <StepperString
          {...args}
          options={optionsDefault}
          value={valueA}
          orientation="horizontal"
          linear
          onSelect={(v) => setValueA(v)}
        />

        <Typography text="Horizontal / Non-Linear (free select)" variant="h3" />
        <StepperString
          {...args}
          options={optionsDefault}
          value={valueA}
          orientation="horizontal"
          linear={false}
          onSelect={(v) => setValueA(v)}
        />

        <Typography text="Vertical / Linear" variant="h3" />
        <StepperString
          {...args}
          options={optionsDefault}
          value={valueB}
          orientation="vertical"
          linear
          onSelect={(v) => setValueB(v)}
        />

        <Typography text="States (completed / error / disabled)" variant="h3" />
        <StepperString
          {...args}
          options={optionsStates}
          value={valueA}
          orientation="horizontal"
          linear={false}
          onSelect={(v) => setValueA(v)}
        />

        <Typography text="Hidden steps" variant="h3" />
        <StepperString
          {...args}
          options={optionsWithHidden}
          value={valueA}
          orientation="horizontal"
          linear={false}
          onSelect={(v) => setValueA(v)}
        />

        <Typography text="Custom connector" variant="h3" />
        <StepperString
          {...args}
          options={optionsDefault}
          value={valueA}
          orientation="horizontal"
          linear={false}
          connector={<Divider direction="horizontal" sx={{ opacity: 0.3 }} />}
          onSelect={(v) => setValueA(v)}
        />
      </Flex>
    )
  },
}

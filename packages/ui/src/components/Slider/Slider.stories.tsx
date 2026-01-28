import type { Meta, StoryObj } from "@storybook/react"
import { useEffect, useMemo, useState } from "react"
import Slider, { SliderProps, SliderValue } from "./Slider"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Button from "../Button/Button"

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    value: { control: false },
    onChange: { action: "onChange" },
    onChangeEnd: { action: "onChangeEnd" },
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
    step: { control: { type: "number" } },
    disabled: { control: { type: "boolean" } },
    track: { control: { type: "radio" }, options: ["normal", "inset", "none"] },
    label: { control: { type: "text" } },
    labelProps: { control: false },
    startIcon: { control: { type: "text" } },
    endIcon: { control: { type: "text" } },
    iconSize: { control: { type: "text" } },
  },
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    track: "normal",
    label: "Slider",
    startIcon: "",
    endIcon: "",
    iconSize: 16,
  },
}

export default meta
type Story = StoryObj<typeof Slider>

const isRangeValue = (v: SliderValue): v is [number, number] => Array.isArray(v)

const Controlled = (args: SliderProps) => {
  const [mode, setMode] = useState<"single" | "range">(
    isRangeValue(args.value) ? "range" : "single",
  )

  const initial = useMemo<SliderValue>(() => {
    if (mode === "range")
      return isRangeValue(args.value) ? args.value : ([20, 80] as [number, number])
    return isRangeValue(args.value) ? args.value[0] : (args.value as number)
  }, [args.value, mode])

  const [val, setVal] = useState<SliderValue>(initial)

  useEffect(() => {
    setVal(initial)
  }, [initial])

  const setSingle = () => {
    setMode("single")
    setVal((prev) => (isRangeValue(prev) ? prev[0] : prev))
  }

  const setRange = () => {
    setMode("range")
    setVal((prev) => (isRangeValue(prev) ? prev : ([20, 80] as [number, number])))
  }

  return (
    <Flex direction="column" gap="12px" width="520px">
      <Flex align="center" justify="space-between">
        <Typography text="Mode" variant="b2Regular" />
        <Flex gap="8px">
          <Button text="Single" onClick={setSingle} />
          <Button variant="outlined" text="Range" onClick={setRange} />
        </Flex>
      </Flex>

      <Flex direction="column" gap="8px">
        <Slider
          {...args}
          value={val}
          onChange={(next) => {
            setVal(next)
            args.onChange?.(next)
          }}
          onChangeEnd={(next) => {
            args.onChangeEnd?.(next)
          }}
        />

        <Box sx={{ padding: "8px 10px", borderRadius: "10px", backgroundColor: "grayscale.50" }}>
          <Typography
            text={`value: ${Array.isArray(val) ? `[${val[0]}, ${val[1]}]` : val}`}
            variant="b2Regular"
          />
        </Box>
      </Flex>
    </Flex>
  )
}

export const Playground: Story = {
  render: (args) => <Controlled {...(args as SliderProps)} />,
}

export const AllCases: Story = {
  render: (args) => {
    const common = args as SliderProps

    return (
      <Flex direction="column" gap="18px" width="720px">
        <Typography text="Single" variant="h3" />
        <Flex direction="column" gap="12px">
          <Controlled {...common} value={40} label="Default" />
          <Controlled {...common} value={40} label="Track inset" track="inset" />
          <Controlled {...common} value={40} label="Track none" track="none" />
          <Controlled {...common} value={40} label="Disabled" disabled />
          <Controlled
            {...common}
            value={40}
            label="With icons"
            startIcon={"chevron-left"}
            endIcon={"chevron-right"}
            iconSize={16}
          />
          <Controlled {...common} value={40} label="Step 5" step={5} />
          <Controlled {...common} value={40} label="Min/Max (10~60)" min={10} max={60} />
        </Flex>

        <Typography text="Range" variant="h3" />
        <Flex direction="column" gap="12px">
          <Controlled {...common} value={[20, 80]} label="Default" />
          <Controlled {...common} value={[20, 80]} label="Track inset" track="inset" />
          <Controlled {...common} value={[20, 80]} label="Track none" track="none" />
          <Controlled {...common} value={[20, 80]} label="Disabled" disabled />
          <Controlled
            {...common}
            value={[20, 80]}
            label="With icons"
            startIcon={"minus"}
            endIcon={"plus"}
            iconSize={16}
          />
          <Controlled {...common} value={[20, 80]} label="Step 10" step={10} />
          <Controlled {...common} value={[20, 80]} label="Min/Max (10~60)" min={10} max={60} />
        </Flex>
      </Flex>
    )
  },
}

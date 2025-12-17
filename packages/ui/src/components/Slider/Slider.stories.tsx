import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Slider, { SliderProps } from "./Slider"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { IconNames } from "../Icon/icon-loader"

const meta: Meta<SliderProps> = {
  title: "components/Slider",
  component: Slider,
  args: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    track: "normal",
    label: "슬라이더",
  },
  argTypes: {
    value: { control: "object" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    track: { control: "radio", options: ["normal", "inset", "none"] },
    label: { control: "text" },
    startIcon: { control: "text" },
    endIcon: { control: "text" },
    p: { control: "text" },
    m: { control: "text" },
    width: { control: "text" },
    sx: { control: false },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Box p="20px" width="500px">
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<SliderProps>

/* -------------------------------------------------------------------------- */
/*                                  DEFAULT                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: (args) => {
    const [val, setVal] = useState<number>(args.value as number)

    return (
      <Slider
        {...args}
        value={val}
        onChange={(v) => setVal(v as number)}
        onChangeEnd={(v) => console.log("onChangeEnd:", v)}
      />
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                              RANGE SLIDER                                  */
/* -------------------------------------------------------------------------- */

export const Range: Story = {
  render: () => {
    const [val, setVal] = useState<[number, number]>([20, 80])

    return (
      <Slider
        value={val}
        onChange={(v) => setVal(v as [number, number])}
        onChangeEnd={(v) => console.log("onChangeEnd:", v)}
        label="범위 선택"
      />
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                              TRACK VARIANTS                                 */
/* -------------------------------------------------------------------------- */

export const TrackVariants: Story = {
  render: () => {
    const [v1, setV1] = useState(30)
    const [v2, setV2] = useState(50)
    const [v3, setV3] = useState(70)

    return (
      <Flex direction="column" gap="24px">
        <Slider
          value={v1}
          onChange={(v) => setV1(v as number)}
          track="normal"
          label="Normal Track"
        />
        <Slider value={v2} onChange={(v) => setV2(v as number)} track="inset" label="Inset Track" />
        <Slider value={v3} onChange={(v) => setV3(v as number)} track="none" label="No Track" />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                          START / END ICONS                                  */
/* -------------------------------------------------------------------------- */

export const WithIcons: Story = {
  render: () => {
    const [val, setVal] = useState(40)

    return (
      <Slider
        value={val}
        onChange={(v) => setVal(v as number)}
        label="아이콘 포함"
        startIcon={IconNames[0]}
        endIcon={IconNames[0]}
      />
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                               DISABLED STATE                                */
/* -------------------------------------------------------------------------- */

export const Disabled: Story = {
  render: () => <Slider value={50} disabled label="Disabled Slider" />,
}

/* -------------------------------------------------------------------------- */
/*                        CUSTOM MIN/MAX/STEP                                  */
/* -------------------------------------------------------------------------- */

export const CustomRange: Story = {
  render: () => {
    const [value, setValue] = useState(5)

    return (
      <Slider
        value={value}
        min={0}
        max={10}
        step={0.5}
        label="0 ~ 10 (step 0.5)"
        onChange={(v) => setValue(v as number)}
      />
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                          MULTIPLE SLIDERS                                   */
/* -------------------------------------------------------------------------- */

export const MultipleExamples: Story = {
  render: () => {
    const [v1, setV1] = useState(10)
    const [v2, setV2] = useState(40)
    const [range, setRange] = useState<[number, number]>([30, 70])

    return (
      <Flex direction="column" gap="28px">
        <Slider value={v1} label="Slider 1" onChange={(v) => setV1(v as number)} />
        <Slider value={v2} label="Slider 2" onChange={(v) => setV2(v as number)} />
        <Slider
          value={range}
          label="Range Slider"
          onChange={(v) => setRange(v as [number, number])}
        />
      </Flex>
    )
  },
}

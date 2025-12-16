import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"

import SwitchButton from "./SwitchButton"
import Flex from "../Flex/Flex"

import { SizeUiType, ColorUiType, LabelPlacement } from "../../types"

/* -------------------------------------------------------------------------- */
/*                                   META                                     */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof SwitchButton> = {
  title: "components/SwitchButton",
  component: SwitchButton,

  args: {
    checked: false,
    disabled: false,
    size: "M",
    color: "primary",
    label: "스위치 버튼",
    labelPlacment: "right",
  },

  argTypes: {
    checked: { control: false },
    disabled: { control: "boolean" },
    size: { control: "radio", options: ["S", "M", "L"] satisfies SizeUiType[] },
    color: {
      control: "radio",
      options: ["primary", "secondary", "normal"] satisfies ColorUiType[],
    },
    label: { control: "text" },
    labelPlacment: { control: "radio", options: ["left", "right"] satisfies LabelPlacement[] },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof SwitchButton>

/* -------------------------------------------------------------------------- */
/*                                  DEFAULT                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true)
    return <SwitchButton {...args} checked={checked} onChange={() => setChecked(!checked)} />
  },
}

/* -------------------------------------------------------------------------- */
/*                                   SIZES                                    */
/* -------------------------------------------------------------------------- */

export const Sizes: Story = {
  render: (args) => {
    const [s, setS] = useState(true)
    const [m, setM] = useState(true)
    const [l, setL] = useState(true)

    return (
      <Flex direction="column" gap="20px">
        <SwitchButton {...args} size="S" checked={s} label="Size S" onChange={() => setS(!s)} />
        <SwitchButton {...args} size="M" checked={m} label="Size M" onChange={() => setM(!m)} />
        <SwitchButton {...args} size="L" checked={l} label="Size L" onChange={() => setL(!l)} />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                                   COLORS                                   */
/* -------------------------------------------------------------------------- */

export const Colors: Story = {
  render: (args) => {
    const [p, setP] = useState(true)
    const [s, setS] = useState(true)
    const [n, setN] = useState(true)

    return (
      <Flex direction="column" gap="20px">
        <SwitchButton
          {...args}
          color="primary"
          checked={p}
          label="Primary"
          onChange={() => setP(!p)}
        />
        <SwitchButton
          {...args}
          color="secondary"
          checked={s}
          label="Secondary"
          onChange={() => setS(!s)}
        />
        <SwitchButton
          {...args}
          color="normal"
          checked={n}
          label="Normal"
          onChange={() => setN(!n)}
        />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                                LABEL PLACEMENT                             */
/* -------------------------------------------------------------------------- */

export const LabelPlacements: Story = {
  render: (args) => {
    const [a, setA] = useState(false)
    const [b, setB] = useState(true)
    const [c, setC] = useState(true)
    const [d, setD] = useState(true)

    return (
      <Flex direction="column" gap="20px">
        <SwitchButton
          {...args}
          labelPlacment="left"
          label="Label Left"
          checked={a}
          onChange={() => setA(!a)}
        />
        <SwitchButton
          {...args}
          labelPlacment="right"
          label="Label Right"
          checked={b}
          onChange={() => setB(!b)}
        />
        <SwitchButton
          {...args}
          labelPlacment="top"
          label="Label Top"
          checked={c}
          onChange={() => setC(!c)}
        />
        <SwitchButton
          {...args}
          labelPlacment="bottom"
          label="Label Bottom"
          checked={d}
          onChange={() => setD(!d)}
        />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                                  DISABLED                                  */
/* -------------------------------------------------------------------------- */

export const Disabled: Story = {
  render: (args) => (
    <SwitchButton {...args} disabled checked={true} label="Disabled Switch" onChange={() => {}} />
  ),
}

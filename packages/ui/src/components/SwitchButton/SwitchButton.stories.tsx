import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import SwitchButton, { SwitchButtonProps } from "./SwitchButton"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof SwitchButton> = {
  title: "Components/SwitchButton",
  component: SwitchButton,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    checked: { control: false },
    onChange: { control: false },
    disabled: { control: { type: "boolean" } },
    size: { control: { type: "radio" }, options: ["S", "M", "L"] },
    color: { control: { type: "text" } },
    label: { control: { type: "text" } },
    labelPlacment: { control: { type: "radio" }, options: ["left", "right", "top", "bottom"] },
    labelPlacement: { control: { type: "radio" }, options: ["left", "right", "top", "bottom"] },
    typographyProps: { control: false },
  },
  args: {
    disabled: false,
    size: "M",
    color: "primary",
    label: "Switch",
    labelPlacment: "right",
    labelPlacement: undefined,
    typographyProps: undefined,
  },
}

export default meta
type Story = StoryObj<typeof SwitchButton>

const Controlled = (args: SwitchButtonProps) => {
  const [checked, setChecked] = useState<boolean>(true)

  return (
    <Flex direction="column" gap="12px" width="520px">
      <Flex justify="space-between" align="center">
        <Typography text="Playground" variant="h3" />
      </Flex>

      <SwitchButton
        {...args}
        checked={checked}
        onChange={(next) => {
          setChecked(next)
        }}
      />

      <Box sx={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
        <Typography text={`checked: ${String(checked)}`} variant="b2Regular" />
      </Box>

      <Typography
        text="키보드: Tab → Space/Enter 토글"
        variant="b3Regular"
        color="text.secondary"
      />
    </Flex>
  )
}

export const Playground: Story = {
  render: (args) => <Controlled {...(args as SwitchButtonProps)} />,
}

export const Variants: Story = {
  render: (args) => {
    const common = args as SwitchButtonProps

    const placements = useMemo(() => ["left", "right", "top", "bottom"] as const, [])

    return (
      <Flex direction="column" gap="22px" width="920px">
        <Typography text="Sizes" variant="h3" />
        <Flex gap="18px" align="center" wrap="wrap">
          <Controlled {...common} size="S" label="Size S" />
          <Controlled {...common} size="M" label="Size M" />
          <Controlled {...common} size="L" label="Size L" />
        </Flex>

        <Typography text="States" variant="h3" />
        <Flex gap="18px" align="center" wrap="wrap">
          <Controlled {...common} label="Enabled" disabled={false} />
          <Controlled {...common} label="Disabled" disabled />
        </Flex>

        <Typography text="Colors (token / custom)" variant="h3" />
        <Flex gap="18px" align="center" wrap="wrap">
          <Controlled {...common} label="primary" color="primary" />
          <Controlled {...common} label="secondary" color="secondary" />
          <Controlled {...common} label="normal" color="normal" />
          <Controlled {...common} label="#FF5A5A" color="#FF5A5A" />
        </Flex>

        <Typography
          text="Label placement (labelPlacement 우선, 없으면 labelPlacment)"
          variant="h3"
        />
        <Flex direction="column" gap="12px">
          {placements.map((p) => (
            <Flex key={p} gap="18px" align="center" wrap="wrap">
              <Controlled
                {...common}
                label={`placement: ${p}`}
                labelPlacement={p}
                labelPlacment={undefined}
              />
              <Controlled
                {...common}
                label={`legacy: ${p}`}
                labelPlacment={p}
                labelPlacement={undefined}
              />
            </Flex>
          ))}
        </Flex>
      </Flex>
    )
  },
}

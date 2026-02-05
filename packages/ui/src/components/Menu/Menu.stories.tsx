import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Menu from "./Menu"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import Button from "../Button/Button"

const START_ICON = "File"
const END_ICON = "ArrowRight"

const meta: Meta<typeof Menu> = {
  title: "Components/Menu",
  component: Menu,
  parameters: { layout: "padded" },
  argTypes: {
    onClick: { action: "onClick" },
    iconProps: { control: false },
    typographyProps: { control: false },
  },
  args: {
    text: "Menu Item",
    size: "M",
    disabled: false,
    selected: false,
    startIcon: START_ICON as any,
    endIcon: END_ICON as any,
  },
}
export default meta
type Story = StoryObj<typeof Menu>

export const Playground: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<boolean>(!!args.selected)
    const [disabled, setDisabled] = useState<boolean>(!!args.disabled)
    const [size, setSize] = useState<"S" | "M" | "L">((args.size as any) ?? "M")
    const [log, setLog] = useState<string>("")

    return (
      <Box>
        <Typography variant="h3" text="Menu Playground" mb="12px" />

        <Flex gap="8px" align="center" wrap="wrap" mb="12px">
          <Button
            text={`selected: ${selected ? "true" : "false"}`}
            variant="outlined"
            color="normal"
            onClick={() => setSelected((p) => !p)}
          />
          <Button
            text={`disabled: ${disabled ? "true" : "false"}`}
            variant="outlined"
            color="normal"
            onClick={() => setDisabled((p) => !p)}
          />
          <Button text="size: S" variant="outlined" color="normal" onClick={() => setSize("S")} />
          <Button text="size: M" variant="outlined" color="normal" onClick={() => setSize("M")} />
          <Button text="size: L" variant="outlined" color="normal" onClick={() => setSize("L")} />
        </Flex>

        <Box sx={{ width: "360px", border: "1px solid #eee" }}>
          <Menu
            {...args}
            size={size}
            disabled={disabled}
            selected={selected}
            onClick={(e) => {
              args.onClick?.(e as any)
              setLog(`clicked at ${new Date().toLocaleTimeString()}`)
              setSelected((p) => !p)
            }}
          />
        </Box>

        <Box mt="10px">
          <Typography variant="b3Regular" color="#666666" text={`log: ${log || "-"}`} />
        </Box>
      </Box>
    )
  },
}

export const AllStates: Story = {
  render: () => {
    const cases = useMemo(
      () => [
        { title: "Size S", size: "S" as const },
        { title: "Size M", size: "M" as const },
        { title: "Size L", size: "L" as const },
      ],
      [],
    )

    return (
      <Box>
        <Typography variant="h3" text="Menu All States" mb="12px" />

        <Flex gap="16px" wrap="wrap">
          {cases.map((c) => (
            <Box key={c.title} sx={{ width: "360px", border: "1px solid #eee" }}>
              <Box p="10px">
                <Typography variant="b2Regular" text={c.title} color="#666666" />
              </Box>

              <Menu
                text="Default"
                size={c.size}
                startIcon={START_ICON as any}
                endIcon={END_ICON as any}
              />
              <Menu
                text="Selected"
                size={c.size}
                selected
                startIcon={START_ICON as any}
                endIcon={END_ICON as any}
              />
              <Menu
                text="Disabled"
                size={c.size}
                disabled
                startIcon={START_ICON as any}
                endIcon={END_ICON as any}
              />
              <Menu text="No icons" size={c.size} onClick={() => {}} />
            </Box>
          ))}
        </Flex>
      </Box>
    )
  },
}

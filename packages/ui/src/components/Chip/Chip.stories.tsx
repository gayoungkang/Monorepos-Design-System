import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import Chip from "./Chip"
import type { ChipProps } from "./Chip"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const START_ICON = "Add"
const END_ICON = "CloseLine"

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  parameters: { layout: "fullscreen" },
  argTypes: {
    label: { control: "text" },
    size: { control: "radio", options: ["S", "M", "L"] },
    variant: { control: "radio", options: ["contained", "outlined", "text"] },
    disabled: { control: "boolean" },
    color: { control: "color" },
    startIcon: { control: "text" },
    endIcon: { control: "text" },
  },
  args: {
    label: "디자인",
    size: "M",
    variant: "contained",
    disabled: false,
    color: undefined,
  },
}
export default meta
type Story = StoryObj<typeof Chip>

export const Playground: Story = {
  render: (args) => {
    return (
      <Box p="20px">
        <Typography variant="h3" text="Chip Playground" mb="12px" />
        <Flex gap="12px" align="center" wrap="wrap">
          <Chip {...(args as ChipProps)} />
          <Chip {...(args as ChipProps)} startIcon={START_ICON} />
          <Chip {...(args as ChipProps)} endIcon={END_ICON} />
          <Chip {...(args as ChipProps)} onDelete={() => undefined} />
          <Chip {...(args as ChipProps)} startIcon={START_ICON} onDelete={() => undefined} />
        </Flex>
      </Box>
    )
  },
}

export const ClickAndDeleteInteraction: Story = {
  render: () => {
    const [log, setLog] = useState<string[]>([])
    const push = (msg: string) => setLog((prev) => [msg, ...prev].slice(0, 6))

    const chips = useMemo(
      () => [
        { label: "Chip A", variant: "contained" as const },
        { label: "Chip B", variant: "outlined" as const },
        { label: "Chip C", variant: "text" as const },
      ],
      [],
    )

    return (
      <Box p="20px">
        <Typography variant="h3" text="Click vs Delete (stopPropagation)" mb="12px" />

        <Flex gap="10px" mb="12px">
          <Button text="Clear" variant="outlined" color="normal" onClick={() => setLog([])} />
        </Flex>

        <Flex gap="12px" align="center" wrap="wrap" mb="14px">
          {chips.map((c) => (
            <Chip
              key={c.label}
              label={c.label}
              variant={c.variant}
              onClick={() => push(`${c.label}: onClick`)}
              onDelete={() => push(`${c.label}: onDelete`)}
              startIcon={START_ICON}
              endIcon={END_ICON}
            />
          ))}
        </Flex>

        <Box>
          <Typography
            variant="b3Regular"
            text={log.length ? log.join(" / ") : "no logs"}
            color="#666666"
          />
        </Box>
      </Box>
    )
  },
}

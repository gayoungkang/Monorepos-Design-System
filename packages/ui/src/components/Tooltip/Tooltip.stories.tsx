import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Tooltip, { TooltipProps } from "./Tooltip"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Button from "../Button/Button"

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  argTypes: {
    children: { control: false },
    content: { control: { type: "text" } },
    maxWidth: { control: { type: "text" } },
    placement: { control: { type: "radio" }, options: ["top", "bottom", "left", "right"] },
    sx: { control: false },
    p: { control: false },
    m: { control: false },
    px: { control: false },
    py: { control: false },
    my: { control: false },
    width: { control: false },
    height: { control: false },
    bgColor: { control: false },
  },
  args: {
    content: "Tooltip content",
    placement: "bottom",
    maxWidth: "300px",
  } satisfies Partial<TooltipProps>,
}

export default meta
type Story = StoryObj<typeof Tooltip>

const Controlled = (args: TooltipProps) => {
  const [enabled, setEnabled] = useState(true)
  const [text, setText] = useState(args.content)

  const child = useMemo(
    () => (
      <Box
        sx={{
          padding: "10px 12px",
          borderRadius: "10px",
          backgroundColor: "grayscale.50",
          border: "1px solid",
          borderColor: "border.default",
        }}
      >
        <Typography text="Hover / Focus me" variant="b2Regular" />
      </Box>
    ),
    [],
  )

  return (
    <Flex direction="column" gap="12px" width="520px">
      <Flex align="center" justify="space-between">
        <Typography text="Playground" variant="h3" />
        <Flex gap="8px">
          <Button
            variant={enabled ? "contained" : "outlined"}
            text={enabled ? "Enabled" : "Disabled"}
            onClick={() => setEnabled((p) => !p)}
          />
          <Button
            variant="outlined"
            text="Long text"
            onClick={() => setText("Long tooltip content\nwith line breaks\nand wrapping.")}
          />
          <Button variant="outlined" text="Reset" onClick={() => setText(args.content)} />
        </Flex>
      </Flex>

      {enabled ? (
        <Tooltip {...args} content={text}>
          {child}
        </Tooltip>
      ) : (
        child
      )}

      <Box sx={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
        <Typography text={`enabled: ${enabled}`} variant="b2Regular" />
        <Typography text={`content: ${JSON.stringify(text)}`} variant="b3Regular" />
      </Box>
    </Flex>
  )
}

export const Playground: Story = {
  render: (args) => (
    <Controlled {...(args as TooltipProps)}>
      <span />
    </Controlled>
  ),
}

export const AllCases: Story = {
  render: (args) => {
    const common = args as TooltipProps

    return (
      <Flex direction="column" gap="18px" width="820px">
        <Typography text="Placements" variant="h3" />
        <Flex gap="20px" wrap="wrap">
          <Tooltip {...common} placement="top" content="Top">
            <Button text="Top" />
          </Tooltip>
          <Tooltip {...common} placement="bottom" content="Bottom">
            <Button text="Bottom" />
          </Tooltip>
          <Tooltip {...common} placement="left" content="Left">
            <Button text="Left" />
          </Tooltip>
          <Tooltip {...common} placement="right" content="Right">
            <Button text="Right" />
          </Tooltip>
        </Flex>

        <Typography text="MaxWidth / Wrap" variant="h3" />
        <Flex gap="20px" wrap="wrap">
          <Tooltip
            {...common}
            maxWidth="180px"
            content="This is a long tooltip content that should wrap within maxWidth."
          >
            <Button text="maxWidth 180px" />
          </Tooltip>
          <Tooltip {...common} maxWidth="320px" content={"Multi-line\ncontent\nwith wrapping."}>
            <Button text="multiline" />
          </Tooltip>
        </Flex>

        <Typography text="Disabled (no tooltip)" variant="h3" />
        <Flex gap="12px">
          <Box
            sx={{
              padding: "10px 12px",
              borderRadius: "10px",
              backgroundColor: "grayscale.50",
              border: "1px solid",
              borderColor: "border.default",
            }}
          >
            <Typography text="No tooltip here" variant="b2Regular" />
          </Box>
        </Flex>
      </Flex>
    )
  },
}

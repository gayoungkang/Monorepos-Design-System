import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import Badge from "./Badge"
import type { BadgeProps } from "./Badge"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import Avatar from "../Avatar/Avatar"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "fullscreen" },
  argTypes: {
    content: { control: "text" },
    max: { control: "number" },
    showZero: { control: "boolean" },
    invisible: { control: "boolean" },
    status: { control: "radio", options: ["success", "info", "warning", "error"] },
    overlap: { control: "radio", options: ["rectangular", "circular"] },
    placement: {
      control: "radio",
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
    },
    children: { control: false },
  },
  args: {
    content: 3,
    max: 99,
    showZero: false,
    invisible: false,
    status: "error",
    overlap: "rectangular",
    placement: "top-right",
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Playground: Story = {
  render: (args) => {
    return (
      <Box p="20px">
        <Typography variant="h3" text="Badge Playground" mb="12px" />

        <Flex gap="18px" align="center">
          <Badge {...(args as BadgeProps)}>
            <Button text="Target" variant="contained" color="primary" />
          </Badge>

          <Badge {...(args as BadgeProps)} overlap="circular">
            <Avatar name="Jane Doe" size="L" />
          </Badge>
        </Flex>
      </Box>
    )
  },
}

export const MaxAndZeroAndInvisible: Story = {
  render: () => {
    const [count, setCount] = useState(0)
    const [invisible, setInvisible] = useState(false)

    return (
      <Box p="20px">
        <Typography variant="h3" text="Max / Zero / Invisible" mb="12px" />

        <Flex gap="10px" mb="12px" wrap="wrap">
          <Button text="+1" onClick={() => setCount((v) => v + 1)} />
          <Button
            text="-1"
            variant="outlined"
            color="normal"
            onClick={() => setCount((v) => v - 1)}
          />
          <Button
            text={invisible ? "Show badge" : "Hide badge"}
            variant="text"
            color="secondary"
            onClick={() => setInvisible((v) => !v)}
          />
        </Flex>

        <Flex gap="18px" align="center">
          <Badge content={count} max={9} status="error" showZero={false} invisible={invisible}>
            <Button text="showZero=false" variant="outlined" color="normal" />
          </Badge>

          <Badge content={count} max={9} status="info" showZero invisible={invisible}>
            <Button text="showZero=true" variant="outlined" color="normal" />
          </Badge>

          <Badge content={120} max={99} status="warning">
            <Button text="120 → 99+" variant="outlined" color="normal" />
          </Badge>
        </Flex>
      </Box>
    )
  },
}

export const PlacementMatrix: Story = {
  render: () => {
    const placements: Array<BadgeProps["placement"]> = [
      "top-right",
      "top-left",
      "bottom-right",
      "bottom-left",
    ]
    return (
      <Box p="20px">
        <Typography variant="h3" text="Placement Matrix" mb="12px" />

        <Flex gap="22px" wrap="wrap">
          {placements.map((p) => (
            <Box key={p}>
              <Typography variant="b3Regular" text={p ?? ""} mb="8px" color="#666666" />
              <Badge content={3} placement={p} status="success">
                <Box
                  width="64px"
                  height="64px"
                  sx={{
                    borderRadius: "14px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                  }}
                />
              </Badge>
            </Box>
          ))}
        </Flex>
      </Box>
    )
  },
}

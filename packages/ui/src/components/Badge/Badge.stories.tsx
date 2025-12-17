import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Badge, { BadgeProps } from "./Badge"
import Box from "../Box/Box"
import Button from "../Button/Button"
import { StatusUiType } from "../../types"
import Flex from "../Flex/Flex"

/* -------------------------------------------------------------------------- */
/*                                    Meta                                    */
/* -------------------------------------------------------------------------- */

const meta: Meta<BadgeProps> = {
  title: "components/Badge",
  component: Badge,

  args: {
    content: 5,
    max: 99,
    status: "error",
    overlap: "rectangular",
    placement: "top-right",
    showZero: false,
    invisible: false,
  },

  argTypes: {
    content: { control: "text" },
    max: { control: "number" },
    status: {
      control: "radio",
      options: ["error", "success", "info", "warning"] satisfies StatusUiType[],
    },
    overlap: {
      control: "radio",
      options: ["rectangular", "circular"],
    },
    placement: {
      control: "select",
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
    },
    showZero: { control: "boolean" },
    invisible: { control: "boolean" },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Box p="24px">
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<BadgeProps>

/* -------------------------------------------------------------------------- */
/*                                  Default                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: (args) => (
    <Badge {...args}>
      <Button text="알림 버튼" />
    </Badge>
  ),
}

/* -------------------------------------------------------------------------- */
/*                              Status Variants                                */
/* -------------------------------------------------------------------------- */

export const Status: Story = {
  render: () => (
    <Flex gap="24px">
      <Badge content={5} status="error">
        <Button text="Error" />
      </Badge>
      <Badge content={5} status="success">
        <Button text="Success" />
      </Badge>
      <Badge content={5} status="info">
        <Button text="Info" />
      </Badge>
      <Badge content={5} status="warning">
        <Button text="Warning" />
      </Badge>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                               Max + Overflow                                */
/* -------------------------------------------------------------------------- */

export const MaxOverflow: Story = {
  render: () => (
    <Flex gap="24px">
      <Badge content={150} max={99}>
        <Button text="99 max" />
      </Badge>

      <Badge content={1000} max={999}>
        <Button text="999 max" />
      </Badge>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                               Placement Examples                            */
/* -------------------------------------------------------------------------- */

export const Placement: Story = {
  render: () => (
    <Flex gap="40px">
      <Badge content={3} placement="top-left">
        <Button text="Top Left" />
      </Badge>

      <Badge content={3} placement="top-right">
        <Button text="Top Right" />
      </Badge>

      <Badge content={3} placement="bottom-left">
        <Button text="Bottom Left" />
      </Badge>

      <Badge content={3} placement="bottom-right">
        <Button text="Bottom Right" />
      </Badge>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                Overlap Types                                */
/* -------------------------------------------------------------------------- */

export const Overlap: Story = {
  render: () => (
    <Flex gap="40px">
      <Badge content={8} overlap="rectangular">
        <Button text="Rectangular" />
      </Badge>

      <Badge content={8} overlap="circular">
        <Button text="Circular" />
      </Badge>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                              Show Zero & Invisible                          */
/* -------------------------------------------------------------------------- */

export const ShowZero: Story = {
  render: () => (
    <Flex gap="40px">
      <Badge content={0} showZero>
        <Button text="Show Zero" />
      </Badge>

      <Badge content={0} showZero={false}>
        <Button text="Zero Hidden" />
      </Badge>

      <Badge content={10} invisible>
        <Button text="Invisible" />
      </Badge>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                Live Updating                                */
/* -------------------------------------------------------------------------- */

export const LiveUpdate: Story = {
  render: () => {
    const [count, setCount] = useState(1)

    return (
      <Flex direction="column" gap="16px">
        <Badge content={count}>
          <Button text="Dynamic Badge" />
        </Badge>

        <Flex gap="12px">
          <Button text="+" onClick={() => setCount((c) => c + 1)} />
          <Button text="-" onClick={() => setCount((c) => Math.max(0, c - 1))} />
        </Flex>
      </Flex>
    )
  },
}

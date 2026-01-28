import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import Divider from "./Divider"
import type { DividerProps } from "./Divider"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  parameters: { layout: "fullscreen" },
  argTypes: {
    direction: { control: "radio", options: ["horizontal", "vertical"] },
    thickness: { control: "text" },
    color: { control: "color" },
    flexItem: { control: "boolean" },
  },
  args: {
    direction: "horizontal",
    thickness: "1px",
    flexItem: false,
  },
}

export default meta
type Story = StoryObj<typeof Divider>

export const Playground: Story = {
  render: (args) => {
    return (
      <Box p="20px">
        <Typography variant="h3" text="Divider Playground" mb="12px" />
        <Box width="360px" sx={{ border: "1px solid #e5e7eb", borderRadius: "12px" }} p="12px">
          <Typography variant="b2Regular" text="Above" />
          <Divider {...(args as DividerProps)} my="12px" />
          <Typography variant="b2Regular" text="Below" />
        </Box>
      </Box>
    )
  },
}

export const VerticalInFlex: Story = {
  render: () => {
    const [flexItem, setFlexItem] = useState(true)

    return (
      <Box p="20px">
        <Typography variant="h3" text="Vertical in Flex (flexItem)" mb="12px" />

        <Flex gap="10px" mb="12px">
          <Button
            text={flexItem ? "flexItem=true" : "flexItem=false"}
            variant="outlined"
            color="normal"
            onClick={() => setFlexItem((v) => !v)}
          />
        </Flex>

        <Flex align="center" sx={{ border: "1px solid #e5e7eb", borderRadius: "12px" }} p="12px">
          <Typography variant="b2Regular" text="Left" />
          <Divider direction="vertical" thickness="2px" mx="12px" flexItem={flexItem} />
          <Typography variant="b2Regular" text="Right" />
        </Flex>
      </Box>
    )
  },
}

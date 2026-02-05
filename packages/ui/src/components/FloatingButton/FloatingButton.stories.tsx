import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import FloatingButton from "./FloatingButton"
import type { FloatingButtonProps } from "./FloatingButton"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const MAIN_ICON = "Add"
const ITEM_ICON_1 = "Tag" as any
const ITEM_ICON_2 = "ArrowRight"
const ITEM_ICON_3 = "CheckLine"

const meta: Meta<typeof FloatingButton> = {
  title: "Components/FloatingButton",
  component: FloatingButton,
  parameters: { layout: "fullscreen" },
  argTypes: {
    item: { control: false },
    iconProps: { control: false },
    TypographyProps: { control: false },
  },
  args: {
    icon: MAIN_ICON,
    label: "Create",
    size: "M",
    color: "primary",
    placement: "top",
    disabled: false,
  },
}
export default meta
type Story = StoryObj<typeof FloatingButton>

export const Playground: Story = {
  render: () => {
    const [log, setLog] = useState<string>("")

    return (
      <Box p="20px">
        <Typography variant="h3" text="Menu + outside click + ESC" mb="12px" />

        <Flex gap="10px" mb="12px">
          <Button text="Clear log" variant="outlined" color="normal" onClick={() => setLog("")} />
        </Flex>

        <FloatingButton
          icon={MAIN_ICON}
          label="New"
          placement="top"
          item={[
            { icon: ITEM_ICON_1, label: "Tag", onClick: () => setLog("Tag clicked") },
            { icon: ITEM_ICON_2, label: "Move", onClick: () => setLog("Move clicked") },
            { icon: ITEM_ICON_3, onClick: () => setLog("Icon-only clicked") },
          ]}
        />

        <Box mt="14px">
          <Typography variant="b3Regular" text={log || "no logs"} color="#666666" />
        </Box>
      </Box>
    )
  },
}

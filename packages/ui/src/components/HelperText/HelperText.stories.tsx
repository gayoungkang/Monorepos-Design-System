import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"
import HelperText from "./HelperText"
import type { HelperTextProps } from "./HelperText"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof HelperText> = {
  title: "Components/HelperText",
  component: HelperText,
  parameters: { layout: "fullscreen" },
  argTypes: {
    iconProps: { control: false },
    typographyProps: { control: false },
  },
  args: {
    status: "error",
    text: "비밀번호가 일치하지 않습니다.",
  },
}
export default meta
type Story = StoryObj<typeof HelperText>

export const Playground: Story = {
  render: (args) => {
    return (
      <Box p="20px">
        <Typography variant="h3" text="HelperText Playground" mb="12px" />
        <HelperText {...(args as HelperTextProps)} />
      </Box>
    )
  },
}

export const AllStatuses: Story = {
  render: () => {
    const [text, setText] = useState("멀티라인도 됩니다.\n두 번째 줄")

    return (
      <Box p="20px">
        <Typography variant="h3" text="Statuses" mb="12px" />

        <Flex gap="8px" mb="12px" wrap="wrap">
          <Button
            text="Set short"
            variant="outlined"
            color="normal"
            onClick={() => setText("짧은 메시지")}
          />
          <Button
            text="Set multiline"
            variant="outlined"
            color="normal"
            onClick={() => setText("멀티라인도 됩니다.\n두 번째 줄")}
          />
        </Flex>

        <Box mb="10px">
          <HelperText status="error" text={text} />
        </Box>
        <Box mb="10px">
          <HelperText status="success" text={text} />
        </Box>
        <Box mb="10px">
          <HelperText status="info" text={text} />
        </Box>
        <Box>
          <HelperText status="default" text={text} />
        </Box>
      </Box>
    )
  },
}

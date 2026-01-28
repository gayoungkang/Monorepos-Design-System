import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import Avatar from "./Avatar"
import type { AvatarProps } from "./Avatar"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: { layout: "fullscreen" },
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    name: { control: "text" },
    size: { control: "radio", options: ["S", "M", "L"] },
    bgColor: { control: "color" },
    fgColor: { control: "color" },
  },
  args: {
    name: "Jane Doe",
    size: "M",
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Playground: Story = {
  render: (args) => {
    return (
      <Box p="20px">
        <Typography variant="h3" text="Avatar Playground" mb="12px" />
        <Flex gap="12px" align="center">
          <Avatar {...(args as AvatarProps)} />
          <Typography
            variant="b3Regular"
            text={`src=${args.src ? "set" : "empty"} | name="${args.name ?? ""}" | size=${String(args.size)}`}
            color="#666666"
          />
        </Flex>
      </Box>
    )
  },
}

export const ImageFallbackAndReset: Story = {
  render: () => {
    const ok =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="#60a5fa"/><text x="50%" y="54%" text-anchor="middle" font-size="18" fill="white" font-family="Arial">OK</text></svg>`,
      )

    const broken = "https://example.com/not-found-avatar.png"

    const [src, setSrc] = useState<string | undefined>(broken)

    return (
      <Box p="20px">
        <Typography variant="h3" text="Image error fallback + src reset" mb="12px" />

        <Flex gap="10px" mb="12px">
          <Button
            text="Use broken src"
            variant="outlined"
            color="normal"
            onClick={() => setSrc(broken)}
          />
          <Button
            text="Use ok src"
            variant="contained"
            color="primary"
            onClick={() => setSrc(ok)}
          />
          <Button
            text="Remove src"
            variant="text"
            color="secondary"
            onClick={() => setSrc(undefined)}
          />
        </Flex>

        <Flex gap="14px" align="center">
          <Avatar src={src} name="Jane Doe" size="L" />
          <Typography
            variant="b3Regular"
            text={`current src: ${src ? src.slice(0, 42) + "..." : "(none)"}`}
          />
        </Flex>
      </Box>
    )
  },
}

export const SizeMatrix: Story = {
  render: () => {
    return (
      <Box p="20px">
        <Typography variant="h3" text="Sizes" mb="12px" />
        <Flex gap="12px" align="center">
          <Avatar name="A B" size="S" />
          <Avatar name="A B" size="M" />
          <Avatar name="A B" size="L" />
        </Flex>
      </Box>
    )
  },
}

import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Avatar, { AvatarProps } from "./Avatar"
import Flex from "../Flex/Flex"

const meta: Meta<AvatarProps> = {
  title: "components/Avatar",
  component: Avatar,

  args: {
    size: "M",
    name: "홍 길동",
    bgColor: theme.colors.primary[400],
    fgColor: theme.colors.grayscale.white,
  },

  argTypes: {
    src: { control: "text", description: "이미지 URL" },
    name: { control: "text", description: "이름 (이니셜 생성용)" },
    size: { control: "radio", options: ["S", "M", "L"] },
    bgColor: { control: "color" },
    fgColor: { control: "color" },

    /* BaseMixinProps */
    p: { control: "text" },
    m: { control: "text" },
    width: { control: "text" },
    height: { control: "text" },
    sx: { control: false },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<AvatarProps>

/* -------------------------------------------------------------------------- */
/*                                  DEFAULT                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: (args) => <Avatar {...args} />,
}

/* -------------------------------------------------------------------------- */
/*                               SIZE VARIANTS                                */
/* -------------------------------------------------------------------------- */

export const Sizes: Story = {
  render: () => {
    return (
      <Flex gap="16px" align="center">
        <Avatar size="S" name="Small User" />
        <Avatar size="M" name="Medium User" />
        <Avatar size="L" name="Large User" />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                              WITH IMAGE SRC                                */
/* -------------------------------------------------------------------------- */

export const WithImage: Story = {
  args: {
    src: "https://picsum.photos/200",
    name: "임시 이미지",
  },
  render: (args) => <Avatar {...args} />,
}

/* -------------------------------------------------------------------------- */
/*                               IMAGE FALLBACK                                */
/* -------------------------------------------------------------------------- */

export const ImageFallback: Story = {
  render: () => <Avatar src="https://invalid-url-image.jpg" name="Fallback Test" />,
}

/* -------------------------------------------------------------------------- */
/*                               COLORS VARIANTS                              */
/* -------------------------------------------------------------------------- */

export const Colors: Story = {
  render: () => (
    <Flex gap="16px">
      <Avatar name="A" bgColor={theme.colors.primary[400]} />
      <Avatar name="B" bgColor={theme.colors.secondary[400]} />
      <Avatar name="C" bgColor="#333" fgColor="#fff" />
      <Avatar name="D" bgColor="#ffb703" fgColor="#000" />
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                       LONG NAME → INITIALS CHECK                           */
/* -------------------------------------------------------------------------- */

export const InitialsExamples: Story = {
  render: () => (
    <Flex direction="column" gap="12px">
      <Avatar name="홍길동" />
      <Avatar name="김 철 수" />
      <Avatar name="Jane Doe" />
      <Avatar name="SingleName" />
      <Avatar />
    </Flex>
  ),
}

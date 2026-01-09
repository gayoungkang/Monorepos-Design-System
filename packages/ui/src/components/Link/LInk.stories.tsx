import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Link, { LinkProps } from "./Link"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import Avatar from "../Avatar/Avatar"

/* -------------------------------------------------------------------------- */
/*                                    Meta                                    */
/* -------------------------------------------------------------------------- */

const meta: Meta<LinkProps> = {
  title: "components/Link",
  component: Link,
  args: {
    children: "링크 텍스트",
    underline: "hover",
    color: "text.primary",
    href: "#",
    disabled: false,
  },
  argTypes: {
    underline: {
      control: "radio",
      options: ["none", "hover", "always"],
      description: "언더라인 노출 방식",
    },
    color: {
      control: "text",
      description: "링크 색상 (theme 혹은 hex 값)",
    },
    href: {
      control: "text",
      description: "링크 이동 주소",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 여부",
    },
    children: {
      control: "text",
      description: "링크 콘텐츠",
    },
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
type Story = StoryObj<LinkProps>

/* -------------------------------------------------------------------------- */
/*                                  Default                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: (args) => <Link {...args} />,
}

/* -------------------------------------------------------------------------- */
/*                                   Variants                                  */
/* -------------------------------------------------------------------------- */

export const UnderlineVariants: Story = {
  render: () => (
    <Flex direction="column" gap="16px">
      <Link underline="none">underline="none"</Link>
      <Link underline="hover">underline="hover"</Link>
      <Link underline="always">underline="always"</Link>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  Colors                                    */
/* -------------------------------------------------------------------------- */

export const Colors: Story = {
  render: () => (
    <Flex direction="column" gap="16px">
      <Link color={theme.colors.primary[400]}>Primary Color</Link>
      <Link color={theme.colors.error[500]}>Error Color</Link>
      <Link color="#4CAF50">Custom Hex Green</Link>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  Disabled                                  */
/* -------------------------------------------------------------------------- */

export const Disabled: Story = {
  render: () => (
    <Flex direction="column" gap="16px">
      <Link disabled href="#">
        Disabled Link (no click)
      </Link>
      <Link disabled underline="always" href="#">
        Disabled underline always
      </Link>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                          With Custom Children                               */
/* -------------------------------------------------------------------------- */

export const WithChildren: Story = {
  render: () => (
    <Link>
      <Flex align="center" gap="6px">
        <span>아이콘 등 다양한 요소 포함 가능</span>
        <Box width="6px" height="6px" bgColor="red" />
        <Avatar src="https://picsum.photos/200" name="Test" />
      </Flex>
    </Link>
  ),
}

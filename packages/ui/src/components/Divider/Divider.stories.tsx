import type { Meta, StoryObj } from "@storybook/react"
import Divider, { type DividerProps } from "./Divider"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import Box from "../Box/Box"

const meta: Meta<DividerProps> = {
  title: "components/Divider",
  component: Divider,
  args: {
    direction: "horizontal",
    thickness: "1px",
    color: theme.colors.border.thick,
    flexItem: false,
  },
  argTypes: {
    /* ---------------------------------- UI ---------------------------------- */
    direction: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "구분선 방향",
    },
    thickness: {
      control: "text",
      description: "구분선 두께 (CSS 단위 포함)",
    },
    color: {
      control: "text",
      description: "구분선 색상 (기본값: theme.colors.border.thick)",
    },
    flexItem: {
      control: "boolean",
      description: "flex 컨테이너 내 stretch 여부",
    },

    /* ---------------------------------- BaseMixinProps ---------------------------------- */
    p: { control: "text" },
    pt: { control: "text" },
    pr: { control: "text" },
    pb: { control: "text" },
    pl: { control: "text" },
    px: { control: "text" },
    py: { control: "text" },

    m: { control: "text" },
    mt: { control: "text" },
    mr: { control: "text" },
    mb: { control: "text" },
    ml: { control: "text" },
    mx: { control: "text" },
    my: { control: "text" },

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

type Story = StoryObj<DividerProps>

/* ─────────── Default ─────────── */
export const Default: Story = {}

/* ─────────── Directions ─────────── */
export const Directions: Story = {
  render: () => (
    <Flex gap={"24px"} align="center">
      <Box>
        <Typography text="Horizontal" variant="b1Bold" />
        <Divider mt="8px" />
      </Box>

      <Flex align="stretch" gap="12px">
        <Typography text="Vertical" variant="b1Bold" />
        <Divider direction="vertical" thickness="2px" height="40px" ml="8px" />
      </Flex>
    </Flex>
  ),
}

/* ─────────── Thickness ─────────── */
export const Thickness: Story = {
  render: () => (
    <Flex direction="column" justify="space-around" width="300px" height="300px">
      <Divider thickness="1px" />
      <Divider thickness="2px" />
      <Divider thickness="4px" />
    </Flex>
  ),
}

/* ─────────── Colors ─────────── */
export const Colors: Story = {
  render: () => (
    <Flex direction="column" justify="space-around" width="300px" height="300px">
      <Divider color={theme.colors.border.thick} />
      <Divider color={theme.colors.primary[400]} />
      <Divider color={theme.colors.error[500]} />
    </Flex>
  ),
}

/* ─────────── Flex Item ─────────── */
export const FlexItem: Story = {
  render: () => (
    <Flex align="stretch" p="16px" height="80px" gap="12px">
      <Typography variant="b1Bold" text="Left" sx={{ flex: 1 }} />
      <Divider direction="vertical" flexItem thickness="2px" />
      <Typography variant="b1Bold" text="Right" sx={{ flex: 1 }} />
    </Flex>
  ),
}

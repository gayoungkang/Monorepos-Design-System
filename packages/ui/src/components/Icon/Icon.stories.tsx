import type { Meta, StoryObj } from "@storybook/react"
import Icon, { type IconProps } from "./Icon"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import { IconName, IconNames } from "./icon-loader"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"

const meta: Meta<IconProps> = {
  title: "components/Icon",
  component: Icon,

  args: {
    name: IconNames[0],
    size: 24,
    color: theme.colors.grayscale[700],
    strokeWidth: 0,
  },

  argTypes: {
    /* ---------------------------------- Icon Props ---------------------------------- */
    name: {
      control: "text",
      description: "아이콘 이름 (IconName union)",
    },
    size: {
      control: "text",
      description: "아이콘 크기",
    },
    color: {
      control: "text",
      description: "아이콘 색상 (CSS color 또는 theme token)",
    },
    strokeWidth: {
      control: "number",
      description: "SVG stroke-width",
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
type Story = StoryObj<IconProps>

/* ─────────── Default ─────────── */
export const Default: Story = {}

/* ─────────── Sizes ─────────── */
export const Sizes: Story = {
  render: () => (
    <Flex gap="20px" align="center">
      <Icon name={IconNames[0]} size={12} />
      <Icon name={IconNames[0]} size={16} />
      <Icon name={IconNames[0]} size={24} />
      <Icon name={IconNames[0]} size={32} />
      <Icon name={IconNames[0]} size={48} />
    </Flex>
  ),
}

/* ─────────── Colors ─────────── */
export const Colors: Story = {
  render: () => (
    <Flex gap="24px">
      <Icon name={IconNames[0]} size={24} color={theme.colors.primary[400]} />
      <Icon name={IconNames[0]} size={24} color={theme.colors.success[500]} />
      <Icon name={IconNames[0]} size={24} color={theme.colors.error[500]} />
      <Icon name={IconNames[0]} size={24} color={theme.colors.grayscale[500]} />
    </Flex>
  ),
}

/* ─────────── StrokeWidth ─────────── */
export const StrokeWidth: Story = {
  render: () => (
    <Flex gap="20px" align="center">
      <Icon name={IconNames[0]} size={32} strokeWidth={0} />
      <Icon name={IconNames[0]} size={32} strokeWidth={1} />
      <Icon name={IconNames[0]} size={32} strokeWidth={2} />
    </Flex>
  ),
}

/* ─────────── Icon Gallery (Optional) ─────────── */
export const IconGallery: Story = {
  render: () => (
    <Flex style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
      {IconNames.map((icon) => (
        <Flex key={icon} width={"80px"} align="center" direction="column" gap="6px">
          <Icon name={icon as IconName} size={24} />
          <Typography text={icon} />
        </Flex>
      ))}
    </Flex>
  ),
}

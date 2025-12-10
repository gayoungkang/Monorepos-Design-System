import type { Meta, StoryObj } from "@storybook/react"
import IconButton, { type IconButtonProps } from "./IconButton"
import { ThemeProvider } from "styled-components"
import { theme } from "../tokens/theme"
import { IconNames } from "../Icon/icon-loader"

const meta: Meta<IconButtonProps> = {
  title: "Atoms/Controls/IconButton",
  component: IconButton,
  args: {
    icon: "ArrowLeft",
    size: 16,
    variant: "contained",
    disabled: false,
    disableInteraction: false,
    p: "4px",
  },
  argTypes: {
    icon: {
      control: "select",
      options: IconNames,
      description: "아이콘 이름",
    },
    size: {
      control: "text",
      description: "아이콘 크기",
    },
    variant: {
      control: "radio",
      options: ["contained", "outlined"],
      description: "버튼 variant",
    },
    disabled: {
      control: "boolean",
      description: "비활성화",
    },
    disableInteraction: {
      control: "boolean",
      description: "hover/active 비활성화",
    },

    /* BaseMixinProps */
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

    iconProps: { control: false },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ display: "flex", gap: 20, padding: 40 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<IconButtonProps>

/* ─────────────────────────── Default ─────────────────────────── */
export const Default: Story = {
  args: {
    icon: "AlertTriangle",
  },
}

/* ─────────────────────────── Variants ─────────────────────────── */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16 }}>
      <IconButton {...args} variant="contained" icon="ArrowLeftCircleLine" />
      <IconButton {...args} variant="outlined" icon="ArrowLeftCircleLine" />
    </div>
  ),
}

/* ─────────────────────────── Sizes ─────────────────────────── */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16 }}>
      <IconButton {...args} size={12} icon="ArrowLeftCircleLine" />
      <IconButton {...args} size={16} icon="ArrowLeftCircleLine" />
      <IconButton {...args} size={24} icon="ArrowLeftCircleLine" />
    </div>
  ),
}

/* ─────────────────────────── Disabled ─────────────────────────── */
export const Disabled: Story = {
  args: {
    disabled: true,
    icon: "ClipboardLine",
  },
}

/* ─────────────────────────── DisableInteraction ─────────────────────────── */
export const DisableInteraction: Story = {
  args: {
    disableInteraction: true,
    icon: "BookmarkLine",
  },
}

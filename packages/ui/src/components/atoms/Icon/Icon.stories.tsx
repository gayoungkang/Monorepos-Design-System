import type { Meta, StoryObj } from "@storybook/react";
import Icon, { type IconProps } from "./Icon";
import { ThemeProvider } from "styled-components";
import { theme } from "../../tokens/theme";
import { IconNames } from "./icon-loader";


const meta: Meta<IconProps> = {
  title: "Atoms/Icon",
  component: Icon,
  args: {
    name: "ClipboardLine",
    size: "24px",
  },
  argTypes: {
    name: {
      control: "select",
      options: IconNames,
      description: "아이콘 이름 (IconName)",
    },
    size: {
      control: "text",
      description: "아이콘 크기",
    },
    color: {
      control: "text",
      description: "색상",
    },
    strokeWidth: {
      control: "number",
      description: "stroke-width",
    },

    /* --- BaseMixinProps --- */
    p: { control: "text", description: "padding" },
    pt: { control: "text", description: "padding-top" },
    pr: { control: "text", description: "padding-right" },
    pb: { control: "text", description: "padding-bottom" },
    pl: { control: "text", description: "padding-left" },
    px: { control: "text", description: "padding X-axis" },
    py: { control: "text", description: "padding Y-axis" },

    m: { control: "text", description: "margin" },
    mt: { control: "text", description: "margin-top" },
    mr: { control: "text", description: "margin-right" },
    mb: { control: "text", description: "margin-bottom" },
    ml: { control: "text", description: "margin-left" },
    mx: { control: "text", description: "margin X-axis" },
    my: { control: "text", description: "margin Y-axis" },

    width: { control: "text", description: "width (overridden by size)" },
    height: { control: "text", description: "height (overridden by size)" },

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
};

export default meta;

type Story = StoryObj<IconProps>;

/* ─────────── Default ─────────── */
export const Default: Story = {
  args: {
    name: "ClipboardLine",
  },
};




/* ─────────── Colors ─────────── */
export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Icon name="AlertTriangle" color="#000" />
      <Icon name="ClipboardLine" color="#666" />
      <Icon name="ArrowLeftCircleLine" color="#ff0000" />
    </div>
  ),
};

/* ─────────── Sizes ─────────── */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Icon name="AlertTriangle" size="16px" />
      <Icon name="AlertTriangle" size="24px" />
      <Icon name="AlertTriangle" size="32px" />
    </div>
  ),
};

/* ─────────── Padding ─────────── */
export const WithPadding: Story = {
  render: () => (
    <div style={{ border: "1px solid #ddd" }}>
      <Icon name="ClipboardLine" size="24px" p="8px" />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react"
import { Typography, type TypographyProps } from "./Typography"
import { ThemeProvider } from "styled-components"
import { theme, typographyVariants } from "../../tokens/theme"

const variantOptions = Object.keys(typographyVariants)

const meta: Meta<TypographyProps> = {
  title: "components/Typography",
  component: Typography,
  args: {
    variant: "b1Regular",
    text: "안녕하세요. Typography입니다",
  },

  argTypes: {
    variant: {
      control: "select",
      options: variantOptions,
      description: "폰트 variant",
    },
    text: {
      control: "text",
      description: "표시할 텍스트",
    },
    as: {
      control: "text",
      description: "HTML 태그 변경 (p, span, div, ...)",
    },
    color: {
      control: "text",
      description: "텍스트 색상",
    },
    italic: {
      control: "boolean",
      description: "기울임 여부",
    },
    underline: {
      control: "boolean",
      description: "밑줄 여부",
    },
    ellipsis: {
      control: "boolean",
      description: "말줄임 적용",
    },
    align: {
      control: "radio",
      options: ["left", "center", "right"],
      description: "정렬",
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

    sx: {
      control: false,
      description: "sx style",
    },
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
type Story = StoryObj<TypographyProps>

/* ─────────── Default ─────────── */
export const Default: Story = {}

/* ─────────── Variants ─────────── */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {variantOptions.map((v) => (
        <Typography key={v} variant={v as any} text={v} />
      ))}
    </div>
  ),
}

/* ─────────── Ellipsis ─────────── */
export const Ellipsis: Story = {
  args: {
    text: "아주아주 긴 텍스트입니다. 말줄임 처리가 잘 되는지 확인해보세요",
    ellipsis: true,
    width: "150px",
  },
}

/* ─────────── Italic / Underline ─────────── */
export const StyleOptions: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Typography variant="b1Regular" text="italic" italic />
      <Typography variant="b1Regular" text="underline" underline />
      <Typography variant="b1Regular" text="italic + underline" italic underline />
    </div>
  ),
}

/* ─────────── Newline Example  ─────────── */
export const Linebreak: Story = {
  args: {
    text: "안녕하세요\n줄바꿈\n됩니다",
  },
}

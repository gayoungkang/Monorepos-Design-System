import type { Meta, StoryObj } from "@storybook/react"
import Rating, { type RatingProps } from "./Rating"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import { useState } from "react"
import Flex from "../Flex/Flex"

const meta: Meta<RatingProps> = {
  title: "components/Rating",
  component: Rating,
  args: {
    defaultValue: 2,
    max: 5,
    precision: 1,
    size: 24,
    icon: "★",
    emptyIcon: "☆",
    disabled: false,
    readOnly: false,
    label: "평점",
    LabelPlacement: "top",
  },
  argTypes: {
    value: { control: "number" },
    defaultValue: { control: "number" },
    max: { control: "number" },
    precision: { control: "number" },
    size: { control: "text" },

    icon: { control: "text" },
    emptyIcon: { control: "text" },

    label: { control: "text" },
    LabelPlacement: {
      control: "radio",
      options: ["top", "bottom", "left", "right"],
    },

    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },

    onChange: { action: "change" },
    onChangeActive: { action: "changeActive" },

    // LabelProps는 객체라 control false
    labelProps: {
      control: false,
      description: "Label 컴포넌트에 직접 넘길 props",
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
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ padding: 40 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<RatingProps>

/* ---------------- Default ---------------- */
export const Default: Story = {}

/* ---------------- Precision ---------------- */
export const HalfPrecision: Story = {
  args: { precision: 0.5, defaultValue: 2.5 },
}

/* ---------------- Label Placement ---------------- */
export const LabelPlacements: Story = {
  render: (args) => (
    <Flex direction="column" gap="20px">
      <Rating {...args} label="위" LabelPlacement="top" />
      <Rating {...args} label="아래" LabelPlacement="bottom" />
      <Rating {...args} label="왼쪽" LabelPlacement="left" />
      <Rating {...args} label="오른쪽" LabelPlacement="right" />
    </Flex>
  ),
}

/* ---------------- Disabled ---------------- */
export const Disabled: Story = {
  args: { disabled: true },
}

/* ---------------- ReadOnly ---------------- */
export const ReadOnly: Story = {
  args: { readOnly: true },
}

/* ---------------- Controlled ---------------- */
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<number | null>(3)
    return (
      <Rating
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v)
          console.log("value changed:", v)
        }}
      />
    )
  },
}

/* ---------------- Custom Icons ---------------- */
export const CustomIcon: Story = {
  args: {
    icon: "🔥",
    emptyIcon: "⚪",
    defaultValue: 3,
    size: 28,
  },
}

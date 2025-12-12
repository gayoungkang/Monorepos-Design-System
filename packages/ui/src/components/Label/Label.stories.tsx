import type { Meta, StoryObj } from "@storybook/react"
import Label, { type LabelProps } from "./Label"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"

// -----------------------------------------------------------------------------
// META
// -----------------------------------------------------------------------------
const meta: Meta<LabelProps> = {
  title: "components/Label",
  component: Label,

  args: {
    text: "라벨",
    textAlign: "left",
    placement: "right",
    required: false,
  },

  argTypes: {
    /* --- Main Props --- */
    text: {
      control: "text",
      description: "Label text",
    },
    textAlign: {
      control: "radio",
      options: ["left", "right"],
      description: "text alignment",
    },
    placement: {
      control: "radio",
      options: ["left", "right"],
      description: "placement for required mark (*)",
    },
    required: {
      control: "boolean",
      description: "required mark",
    },

    typographyProps: {
      control: false,
      description: "Typography custom props (Partial<TypographyProps>)",
    },

    /* --- BaseMixinProps --- */
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

type Story = StoryObj<LabelProps>

// -----------------------------------------------------------------------------
// DEFAULT
// -----------------------------------------------------------------------------
export const Default: Story = {}

// -----------------------------------------------------------------------------
// REQUIRED (right, default)
// -----------------------------------------------------------------------------
export const RequiredRight: Story = {
  args: {
    required: true,
  },
}

// -----------------------------------------------------------------------------
// REQUIRED LEFT
// -----------------------------------------------------------------------------
export const RequiredLeft: Story = {
  args: {
    required: true,
    placement: "left",
  },
}

// -----------------------------------------------------------------------------
// TEXT ALIGN RIGHT
// -----------------------------------------------------------------------------
export const TextAlignRight: Story = {
  args: {
    textAlign: "right",
  },
}

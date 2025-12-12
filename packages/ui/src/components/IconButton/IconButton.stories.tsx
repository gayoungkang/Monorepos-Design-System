import type { Meta, StoryObj } from "@storybook/react"
import IconButton, { type IconButtonProps } from "./IconButton"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import { IconNames } from "../Icon/icon-loader"

// -----------------------------------------------------------------------------
// META
// -----------------------------------------------------------------------------
const meta: Meta<IconButtonProps> = {
  title: "components/IconButton",
  component: IconButton,

  args: {
    icon: IconNames[0],
    size: 20,
    variant: "contained",
    disabled: false,
    disableInteraction: false,
  },

  argTypes: {
    /* --- Main Props --- */
    icon: {
      control: "text",
      description: "Icon name",
    },
    size: {
      control: "text",
      description: "Icon size",
    },
    variant: {
      control: "radio",
      options: ["contained", "outlined"],
      description: "Button variant",
    },
    disabled: {
      control: "boolean",
    },
    disableInteraction: {
      control: "boolean",
      description: "Disable hover/active interaction",
    },
    toolTip: {
      control: "text",
      description: "Tooltip text",
    },
    iconProps: {
      control: false,
      description: "Custom icon props (partial IconProps)",
    },

    /* --- Mouse handlers --- */
    onClick: { control: false },
    onMouseDown: { control: false },
    onMouseUp: { control: false },
    onMouseLeave: { control: false },

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

type Story = StoryObj<IconButtonProps>

// -----------------------------------------------------------------------------
// DEFAULT
// -----------------------------------------------------------------------------
export const Default: Story = {
  args: {
    icon: IconNames[0],
  },
}

// -----------------------------------------------------------------------------
// CONTAINED
// -----------------------------------------------------------------------------
export const Contained: Story = {
  args: {
    icon: IconNames[0],
    variant: "contained",
  },
}

// -----------------------------------------------------------------------------
// OUTLINED
// -----------------------------------------------------------------------------
export const Outlined: Story = {
  args: {
    icon: IconNames[1],
    variant: "outlined",
  },
}

// -----------------------------------------------------------------------------
// DISABLED
// -----------------------------------------------------------------------------
export const Disabled: Story = {
  args: {
    icon: IconNames[2],
    disabled: true,
  },
}

// -----------------------------------------------------------------------------
// WITH_TOOLTIP
// -----------------------------------------------------------------------------
export const WithTooltip: Story = {
  args: {
    icon: IconNames[3],
    toolTip: "Tooltip message",
  },
}

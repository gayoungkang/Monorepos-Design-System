import type { Meta, StoryObj } from "@storybook/react"
import Box, { type BoxProps } from "./Box"
import { ThemeProvider } from "styled-components"
import { theme } from "../tokens/theme"

const meta: Meta<BoxProps> = {
  title: "Atoms/Layout/Box",
  component: Box,
  args: {
    as: "div",
    p: "16px",
    width: "200px",
    height: "100px",
    style: {
      backgroundColor: theme.colors.background.dark,
    },
  },
  argTypes: {
    sx: {
      control: false,
      description: "Custom sx style (CSSObject)",
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

type Story = StoryObj<BoxProps>

/* ─────────── Default ─────────── */

export const Default: Story = {
  args: {
    children: "Box Component",
  },
}

/* ─────────── Padding / Margin ─────────── */

export const PaddingMargin: Story = {
  args: {
    p: "20px",
    m: "20px",
    children: "Padding + Margin 적용",
  },
}

/* ─────────── Width / Height ─────────── */

export const SizeControl: Story = {
  args: {
    width: "300px",
    height: "150px",
    children: "Size 조절",
  },
}

/* ─────────── sx ─────────── */

export const WithSx: Story = {
  args: {
    sx: {
      border: "1px solid #333",
      color: "blue",
      "&:hover": {
        color: "red",
      },
    },
    children: "sx prop 적용 (hover)",
  },
}

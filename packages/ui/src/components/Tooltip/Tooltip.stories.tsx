import type { Meta, StoryObj } from "@storybook/react"
import { Tooltip, type TooltipProps } from "./Tooltip"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"

const meta: Meta<TooltipProps> = {
  title: "components/Tooltip",
  component: Tooltip,
  args: {
    content: "툴팁 내용",
    placement: "bottom",
  },
  argTypes: {
    content: {
      control: "text",
      description: "툴팁 텍스트",
    },
    placement: {
      control: "radio",
      options: ["top", "bottom", "left", "right"],
      description: "툴팁 방향",
    },
    maxWidth: {
      control: "text",
      description: "툴팁 최대 너비",
    },
    children: {
      control: false,
      description: "툴팁이 붙을 children",
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ padding: 80 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<TooltipProps>

/* ─────────── Default ─────────── */
export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <button>Hover me</button>
    </Tooltip>
  ),
}

/* ─────────── Placements ─────────── */
export const Placements: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 40, paddingTop: 100 }}>
      <Tooltip {...args} placement="top">
        <button>Top</button>
      </Tooltip>
      <Tooltip {...args} placement="bottom">
        <button>Bottom</button>
      </Tooltip>
      <Tooltip {...args} placement="left">
        <button>Left</button>
      </Tooltip>
      <Tooltip {...args} placement="right">
        <button>Right</button>
      </Tooltip>
    </div>
  ),
}

/* ─────────── Custom Width ─────────── */
export const CustomWidth: Story = {
  args: {
    maxWidth: "150px",
    content: "아주 길게 작성된 텍스트입니다. maxWidth를 넘으면 자동으로 줄바꿈됩니다.",
  },
  render: (args) => (
    <Tooltip {...args}>
      <button>Hover me</button>
    </Tooltip>
  ),
}

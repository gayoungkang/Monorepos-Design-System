import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import Chip, { type ChipProps } from "./Chip"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import { IconNames } from "../Icon/icon-loader"

const meta: Meta<ChipProps> = {
  title: "components/Chip",
  component: Chip,

  args: {
    label: "Chip",
    size: "M",
    variant: "contained",
    disabled: false,
    startIcon: undefined,
    endIcon: undefined,
  },

  argTypes: {
    /* ---------------------------------- UI ---------------------------------- */
    variant: {
      control: "radio",
      options: ["contained", "outlined", "text"],
      description: "Chip 스타일",
    },
    size: {
      control: "radio",
      options: ["S", "M", "L"],
      description: "Chip 크기",
    },
    disabled: {
      control: "boolean",
      description: "비활성화",
    },
    color: {
      control: "text",
      description: "커스텀 배경/테두리 컬러 (선택)",
    },

    /* ---------------------------------- Events ---------------------------------- */
    onClick: { control: false, description: "Chip 클릭 핸들러" },
    onDelete: { control: false, description: "Chip 삭제 핸들러" },

    /* ---------------------------------- Icons ---------------------------------- */
    startIcon: { control: "text", description: "시작 아이콘" },
    endIcon: { control: "text", description: "끝 아이콘" },

    /* ---------------------------------- SubComponents ---------------------------------- */
    iconProps: { control: false, description: "내부 Icon Props" },
    typographyProps: { control: false, description: "Typography Props" },

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

type Story = StoryObj<ChipProps>

/* ─────────── Default ─────────── */
export const Default: Story = {}

/* ─────────── Variants ─────────── */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Chip label="Contained" variant="contained" />
      <Chip label="Outlined" variant="outlined" />
      <Chip label="Text" variant="text" />
    </div>
  ),
}

/* ─────────── Sizes ─────────── */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Chip label="Small" size="S" />
      <Chip label="Medium" size="M" />
      <Chip label="Lage" size="L" />
    </div>
  ),
}

/* ─────────── Icons ─────────── */
export const WithStartIcon: Story = {
  args: {
    label: "Start Icon",
    startIcon: IconNames[0],
  },
}

export const WithEndIcon: Story = {
  args: {
    label: "End Icon",
    endIcon: IconNames[1],
  },
}

export const WithBothIcons: Story = {
  args: {
    label: "With Icons",
    startIcon: IconNames[0],
    endIcon: IconNames[1],
  },
}

/* ─────────── Deletable (삭제 버튼 클릭 가능) ─────────── */
export const Deletable: Story = {
  render: (args) => {
    const [visible, setVisible] = useState(true)

    if (!visible) return <div>삭제됨</div>

    return <Chip {...args} label="삭제 가능" onDelete={() => setVisible(false)} />
  },
}

/* ─────────── Clickable (Chip 자체 클릭 동작) ─────────── */
export const Clickable: Story = {
  render: (args) => {
    const [clicked, setClicked] = useState(false)

    return (
      <Chip {...args} label={clicked ? "클릭됨!" : "Click Me"} onClick={() => setClicked(true)} />
    )
  },
}

/* ─────────── Disabled ─────────── */
export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
  },
}

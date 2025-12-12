import type { Meta, StoryObj } from "@storybook/react"
import Button, { type ButtonProps } from "./Button"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import { IconNames } from "../Icon/icon-loader"

const meta: Meta<ButtonProps> = {
  title: "components/Button",
  component: Button,

  args: {
    text: "Button",
    type: "button",
    colorVariant: "primary",
    variant: "contained",
    size: "M",
    disabled: false,
    loading: false,
  },

  argTypes: {
    /* ---------------------------------- UI ---------------------------------- */
    colorVariant: {
      control: "radio",
      options: ["primary", "secondary", "tertiary"],
      description: "버튼 색상 테마",
    },
    variant: {
      control: "radio",
      options: ["contained", "text", "outlined"],
      description: "버튼 스타일",
    },
    size: {
      control: "radio",
      options: ["S", "M", "L"],
      description: "버튼 크기",
    },
    loading: {
      control: "boolean",
      description: "로딩 상태 (Progress 표시)",
    },
    disabled: {
      control: "boolean",
      description: "버튼 비활성화",
    },

    /* ---------------------------------- Icons ---------------------------------- */
    startIcon: { control: "text", description: "시작 아이콘" },
    endIcon: { control: "text", description: "끝 아이콘" },

    /* ---------------------------------- SubComponents ---------------------------------- */
    iconProps: { control: false, description: "Icon 컴포넌트 props" },
    typographyProps: { control: false, description: "Typography props" },
    progressProps: { control: false, description: "Progress props" },

    /* ---------------------------------- Events ---------------------------------- */
    onClick: { control: false },
    fileUrl: { control: "text", description: "다운로드 파일 URL" },
    fileName: { control: "text", description: "다운로드 파일명" },

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
type Story = StoryObj<ButtonProps>

/* ─────────── Default ─────────── */
export const Default: Story = {
  args: {
    text: "Primary Button",
  },
}

/* ─────────── Variant ─────────── */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button text="Contained" variant="contained" />
      <Button text="Text" variant="text" />
      <Button text="Outlined" variant="outlined" />
    </div>
  ),
}

/* ─────────── Colors ─────────── */
export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button text="Primary" colorVariant="primary" />
      <Button text="Secondary" colorVariant="secondary" />
      <Button text="Tertiary" colorVariant="tertiary" />
    </div>
  ),
}

/* ─────────── Sizes ─────────── */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button text="Small" size="S" />
      <Button text="Medium" size="M" />
      <Button text="Large" size="L" />
    </div>
  ),
}

/* ─────────── With Icons ─────────── */
export const WithStartIcon: Story = {
  args: {
    text: "Start Icon",
    startIcon: IconNames[0],
  },
}

export const WithEndIcon: Story = {
  args: {
    text: "End Icon",
    endIcon: IconNames[1],
  },
}

export const WithBothIcons: Story = {
  args: {
    text: "Both Icons",
    startIcon: IconNames[3],
    endIcon: IconNames[3],
  },
}

/* ─────────── Loading ─────────── */
export const Loading: Story = {
  args: {
    text: "Loading...",
    loading: true,
  },
}

/* ─────────── Disabled ─────────── */
export const Disabled: Story = {
  args: {
    text: "Disabled",
    disabled: true,
  },
}

/* ─────────── File Download ─────────── */
export const FileDownload: Story = {
  args: {
    text: "파일 다운로드",
    fileUrl: "/sample.pdf",
    fileName: "sample.pdf",
  },
}

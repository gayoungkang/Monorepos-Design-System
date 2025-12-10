import type { Meta, StoryObj } from "@storybook/react";
import Button, { type ButtonProps } from "./Button";
import { ThemeProvider } from "styled-components";
import { theme } from "../../tokens/theme";

const meta: Meta<ButtonProps> = {
  title: "Atoms/Controls/Button",
  component: Button,
  args: {
    text: "Button",
    type: "button",
    colorVariant: "primary",
    variant: "contained",
    size: "M",
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

    /* ---------------------------------- Icons ---------------------------------- */
    startIcon: { control: false, description: "시작 아이콘" },
    endIcon: { control: false, description: "끝 아이콘" },

    /* ---------------------------------- SubComponents ---------------------------------- */
    typographyProps: { control: false, description: "Typography 옵션" },
    iconProps: { control: false, description: "Icon 옵션" },
    progressProps: { control: false, description: "Progress 옵션" },

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
};

export default meta;

type Story = StoryObj<ButtonProps>;

/* ─────────── Default ─────────── */
export const Default: Story = {
  args: {
    text: "Primary Button",
  },
};

/* ─────────── Variant ─────────── */
export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button text="Contained" variant="contained" />
      <Button text="Text" variant="text" />
      <Button text="Outlined" variant="outlined" />
    </div>
  ),
};

/* ─────────── Sizes ─────────── */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button text="Small" size="S" />
      <Button text="Medium" size="M" />
      <Button text="Large" size="L" />
    </div>
  ),
};

/* ─────────── Colors ─────────── */
export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button text="Primary" colorVariant="primary" />
      <Button text="Secondary" colorVariant="secondary" />
      <Button text="Tertiary" colorVariant="tertiary" />
    </div>
  ),
};

/* ─────────── With Icon ─────────── */
export const WithStartIcon: Story = {
  args: {
    text: "Clipboard",
    startIcon: "ClipboardLine",
  },
};

export const WithEndIcon: Story = {
  args: {
    text: "BookmarkLine",
    endIcon: "BookmarkLine",
  },
};

/* ─────────── Download ─────────── */
export const FileDownload: Story = {
  args: {
    text: "파일 다운로드",
    fileUrl: "/sample.pdf",
    fileName: "sample.pdf",
  },
};

/* ─────────── Disabled ─────────── */
export const Disabled: Story = {
  args: {
    text: "Disabled",
    disabled: true,
  },
};

/* ─────────── Loading ─────────── */
export const Loading: Story = {
  args: {
    text: "Loading...",
    loading: true,
  },
};

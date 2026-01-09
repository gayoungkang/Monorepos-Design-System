import type { Meta, StoryObj } from "@storybook/react"
import Box, { type BoxProps } from "./Box"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"

const meta: Meta<BoxProps> = {
  title: "components/Box",
  component: Box,

  args: {
    as: "div",
    children: "Box Content",
  },

  argTypes: {
    /* ---------------------------------- HTML + Custom ---------------------------------- */
    as: {
      control: "text",
      description: "렌더링할 HTML 태그 (div, span, section 등)",
    },
    children: {
      control: "text",
      description: "Box 내부에 렌더링될 콘텐츠",
    },

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

    sx: { control: false, description: "스타일 오버라이드" },
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
export const Default: Story = {}

/* ─────────── Padding & Margin ─────────── */
export const Spacing: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20 }}>
      <Box p="16px" bgColor={theme.colors.primary[100]}>
        Padding 16px
      </Box>

      <Box m="16px" p="8px" bgColor={theme.colors.primary[200]}>
        Margin 16px + Padding 8px
      </Box>
    </div>
  ),
}

/* ─────────── As Prop ─────────── */
export const AsProp: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20 }}>
      <Box as="section" p="12px" bgColor={theme.colors.primary[100]}>
        section 요소
      </Box>

      <Box as="article" p="4px" bgColor={theme.colors.primary[200]}>
        article 요소
      </Box>

      <Box as="header" p="8px" bgColor={theme.colors.primary[300]}>
        header 요소
      </Box>
    </div>
  ),
}

/* ─────────── Custom Style (sx) ─────────── */
export const CustomStyle: Story = {
  args: {
    bgColor: theme.colors.primary[100],
    sx: {
      borderRadius: "8px",
      padding: "12px",
      border: `1px solid ${theme.colors.primary[300]}`,
    },
    children: "Custom Styled Box",
  },
}

/* ─────────── Children Rendering ─────────── */
export const ChildrenExample: Story = {
  render: () => (
    <Box p="16px" bgColor={theme.colors.primary[100]}>
      <h3>타이틀</h3>
      <p>박스 내부에 다양한 콘텐츠를 넣을 수 있습니다.</p>
    </Box>
  ),
}

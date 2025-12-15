import type { Meta, StoryObj } from "@storybook/react"
import HelperText, { type HelperTextProps } from "./HelperText"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"

const meta: Meta<HelperTextProps> = {
  title: "components/HelperText",
  component: HelperText,

  args: {
    text: "도움말 텍스트입니다.",
    status: "default",
  },

  argTypes: {
    /* ---------------------------------- UI ---------------------------------- */
    text: {
      control: "text",
      description: "표시할 메시지 텍스트",
    },
    status: {
      control: "radio",
      options: ["default", "error", "success", "info"],
      description: "상태에 따른 컬러/아이콘 변경",
    },

    /* ---------------------------------- Sub Components ---------------------------------- */
    typographyProps: { control: false, description: "Typography 커스텀 옵션" },
    iconProps: { control: false, description: "Icon 커스텀 옵션" },

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
type Story = StoryObj<HelperTextProps>

/* ─────────── Default ─────────── */
export const Default: Story = {}

/* ─────────── Status Variants ─────────── */
export const StatusVariants: Story = {
  render: () => (
    <Flex direction="column" gap="12px">
      <HelperText text="기본 상태 메시지" status="default" />
      <HelperText text="에러가 발생했습니다." status="error" />
      <HelperText text="성공적으로 완료되었습니다." status="success" />
      <HelperText text="추가 정보가 있습니다." status="info" />
    </Flex>
  ),
}

/* ─────────── Multi-line Text ─────────── */
export const MultiLine: Story = {
  args: {
    text: "첫 번째 줄\n두 번째 줄\n세 번째 줄",
    status: "info",
  },
}

/* ─────────── Custom Icon/Text Props ─────────── */
export const CustomStyling: Story = {
  args: {
    text: "커스텀 스타일 적용",
    status: "success",
    typographyProps: {
      variant: "b1Medium",
    },
    iconProps: {
      size: 16,
    },
  },
}

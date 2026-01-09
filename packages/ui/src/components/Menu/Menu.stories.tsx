import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import Menu, { type MenuProps } from "./Menu"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import { IconNames } from "../Icon/icon-loader"

/* -------------------------------------------------------------------------- */
/*                                  Meta 설정                                  */
/* -------------------------------------------------------------------------- */

const meta: Meta<MenuProps> = {
  title: "components/Menu",
  component: Menu,

  args: {
    text: "메뉴 아이템",
    size: "M",
    disabled: false,
    selected: false,
  },

  argTypes: {
    /* ---------------------------------- UI ---------------------------------- */
    text: { control: "text", description: "메뉴 텍스트" },
    size: {
      control: "radio",
      options: ["S", "M", "L"],
      description: "메뉴 크기",
    },
    selected: { control: "boolean", description: "선택 상태" },
    disabled: { control: "boolean", description: "비활성화 여부" },

    startIcon: {
      control: "text",
      description: "시작 아이콘(IconName)",
    },
    endIcon: {
      control: "text",
      description: "끝 아이콘(IconName)",
    },

    onClick: { control: false },

    /* -------------------------------- BaseMixinProps ------------------------------- */
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
    bgColor: { control: "text" },

    sx: { control: "object" },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ width: "240px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<MenuProps>

/* -------------------------------------------------------------------------- */
/*                                   Stories                                   */
/* -------------------------------------------------------------------------- */

/* --------------------------------- Default --------------------------------- */
export const Default: Story = {
  args: {
    text: "기본 메뉴",
  },
}

/* --------------------------------- Selected -------------------------------- */
export const Selected: Story = {
  args: {
    text: "선택됨",
    selected: true,
  },
}

/* -------------------------------- Disabled --------------------------------- */
export const Disabled: Story = {
  args: {
    text: "비활성 메뉴",
    disabled: true,
  },
}

/* ------------------------------ Icon Variants ------------------------------ */
export const Icons: Story = {
  render: () => (
    <Flex direction="column" gap="12px">
      <Menu text="start Icon" startIcon={IconNames[0]} />
      <Menu text="end Icon" endIcon={IconNames[1]} />
      <Menu text="start Icon + end Icon" startIcon={IconNames[0]} endIcon={IconNames[0]} />
      <Menu
        text="start Icon + end Icon + selected"
        startIcon={IconNames[0]}
        endIcon={IconNames[0]}
        selected
      />
    </Flex>
  ),
}

/* ------------------------------ Size Variants ------------------------------ */
export const Sizes: Story = {
  render: () => (
    <Flex direction="column" gap="12px">
      <Menu text="Small 메뉴" size="S" />
      <Menu text="Medium 메뉴" size="M" />
      <Menu text="Large 메뉴" size="L" />
    </Flex>
  ),
}

/* ------------------------------ Playground --------------------------------- */
export const Playground: Story = {
  args: {
    text: "플레이그라운드 메뉴",
    size: "M",
    selected: false,
    disabled: false,
  },
}

import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { ThemeProvider } from "styled-components"
import TextField, { textFieldProps } from "./TextField"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"

/* -------------------------------------------------------------------------- */
/*                          Interactive Wrapper (필수)                         */
/* -------------------------------------------------------------------------- */
/* 
Storybook Controls가 value를 변경해도 사용자가 직접 입력할 수 있도록
TextField를 내부적으로 state로 감싸는 wrapper
*/

const TextFieldInteractive = (props: textFieldProps) => {
  const [value, setValue] = useState(props.value ?? "")

  return (
    <TextField
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        props.onChange?.(e)
      }}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                  META 설정                                  */
/* -------------------------------------------------------------------------- */

const meta: Meta<textFieldProps> = {
  title: "components/TextField",
  component: TextFieldInteractive,

  args: {
    variant: "outlined",
    size: "M",
    placeholder: "입력하세요...",
    label: "기본 텍스트필드",
    required: false,
    disabled: false,
    error: false,
    helperText: "",
    multiline: false,
    clearable: true,
    type: "text",
    labelPlacement: "top",
  },

  argTypes: {
    /* ------------------------------ UI Props ------------------------------ */
    variant: {
      control: "radio",
      options: ["outlined", "filled", "standard"],
    },
    size: {
      control: "radio",
      options: ["S", "M", "L"],
    },
    type: {
      control: "radio",
      options: ["text", "password", "search"],
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    required: { control: "boolean" },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
    clearable: { control: "boolean" },

    multiline: { control: "boolean" },
    rows: { control: "number" },

    onlyNumber: { control: "boolean" },
    maxLength: { control: "number" },

    startIcon: { control: "text" },
    endIcon: { control: "text" },

    labelPlacement: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },

    /* ------------------------------ 이벤트는 control 제외 ------------------------------ */
    value: { control: false },
    onChange: { control: false },

    /* ------------------------------ BaseMixinProps ------------------------------ */
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

    sx: {
      control: "object",
      table: {
        type: {
          summary: "SxProps",
        },
      },
    },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Box width="400px">
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<textFieldProps>

/* -------------------------------------------------------------------------- */
/*                                   STORIES                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {}

export const Password: Story = {
  args: {
    type: "password",
    label: "비밀번호",
  },
}

export const Search: Story = {
  args: {
    type: "search",
    label: "검색",
    placeholder: "검색어 입력",
  },
}

export const WithIcons: Story = {
  args: {
    label: "아이콘 포함",
    startIcon: "SearchLine",
    endIcon: "Check",
  },
}

export const ErrorState: Story = {
  args: {
    label: "에러 상태",
    error: true,
    helperText: "올바르지 않은 값입니다.",
  },
}

export const Disabled: Story = {
  args: {
    label: "비활성화",
    disabled: true,
    placeholder: "입력 불가",
  },
}

export const Multiline: Story = {
  args: {
    multiline: true,
    rows: 5,
    label: "멀티라인 텍스트",
    placeholder: "여러 줄을 입력하세요...",
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Flex direction="column" gap="20px">
      <TextFieldInteractive {...args} size="S" label="Small" />
      <TextFieldInteractive {...args} size="M" label="Medium" />
      <TextFieldInteractive {...args} size="L" label="Large" />
    </Flex>
  ),
}

export const LabelPlacements: Story = {
  render: (args) => (
    <Flex direction="column" gap="24px">
      <TextFieldInteractive {...args} labelPlacement="top" label="Top" />
      <TextFieldInteractive {...args} labelPlacement="bottom" label="Bottom" />
      <TextFieldInteractive {...args} labelPlacement="left" label="Left" />
      <TextFieldInteractive {...args} labelPlacement="right" label="Right" />
    </Flex>
  ),
}

export const DemoGrid: Story = {
  render: () => (
    <Flex direction="column" gap="32px">
      <TextFieldInteractive label="기본" placeholder="입력하세요" />
      <TextFieldInteractive label="비밀번호" type="password" />
      <TextFieldInteractive label="검색" type="search" />
      <TextFieldInteractive label="에러" error helperText="필수 입력입니다." />
      <TextFieldInteractive label="멀티라인" multiline rows={4} />
    </Flex>
  ),
}

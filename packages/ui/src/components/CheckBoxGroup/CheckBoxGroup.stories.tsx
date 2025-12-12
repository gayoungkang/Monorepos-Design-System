import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { ThemeProvider } from "styled-components"

import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import CheckBoxGroup, { CheckBoxProps } from "./CheckBoxGroup"
import { Typography } from "../Typography/Typography"

/* -------------------------------------------------------------------------- */
/*                          Interactive Wrapper (핵심)                        */
/* -------------------------------------------------------------------------- */

const CheckBoxGroupInteractive = (props: CheckBoxProps) => {
  const [value, setValue] = useState(props.value ?? [])

  return (
    <Box>
      <CheckBoxGroup
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next)
          props.onChange?.(next)
        }}
      />
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Meta 설정                                  */
/* -------------------------------------------------------------------------- */

const meta: Meta<CheckBoxProps> = {
  title: "components/CheckBoxGroup",
  component: CheckBoxGroupInteractive,

  args: {
    label: "옵션 선택",
    required: false,
    direction: "horizontal",
    disabled: false,
    allCheck: false,
    helperText: "",
    error: false,
    data: [
      { text: "옵션 1", value: "1" },
      { text: "옵션 2", value: "2" },
      { text: "옵션 3", value: "3" },
    ],
    value: [],
    labelPlacement: "top",
    size: "M",
  },

  argTypes: {
    /* ---------------------------------- UI Props ---------------------------------- */
    label: { control: "text", description: "그룹 라벨 텍스트" },
    required: { control: "boolean", description: "필수 여부 표시" },

    direction: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "체크박스 배치 방향",
    },

    size: {
      control: "radio",
      options: ["S", "M", "L"],
      description: "체크박스 크기",
    },

    disabled: { control: "boolean", description: "전체 비활성화 여부" },

    allCheck: { control: "boolean", description: "전체선택 기능 활성화" },
    allCheckText: { control: "text", description: "전체선택 텍스트" },

    helperText: { control: "text", description: "헬퍼 텍스트" },
    error: { control: "boolean", description: "에러 상태" },

    labelPlacement: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "라벨 위치",
    },

    data: { control: false },
    value: { control: false },
    onChange: { control: false },
    onBlur: { control: false },

    /* ---------------------------------- BaseMixinProps ---------------------------------- */
    p: { control: "text", description: "padding" },
    pt: { control: "text", description: "padding-top" },
    pr: { control: "text", description: "padding-right" },
    pb: { control: "text", description: "padding-bottom" },
    pl: { control: "text", description: "padding-left" },
    px: { control: "text", description: "padding-left & padding-right" },
    py: { control: "text", description: "padding-top & padding-bottom" },
    m: { control: "text", description: "margin" },
    mt: { control: "text", description: "margin-top" },
    mr: { control: "text", description: "margin-right" },
    mb: { control: "text", description: "margin-bottom" },
    ml: { control: "text", description: "margin-left" },
    mx: { control: "text", description: "margin-left & margin-right" },
    my: { control: "text", description: "margin-top & margin-bottom" },

    width: { control: "text" },
    height: { control: "text" },
    backgroundColor: { control: "text" },

    /* -------------------------------------- SxProps ------------------------------------- */
    sx: {
      control: "object",
      description: "Custom style object (SxProps)",
      table: {
        type: {
          summary: "SxProps",
          detail: `
type SxProps = CSSObject & {
  [K in \`&:\${string}\` | \`@\${string}\`]?: CSSObject
}
          `,
        },
      },
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

type Story = StoryObj<CheckBoxProps>

/* -------------------------------------------------------------------------- */
/*                                   Stories                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
}

/* ------------------------------ Direction Examples ------------------------------ */
export const Horizontal: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { direction: "horizontal" },
}

export const Vertical: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { direction: "vertical" },
}

/* ---------------------------------- Sizes ---------------------------------- */

/* ------------------------------ Size Variants All ------------------------------ */
export const Sizes: Story = {
  render: (args) => (
    <Flex direction="column" gap="24px">
      {/* Small */}
      <Box>
        <Typography text="Size: S" variant="b2Regular" mb={6} />
        <CheckBoxGroupInteractive
          {...args}
          size="S"
          label="Small Checkbox"
          data={[
            { text: "옵션 1", value: "1" },
            { text: "옵션 2", value: "2" },
          ]}
        />
      </Box>

      {/* Medium */}
      <Box>
        <Typography text="Size: M" variant="b2Regular" mb={6} />
        <CheckBoxGroupInteractive
          {...args}
          size="M"
          label="Medium Checkbox"
          data={[
            { text: "옵션 1", value: "1" },
            { text: "옵션 2", value: "2" },
          ]}
        />
      </Box>

      {/* Large */}
      <Box>
        <Typography text="Size: L" variant="b2Regular" mb={6} />
        <CheckBoxGroupInteractive
          {...args}
          size="L"
          label="Large Checkbox"
          data={[
            { text: "옵션 1", value: "1" },
            { text: "옵션 2", value: "2" },
          ]}
        />
      </Box>
    </Flex>
  ),
  args: {},
}

/* ---------------------------------- Label ---------------------------------- */
export const WithLabel: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { label: "선택하세요", required: true },
}

/* --------------------------- Label Placement --------------------------- */
export const LabelTop: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { labelPlacement: "top" },
}

export const LabelBottom: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { labelPlacement: "bottom" },
}

export const LabelLeft: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { labelPlacement: "left" },
}

export const LabelRight: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { labelPlacement: "right" },
}

/* ------------------------------ AllCheck ------------------------------ */
export const WithAllCheck: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { allCheck: true, allCheckText: "전체 선택" },
}

/* ------------------------------ Disabled ------------------------------ */
export const Disabled: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { disabled: true },
}

/* ------------------------------- Error -------------------------------- */
export const ErrorState: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: { error: true, helperText: "필수 항목입니다." },
}

/* ------------------------------ Custom Data ------------------------------ */
export const CustomData: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: {
    data: [
      { text: "Apple", value: "apple" },
      { text: "Banana", value: "banana" },
      { text: "Grape", value: "grape" },
    ],
  },
}

/* ----------------------------- Playground ----------------------------- */
export const Playground: Story = {
  render: (args) => <CheckBoxGroupInteractive {...args} />,
  args: {
    allCheck: true,
    required: true,
    label: "플레이그라운드",
  },
}

/* ------------------------------ Demo Grid ------------------------------ */
export const DemoGrid: Story = {
  render: () => (
    <Flex direction="column" gap="24px">
      <Box>
        <CheckBoxGroupInteractive
          label="기본 방향"
          data={[
            { text: "옵션1", value: "1" },
            { text: "옵션2", value: "2" },
          ]}
        />
      </Box>

      <Box>
        <CheckBoxGroupInteractive
          label="세로 방향"
          direction="vertical"
          data={[
            { text: "옵션1", value: "1" },
            { text: "옵션2", value: "2" },
            { text: "옵션3", value: "3" },
          ]}
        />
      </Box>

      <Box>
        <CheckBoxGroupInteractive
          label="전체 선택"
          allCheck
          allCheckText="전체"
          data={[
            { text: "옵션1", value: "1" },
            { text: "옵션2", value: "2" },
            { text: "옵션3", value: "3" },
          ]}
        />
      </Box>

      <Box>
        <CheckBoxGroupInteractive
          label="에러 상태"
          error
          helperText="필수 체크하세요"
          data={[
            { text: "옵션1", value: "1" },
            { text: "옵션2", value: "2" },
          ]}
        />
      </Box>
    </Flex>
  ),
}

import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { ThemeProvider } from "styled-components"

import RadioGroup from "./RadioGroup"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"

/* -------------------------------------------------------------------------- */
/*                          Interactive Wrapper (필수)                         */
/* -------------------------------------------------------------------------- */

const RadioGroupInteractive = (props: any) => {
  const [value, setValue] = useState(props.value ?? null)

  return (
    <RadioGroup
      {...props}
      value={value}
      onChange={(v) => {
        setValue(v)
        props.onChange?.(v)
      }}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                   META                                      */
/* -------------------------------------------------------------------------- */

const meta: Meta<any> = {
  title: "components/RadioGroup",
  component: RadioGroupInteractive,

  args: {
    label: "라디오 선택",
    required: false,
    direction: "horizontal",
    disabled: false,
    size: "M",
    error: false,
    helperText: "",
    labelPlacement: "top",
    data: [
      { text: "옵션 1", value: "1" },
      { text: "옵션 2", value: "2" },
      { text: "옵션 3", value: "3" },
    ],
    value: "",
  },

  argTypes: {
    /* ------------------------------ UI Props ------------------------------ */
    label: { control: "text" },
    required: { control: "boolean" },

    size: {
      control: "radio",
      options: ["S", "M", "L"],
      description: "라디오 크기",
    },

    direction: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "배치 방향",
    },

    disabled: { control: "boolean" },
    error: { control: "boolean" },
    helperText: { control: "text" },

    labelPlacement: {
      control: "select",
      options: ["top-start", "top-end", "bottom-start", "bottom-end", "left", "right"],
    },

    name: { control: "text" },

    data: { control: false },
    value: { control: false },

    /* -------------------------- BaseMixinProps -------------------------- */
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
    backgroundColor: { control: "text" },

    sx: {
      control: "object",
      table: { type: { summary: "SxProps" } },
    },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Box width="360px">
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<any>

/* -------------------------------------------------------------------------- */
/*                                  STORIES                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {}

export const Horizontal: Story = {
  args: { direction: "horizontal" },
}

export const Vertical: Story = {
  args: { direction: "vertical" },
}

export const WithLabel: Story = {
  args: {
    label: "라벨 포함",
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const ErrorState: Story = {
  args: {
    error: true,
    helperText: "필수 항목입니다.",
  },
}

/* -------------------------------------------------------------------------- */
/*                                 SIZE VARIANTS                               */
/* -------------------------------------------------------------------------- */

export const Sizes: Story = {
  render: (args) => (
    <Flex direction="column" gap="20px">
      <RadioGroupInteractive {...args} size="S" label="Size S" />
      <RadioGroupInteractive {...args} size="M" label="Size M" />
      <RadioGroupInteractive {...args} size="L" label="Size L" />
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                             LABEL PLACEMENTS                                */
/* -------------------------------------------------------------------------- */

export const LabelPositions: Story = {
  render: (args) => (
    <Flex direction="column" gap="24px">
      <RadioGroupInteractive {...args} labelPlacement="top" label="Top" />
      <RadioGroupInteractive {...args} labelPlacement="bottom" label="Bottom" />
      <RadioGroupInteractive {...args} labelPlacement="left" label="Left" />
      <RadioGroupInteractive {...args} labelPlacement="right" label="Right" />
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                  CUSTOM DATA                                */
/* -------------------------------------------------------------------------- */

export const CustomData: Story = {
  args: {
    data: [
      { text: "Apple", value: "apple" },
      { text: "Banana", value: "banana" },
      { text: "Grape", value: "grape" },
    ],
  },
}

/* -------------------------------------------------------------------------- */
/*                                   DEMO GRID                                 */
/* -------------------------------------------------------------------------- */

export const DemoGrid: Story = {
  render: () => (
    <Flex direction="column" gap="24px">
      <Box>
        <RadioGroupInteractive
          label="기본"
          data={[
            { text: "옵션 1", value: "1" },
            { text: "옵션 2", value: "2" },
          ]}
        />
      </Box>

      <Box>
        <RadioGroupInteractive
          direction="vertical"
          label="세로 모드"
          data={[
            { text: "A", value: "A" },
            { text: "B", value: "B" },
            { text: "C", value: "C" },
          ]}
        />
      </Box>

      <Box>
        <RadioGroupInteractive
          label="에러 상태"
          error
          helperText="필수 선택입니다."
          data={[
            { text: "Yes", value: "yes" },
            { text: "No", value: "no" },
          ]}
        />
      </Box>

      <Box>
        <RadioGroupInteractive
          label="사이즈 비교"
          size="M"
          data={[
            { text: "Small", value: "S" },
            { text: "Medium", value: "M" },
            { text: "Large", value: "L" },
          ]}
        />
      </Box>
    </Flex>
  ),
}

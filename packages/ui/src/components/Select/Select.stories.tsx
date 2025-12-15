import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"

import Flex from "../Flex/Flex"
import Select, { SelectOptionType, SelectProps } from "./Select"

/* ---------------------------------------------------------------------
 * 공통 옵션
 * ------------------------------------------------------------------- */
const sampleOptions: SelectOptionType[] = [
  { value: "1", label: "옵션 1" },
  { value: "2", label: "옵션 2" },
  { value: "3", label: "옵션 3" },
]

/* ---------------------------------------------------------------------
 * 타입 분리: 단일 / 멀티
 * ------------------------------------------------------------------- */
type SingleSelectProps = SelectProps<string>
type MultiSelectProps = SelectProps<string[]>

/* ---------------------------------------------------------------------
 * Meta 설정 (단일 선택 기준)
 * ------------------------------------------------------------------- */
const meta: Meta<SingleSelectProps> = {
  title: "components/Select",
  component: Select as unknown as (props: SingleSelectProps) => JSX.Element,

  args: {
    label: "Select Label",
    placeholder: "선택",
    options: sampleOptions,
    size: "M",
    variant: "outlined",
  },

  /* -------------------------------------------------------------------
   * ArgTypes
   * ------------------------------------------------------------------- */
  argTypes: {
    /* Select 기본 UI 옵션 */
    label: { control: "text" },
    placeholder: { control: "text" },
    size: {
      control: "radio",
      options: ["S", "M", "L"],
    },
    variant: {
      control: "radio",
      options: ["outlined", "filled", "standard"],
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    required: { control: "boolean" },
    readOnly: { control: "boolean" },
    isLoading: { control: "boolean" },

    multipleType: {
      control: "radio",
      options: ["default", "chip", "multiple"],
    },

    /* BaseMixinProps */
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

    /* sx는 object라 컨트롤 비활성화 */
    sx: { control: false },

    /* popperProps는 내부에서만 사용 (anchorRef, children, open 등) */
    popperProps: {
      table: { disable: true },
    },

    /* 서브 컴포넌트용 props 제어 비활성화 */
    labelProps: { table: { disable: true } },
    typographyProps: { table: { disable: true } },

    /* 이벤트 핸들러들 Storybook에서 직접 제어하지 않음 */
    onChange: { table: { disable: true } },
    onBlur: { table: { disable: true } },
    onFocus: { table: { disable: true } },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ padding: "24px" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

/* ---------------------------------------------------------------------
 * Story 타입 분리
 * ------------------------------------------------------------------- */
type SingleStory = StoryObj<SingleSelectProps>
type MultiStory = StoryObj<MultiSelectProps>

/* ---------------------------------------------------------------------
 * 기본 Default (단일)
 * ------------------------------------------------------------------- */
export const Default: SingleStory = {
  args: {},
}

/* ---------------------------------------------------------------------
 * Sizes
 * ------------------------------------------------------------------- */
export const Sizes: SingleStory = {
  render: () => (
    <Flex direction="column" gap="16px" width="240px">
      <Select label="Size S" size="S" options={sampleOptions} />
      <Select label="Size M" size="M" options={sampleOptions} />
      <Select label="Size L" size="L" options={sampleOptions} />
    </Flex>
  ),
}

/* ---------------------------------------------------------------------
 * Variants
 * ------------------------------------------------------------------- */
export const Variants: SingleStory = {
  render: () => (
    <Flex direction="column" gap="16px" width="240px">
      <Select label="Outlined" variant="outlined" options={sampleOptions} />
      <Select label="Filled" variant="filled" options={sampleOptions} />
      <Select label="Standard" variant="standard" options={sampleOptions} />
    </Flex>
  ),
}

/* ---------------------------------------------------------------------
 * Disabled
 * ------------------------------------------------------------------- */
export const DisabledVariants: SingleStory = {
  render: (args) => {
    return (
      <Flex direction="column" gap="16px">
        <Select {...args} label="Outlined Disabled" variant="outlined" disabled value="A" />
        <Select {...args} label="Filled Disabled" variant="filled" disabled value="A" />
        <Select {...args} label="Standard Disabled" variant="standard" disabled value="A" />
      </Flex>
    )
  },
  args: {
    options: sampleOptions,
    placeholder: "선택",
    size: "M",
  },
}

/* ---------------------------------------------------------------------
 * Error
 * ------------------------------------------------------------------- */
export const ErrorState: SingleStory = {
  args: {
    error: true,
    helperText: "에러가 있습니다.",
  },
}

/* ---------------------------------------------------------------------
 * Loading
 * ------------------------------------------------------------------- */
export const Loading: SingleStory = {
  args: {
    isLoading: true,
  },
}

/* ---------------------------------------------------------------------
 * Multiple Default (value: string[])
 * ------------------------------------------------------------------- */
export const Multiple: MultiStory = {
  args: {
    multipleType: "default",
    value: ["1", "2"],
    options: sampleOptions,
  },
}

/* ---------------------------------------------------------------------
 * Chip Multiple (value: string[])
 * ------------------------------------------------------------------- */
export const ChipMultiple: MultiStory = {
  args: {
    multipleType: "chip",
    value: ["1", "3"],
    options: sampleOptions,
  },
}

/* ---------------------------------------------------------------------
 * Playground
 * ------------------------------------------------------------------- */
export const Playground: SingleStory = {
  args: {
    label: "Playground",
    placeholder: "선택",
  },
}

import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import ToggleButton, { type ToggleButtonProps } from "./ToggleButton"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import { IconNames } from "../Icon/icon-loader"
import Flex from "../Flex/Flex"

const meta: Meta<ToggleButtonProps> = {
  title: "components/ToggleButton",
  component: ToggleButton,

  args: {
    orientation: "horizontal",
    size: "M",
    disabled: false,
    required: false,
    selectedValue: "1",
    label: "옵션 선택",
    buttons: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
    ],
  },

  argTypes: {
    /* ─────────── UI Options ─────────── */
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "토글 버튼 정렬 방향",
    },
    size: {
      control: "radio",
      options: ["S", "M", "L"],
      description: "토글 버튼 크기",
    },
    selectedValue: {
      control: "text",
      description: "현재 선택된 value 값",
    },
    label: {
      control: "text",
      description: "그룹 라벨",
    },
    required: { control: "boolean", description: "필수 여부" },
    disabled: { control: "boolean", description: "비활성화 여부" },

    /* ─────────── Buttons ─────────── */
    buttons: {
      control: "object",
      description:
        "버튼 배열: { startIcon?: IconName; endIcon?: IconName; label?: string; value: string }[]",
    },

    /* ─────────── Sub Components ─────────── */
    iconProps: { control: false, description: "아이콘 공통 옵션" },
    labelProps: { control: false, description: "라벨 공통 옵션" },

    /* ─────────── BaseMixinProps ─────────── */
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

type Story = StoryObj<ToggleButtonProps>

/* ─────────── Default ─────────── */
export const Default: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(args.selectedValue ?? "1")

    return (
      <ToggleButton {...args} selectedValue={selected} onClick={(value) => setSelected(value)} />
    )
  },
}

/* ─────────── Variants (icon-only, text-only, icon+text 조합) ─────────── */
export const Variants: Story = {
  render: () => {
    const [selected, setSelected] = useState("1")

    return (
      <Flex gap="12px">
        <ToggleButton
          buttons={[
            { startIcon: IconNames[0], value: "1" }, // icon-only
            { label: "텍스트", value: "2" }, // label-only
            { endIcon: IconNames[1], value: "3" }, // icon-only (right)
          ]}
          selectedValue={selected}
          onClick={setSelected}
          label="Variants"
        />
      </Flex>
    )
  },
}

/* ─────────── Sizes (S, M, L 각각 독립 상태) ─────────── */
export const Sizes: Story = {
  render: () => {
    const [selectedS, setSelectedS] = useState("1")
    const [selectedM, setSelectedM] = useState("1")
    const [selectedL, setSelectedL] = useState("1")

    const buttons = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
    ]

    return (
      <Flex direction="column" gap="16px">
        <ToggleButton
          size="S"
          buttons={buttons}
          selectedValue={selectedS}
          onClick={setSelectedS}
          label="Size S"
        />
        <ToggleButton
          size="M"
          buttons={buttons}
          selectedValue={selectedM}
          onClick={setSelectedM}
          label="Size M"
        />
        <ToggleButton
          size="L"
          buttons={buttons}
          selectedValue={selectedL}
          onClick={setSelectedL}
          label="Size L"
        />
      </Flex>
    )
  },
}

/* ─────────── Orientation (가로 / 세로 비교) ─────────── */
export const Orientation: Story = {
  render: () => {
    const [selectedH, setSelectedH] = useState("1")
    const [selectedV, setSelectedV] = useState("1")

    const buttons = [
      { label: "A", value: "1" },
      { label: "B", value: "2" },
      { label: "C", value: "3" },
    ]

    return (
      <Flex gap="24px">
        <ToggleButton
          orientation="horizontal"
          buttons={buttons}
          selectedValue={selectedH}
          onClick={setSelectedH}
          label="Horizontal"
        />

        <ToggleButton
          orientation="vertical"
          buttons={buttons}
          selectedValue={selectedV}
          onClick={setSelectedV}
          label="Vertical"
        />
      </Flex>
    )
  },
}

/* ─────────── With Icons (startIcon + endIcon 포함 조합) ─────────── */
export const WithIcons: Story = {
  render: () => {
    const [selected, setSelected] = useState("1")

    return (
      <Flex gap="12px">
        <ToggleButton
          buttons={[
            { startIcon: IconNames[0], value: "1" },
            { label: "Option 2", value: "2" },
            {
              startIcon: IconNames[1],
              endIcon: IconNames[2],
              label: "양쪽 아이콘",
              value: "3",
            },
          ]}
          selectedValue={selected}
          onClick={setSelected}
          label="With Icons"
        />
      </Flex>
    )
  },
}

/* ─────────── Disabled ─────────── */
export const Disabled: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(args.selectedValue ?? "1")

    return <ToggleButton {...args} disabled selectedValue={selected} onClick={setSelected} />
  },
}

/* ─────────── Required ─────────── */
export const Required: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(args.selectedValue ?? "1")

    return <ToggleButton {...args} required selectedValue={selected} onClick={setSelected} />
  },
}

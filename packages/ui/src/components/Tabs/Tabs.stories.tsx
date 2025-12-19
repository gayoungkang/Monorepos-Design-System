import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import { TabProps, Tabs } from "./Tabs"
import Box from "../Box/Box"

const meta: Meta<TabProps> = {
  title: "components/Tabs",
  component: Tabs,
  args: {
    size: "M",
    value: "tab1",
    color: "primary",
    options: [
      { label: "탭 1", value: "tab1" },
      { label: "탭 2", value: "tab2" },
      { label: "탭 3", value: "tab3" },
      { label: "탭 4", value: "tab4" },
      { label: "탭 5", value: "tab5" },
      { label: "탭 6", value: "tab6" },
    ],
    scrollbarVisible: false,
    scrollButtonsVisible: false,
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["S", "M", "L"],
      description: "탭 높이/폰트 크기 사이즈",
    },
    value: {
      control: false,
      description: "현재 선택된 탭 value",
    },
    color: {
      control: "radio",
      options: ["primary", "secondary", "normal"],
      description: "활성 탭/인디케이터 색상",
    },
    options: {
      control: "object",
      description: "탭 목록 설정",
    },
    scrollbarVisible: {
      control: "boolean",
      description: "스크롤바 표시 여부",
    },
    scrollButtonsVisible: {
      control: "boolean",
      description: "좌우 스크롤 버튼 표시 여부",
    },
    onSelect: {
      control: false,
      description: "탭 선택 콜백",
    },

    // BaseMixin 공통 (일부만 노출)
    width: { control: "text" },
    m: { control: "text" },
    mt: { control: "text" },
    mr: { control: "text" },
    mb: { control: "text" },
    ml: { control: "text" },
    mx: { control: "text" },
    my: { control: "text" },
    p: { control: "text" },
    pt: { control: "text" },
    pr: { control: "text" },
    pb: { control: "text" },
    pl: { control: "text" },
    px: { control: "text" },
    py: { control: "text" },
    sx: { control: false },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Box style={{ maxWidth: 720 }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<TabProps>

// * 기본 동작 + Controls 연동
export const Default: Story = {
  render: (args) => {
    const [current, setCurrent] = useState<string | null>(
      args.value ?? args.options[0]?.value ?? null,
    )

    return (
      <Tabs
        {...args}
        value={current}
        onSelect={(v) => {
          setCurrent(v)
        }}
      />
    )
  },
}

/* 색상별 예시 */
export const Colors: Story = {
  render: () => {
    const [selectedPrimary, setSelectedPrimary] = useState("tab1")
    const [selectedSecondary, setSelectedSecondary] = useState("tab1")
    const [selectedNormal, setSelectedNormal] = useState("tab1")

    const options = [
      { label: "탭 1", value: "tab1" },
      { label: "탭 2", value: "tab2" },
      { label: "탭 3", value: "tab3" },
      { label: "탭 4", value: "tab4" },
      { label: "탭 5", value: "tab5" },
    ]

    return (
      <Flex direction="column" gap="16px">
        <Tabs
          size="M"
          color="primary"
          options={options}
          value={selectedPrimary}
          onSelect={setSelectedPrimary}
          scrollbarVisible
          scrollButtonsVisible={false}
        />
        <Tabs
          size="M"
          color="secondary"
          options={options}
          value={selectedSecondary}
          onSelect={setSelectedSecondary}
          scrollbarVisible
          scrollButtonsVisible={false}
        />
        <Tabs
          size="M"
          color="normal"
          options={options}
          value={selectedNormal}
          onSelect={setSelectedNormal}
          scrollbarVisible
          scrollButtonsVisible={false}
        />
      </Flex>
    )
  },
}

// * 사이즈 비교
export const Sizes: Story = {
  render: () => {
    const [small, setSmall] = useState("tab1")
    const [medium, setMedium] = useState("tab1")
    const [large, setLarge] = useState("tab1")

    const options = [
      { label: "탭 1", value: "tab1" },
      { label: "탭 2", value: "tab2" },
      { label: "탭 3", value: "tab3" },
      { label: "탭 4", value: "tab4" },
      { label: "탭 5", value: "tab5" },
      { label: "탭 6", value: "tab6" },
    ]

    return (
      <Flex direction="column" gap="16px">
        <Tabs
          size="S"
          color="primary"
          options={options}
          value={small}
          onSelect={setSmall}
          scrollbarVisible
          scrollButtonsVisible
        />
        <Tabs
          size="M"
          color="secondary"
          options={options}
          value={medium}
          onSelect={setMedium}
          scrollbarVisible
          scrollButtonsVisible
        />
        <Tabs
          size="L"
          color="primary"
          options={options}
          value={large}
          onSelect={setLarge}
          scrollbarVisible
          scrollButtonsVisible
        />
      </Flex>
    )
  },
}

// * 스크롤 / 버튼 동작 확인용 (탭 많이 생성)
export const ScrollAndButtons: Story = {
  render: (args) => {
    const [current, setCurrent] = useState("tab-1")

    const manyTabs = Array.from({ length: 20 }).map((_, idx) => ({
      label: `탭 ${idx + 1}`,
      value: `tab-${idx + 1}`,
    }))

    return (
      <Tabs
        {...args}
        options={manyTabs}
        value={current}
        onSelect={setCurrent}
        scrollbarVisible={args.scrollbarVisible}
        scrollButtonsVisible={args.scrollButtonsVisible}
      />
    )
  },
}

// * hidden / disabled 옵션 조합
export const HiddenAndDisabled: Story = {
  render: () => {
    const [current, setCurrent] = useState("tab1")

    const options = [
      { label: "탭 1", value: "tab1" },
      { label: "탭 2 (hidden)", value: "tab2", hidden: true },
      { label: "탭 3 (disabled)", value: "tab3", disabled: true },
      { label: "탭 4", value: "tab4" },
      { label: "탭 5", value: "tab5" },
    ]

    return (
      <Tabs
        size="M"
        color="primary"
        options={options}
        value={current}
        onSelect={setCurrent}
        scrollbarVisible
        scrollButtonsVisible
      />
    )
  },
}

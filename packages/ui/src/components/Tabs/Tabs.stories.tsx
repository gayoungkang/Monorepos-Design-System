import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import Tabs, { TabProps, TabOptionsType } from "./Tabs"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Button from "../Button/Button"

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    options: { control: false },
    value: { control: false },
    size: { control: { type: "radio" }, options: ["S", "M", "L"] },
    color: { control: { type: "text" } },
    onSelect: { control: false },
    scrollbarVisible: { control: { type: "boolean" } },
    scrollButtonsVisible: { control: { type: "boolean" } },
  },
  args: {
    size: "M",
    color: "primary",
    scrollbarVisible: true,
    scrollButtonsVisible: false,
  },
}

export default meta
type Story = StoryObj<typeof Tabs>

const buildOptions = (count: number, prefix = "tab"): TabOptionsType[] =>
  Array.from({ length: count }).map((_, i) => ({
    label: `${prefix.toUpperCase()} ${i + 1}`,
    value: `${prefix}-${i + 1}`,
  }))

const Controlled = (args: TabProps & { initialCount?: number }) => {
  const count = args.initialCount ?? 6
  const [value, setValue] = useState<string | null>("tab-1")

  const [withHidden, setWithHidden] = useState(false)
  const [withDisabled, setWithDisabled] = useState(false)

  const options = useMemo(() => {
    const base = buildOptions(count, "tab")
    return base.map((o, idx) => ({
      ...o,
      hidden: withHidden ? idx === 2 : false,
      disabled: withDisabled ? idx === 4 : false,
      label: idx >= 6 ? `Very Long Label Tab ${idx + 1} - Lorem ipsum` : o.label,
    }))
  }, [count, withHidden, withDisabled])

  useMemo(() => {
    const exists = options.some((o) => o.value === value && !o.hidden)
    if (!exists) setValue(options.find((o) => !o.hidden)?.value ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  return (
    <Flex direction="column" gap="12px" width="760px">
      <Flex justify="space-between" align="center">
        <Typography text="Tabs Playground" variant="h3" />
        <Flex gap="8px">
          <Button
            variant="outlined"
            text={withHidden ? "Hidden: ON" : "Hidden: OFF"}
            onClick={() => setWithHidden((p) => !p)}
          />
          <Button
            variant="outlined"
            text={withDisabled ? "Disabled: ON" : "Disabled: OFF"}
            onClick={() => setWithDisabled((p) => !p)}
          />
          <Button text="Select 1" onClick={() => setValue("tab-1")} />
          <Button text="Select last" onClick={() => setValue(`tab-${count}`)} />
        </Flex>
      </Flex>

      <Tabs
        {...args}
        options={options}
        value={value}
        onSelect={(v) => {
          setValue(v)
        }}
      />

      <Box sx={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
        <Typography text={`value: ${value ?? "null"}`} variant="b2Regular" />
        <Typography
          text="키보드: TabList 포커스 후 ←/→, Home/End 이동, Enter/Space 선택"
          variant="b3Regular"
          color="text.secondary"
        />
      </Box>
    </Flex>
  )
}

export const Playground: Story = {
  render: (args) => <Controlled {...(args as TabProps)} />,
}

export const Variants: Story = {
  render: (args) => {
    const common = args as TabProps
    const [v1, setV1] = useState<string | null>("tab-2")
    const [v2, setV2] = useState<string | null>("tab-1")

    const optionsShort = useMemo(() => buildOptions(4, "tab"), [])
    const optionsMany = useMemo(() => buildOptions(12, "tab"), [])
    const optionsManyMixed = useMemo(
      () =>
        buildOptions(12, "tab").map((o, idx) => ({
          ...o,
          label: `Tab ${idx + 1} - Very Long Label ${idx + 1}`,
          disabled: idx === 7,
          hidden: idx === 3,
        })),
      [],
    )

    return (
      <Flex direction="column" gap="18px" width="980px">
        <Typography text="Basic (no scroll buttons)" variant="h3" />
        <Tabs
          {...common}
          options={optionsShort}
          value={v1}
          onSelect={(v) => setV1(v)}
          scrollButtonsVisible={false}
          scrollbarVisible
        />

        <Typography text="Many tabs (scrollbar visible)" variant="h3" />
        <Tabs
          {...common}
          options={optionsMany}
          value={v1}
          onSelect={(v) => setV1(v)}
          scrollButtonsVisible={false}
          scrollbarVisible
        />

        <Typography text="Many tabs (scroll buttons visible)" variant="h3" />
        <Tabs
          {...common}
          options={optionsMany}
          value={v1}
          onSelect={(v) => setV1(v)}
          scrollButtonsVisible
          scrollbarVisible={false}
        />

        <Typography text="Hidden/Disabled/Long labels" variant="h3" />
        <Tabs
          {...common}
          options={optionsManyMixed}
          value={v2}
          onSelect={(v) => setV2(v)}
          scrollButtonsVisible
          scrollbarVisible={false}
        />

        <Box sx={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
          <Typography
            text={`valueA: ${v1 ?? "null"} / valueB: ${v2 ?? "null"}`}
            variant="b2Regular"
          />
        </Box>
      </Flex>
    )
  },
}

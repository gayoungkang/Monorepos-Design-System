import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import ToggleButton, { ToggleButtonItem, ToggleButtonProps } from "./ToggleButton"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Button from "../Button/Button"

type ValueType = "all" | "active" | "archived"

type FixedProps = ToggleButtonProps<ValueType>

// * Storybook용: 제네릭을 ValueType으로 고정한 래퍼 (meta.component 타입 에러 방지)
const ToggleButtonFixed = (props: FixedProps) => <ToggleButton<ValueType> {...props} />
ToggleButtonFixed.displayName = "ToggleButtonFixed"

const meta: Meta<typeof ToggleButtonFixed> = {
  title: "Components/ToggleButton",
  component: ToggleButtonFixed,
  parameters: { layout: "centered" },
  argTypes: {
    orientation: { control: { type: "radio" }, options: ["horizontal", "vertical"] },
    buttons: { control: false },
    size: { control: { type: "radio" }, options: ["S", "M", "L"] },
    selectedValue: { control: false },
    onClick: { control: false },
    label: { control: { type: "text" } },
    disabled: { control: { type: "boolean" } },
    required: { control: { type: "boolean" } },
    labelProps: { control: false },
    iconProps: { control: false },
  },
  args: {
    orientation: "horizontal",
    size: "M",
    label: "Status",
    disabled: false,
    required: false,
    buttons: [],
    selectedValue: "all",
    onClick: () => {},
  } satisfies Partial<FixedProps>,
}

export default meta
type Story = StoryObj<typeof ToggleButtonFixed>

const ICON_ALL = "File"
const ICON_ACTIVE = "CheckLine"
const ICON_ARCHIVED = "BookmarkLine"

const defaultButtons: ToggleButtonItem<ValueType>[] = [
  { label: "All", value: "all", startIcon: ICON_ALL as any },
  { label: "Active", value: "active", startIcon: ICON_ACTIVE as any },
  { label: "Archived", value: "archived", startIcon: ICON_ARCHIVED as any },
]

const Controlled = (args: FixedProps) => {
  const [selected, setSelected] = useState<ValueType>("all")

  const buttons = useMemo(() => defaultButtons, [])

  return (
    <Flex direction="column" gap="12px" width="640px">
      <Flex align="center" justify="space-between">
        <Typography text="Playground" variant="h3" />
        <Flex gap="8px">
          <Button text="All" onClick={() => setSelected("all")} />
          <Button variant="outlined" text="Active" onClick={() => setSelected("active")} />
          <Button variant="outlined" text="Archived" onClick={() => setSelected("archived")} />
        </Flex>
      </Flex>

      <ToggleButtonFixed
        {...args}
        buttons={buttons}
        selectedValue={selected}
        onClick={(v) => setSelected(v)}
      />

      <Box sx={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
        <Typography text={`selectedValue: ${selected}`} variant="b2Regular" />
      </Box>
    </Flex>
  )
}

export const Playground: Story = {
  render: (args) => <Controlled {...(args as FixedProps)} />,
}

export const AllCases: Story = {
  render: (args) => {
    const common = args as FixedProps

    const [v1, setV1] = useState<ValueType>("all")
    const [v2, setV2] = useState<ValueType>("active")
    const [v3, setV3] = useState<ValueType>("archived")
    const [disabledAll, setDisabledAll] = useState<boolean>(false)

    const buttonsWithItemDisabled: ToggleButtonItem<ValueType>[] = [
      { label: "All", value: "all", startIcon: ICON_ALL as any },
      { label: "Active", value: "active", startIcon: ICON_ACTIVE as any, disabled: true },
      { label: "Archived", value: "archived", startIcon: ICON_ARCHIVED as any },
    ]

    return (
      <Flex direction="column" gap="18px" width="980px">
        <Flex align="center" justify="space-between">
          <Typography text="AllCases / Variants" variant="h3" />
          <Flex gap="8px">
            <Button
              variant={disabledAll ? "contained" : "outlined"}
              text={disabledAll ? "Disabled: ON" : "Disabled: OFF"}
              onClick={() => setDisabledAll((p) => !p)}
            />
          </Flex>
        </Flex>

        <Typography text="Horizontal" variant="b1Medium" />
        <Flex direction="column" gap="12px">
          <ToggleButtonFixed
            {...common}
            label="Default"
            orientation="horizontal"
            buttons={defaultButtons}
            selectedValue={v1}
            disabled={disabledAll}
            onClick={(v) => setV1(v)}
          />
          <ToggleButtonFixed
            {...common}
            label="Size S"
            orientation="horizontal"
            size="S"
            buttons={defaultButtons}
            selectedValue={v2}
            disabled={disabledAll}
            onClick={(v) => setV2(v)}
          />
          <ToggleButtonFixed
            {...common}
            label="Size L"
            orientation="horizontal"
            size="L"
            buttons={defaultButtons}
            selectedValue={v3}
            disabled={disabledAll}
            onClick={(v) => setV3(v)}
          />
        </Flex>

        <Typography text="Vertical" variant="b1Medium" />
        <Flex direction="column" gap="12px">
          <ToggleButtonFixed
            {...common}
            label="Vertical"
            orientation="vertical"
            buttons={defaultButtons}
            selectedValue={v1}
            disabled={disabledAll}
            onClick={(v) => setV1(v)}
          />
        </Flex>

        <Typography text="Item disabled" variant="b1Medium" />
        <Flex direction="column" gap="12px">
          <ToggleButtonFixed
            {...common}
            label="Active disabled (item)"
            orientation="horizontal"
            buttons={buttonsWithItemDisabled}
            selectedValue={v2}
            disabled={disabledAll}
            onClick={(v) => setV2(v)}
          />
        </Flex>

        <Box sx={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
          <Typography
            text={`state: v1=${v1}, v2=${v2}, v3=${v3}, disabledAll=${disabledAll}`}
            variant="b2Regular"
          />
        </Box>
      </Flex>
    )
  },
}

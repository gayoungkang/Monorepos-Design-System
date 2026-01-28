import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Rating, { RatingProps } from "./Rating"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Rating> = {
  title: "Components/Rating",
  component: Rating,
  parameters: { layout: "padded" },
  argTypes: {
    value: { control: false },
    defaultValue: { control: "number" },
    label: { control: "text" },
    labelProps: { control: false },
    labelPlacement: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "right",
      ],
    },
    LabelPlacement: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "right",
      ],
    },
    max: { control: "number" },
    precision: { control: "number" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    icon: { control: false },
    emptyIcon: { control: false },
    size: { control: "text" },
    onChange: { control: false },
    onChangeActive: { control: false },

    p: { control: false },
    m: { control: false },
    px: { control: false },
    my: { control: false },
    width: { control: false },
    height: { control: false },
    bgColor: { control: false },
    sx: { control: false },
  },
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof Rating>

export const Playground: Story = {
  args: {
    defaultValue: 2,
    label: "만족도",
    labelPlacement: "top",
    max: 5,
    precision: 1,
    disabled: false,
    readOnly: false,
    icon: "StarGlyph",
    emptyIcon: "StarOutLine",
    size: 24,
  } as RatingProps,
  render: (args) => {
    const [value, setValue] = useState<number | null>(args.defaultValue ?? 0)
    const [active, setActive] = useState<number | null>(null)

    const effective = useMemo(() => (active != null ? active : value), [active, value])

    return (
      <Flex direction="column" gap="12px">
        <Typography
          text={`value: ${String(value)} / active: ${String(active)} / displayed: ${String(effective)}`}
          variant="b2Regular"
          color="text.primary"
        />
        <Rating
          {...args}
          value={value}
          onChange={(v) => {
            setValue(v)
            args.onChange?.(v)
          }}
          onChangeActive={(v) => {
            setActive(v)
            args.onChangeActive?.(v)
          }}
        />
      </Flex>
    )
  },
}

export const AllCases: Story = {
  render: () => {
    const [v1, setV1] = useState<number | null>(3)
    const [v2, setV2] = useState<number | null>(2.5)
    const [v3, setV3] = useState<number | null>(4)
    const [v4, setV4] = useState<number | null>(1)

    return (
      <Flex direction="column" gap="18px">
        <Typography text="Basic (precision=1)" variant="b2Regular" color="text.primary" />
        <Rating label="기본" labelPlacement="top" value={v1} onChange={setV1} />

        <Typography text="Half (precision=0.5)" variant="b2Regular" color="text.primary" />
        <Rating
          label="0.5 단위"
          labelPlacement="left"
          max={5}
          precision={0.5}
          value={v2}
          onChange={setV2}
        />

        <Typography text="ReadOnly" variant="b2Regular" color="text.primary" />
        <Rating label="읽기전용" labelPlacement="right" value={v3} readOnly />

        <Typography text="Disabled" variant="b2Regular" color="text.primary" />
        <Box>
          <Rating label="비활성" labelPlacement="bottom" value={v4} onChange={setV4} disabled />
        </Box>
      </Flex>
    )
  },
}

export const Variants: Story = {
  render: () => {
    const [value, setValue] = useState<number | null>(2)
    const [active, setActive] = useState<number | null>(null)

    const cases: Array<{
      title: string
      props: Omit<RatingProps, "value" | "onChange" | "onChangeActive">
    }> = [
      { title: "size=16", props: { label: "작게", labelPlacement: "top", size: 16 } },
      { title: "size=24", props: { label: "기본", labelPlacement: "left", size: 24 } },
      { title: "size=32", props: { label: "크게", labelPlacement: "right", size: 32 } },
      { title: "precision=0.5", props: { label: "0.5", labelPlacement: "top", precision: 0.5 } },
      { title: "max=10", props: { label: "10개", labelPlacement: "top", max: 10, precision: 1 } },
      { title: "readOnly", props: { label: "읽기전용", labelPlacement: "bottom", readOnly: true } },
      { title: "disabled", props: { label: "비활성", labelPlacement: "bottom", disabled: true } },
    ]

    return (
      <Flex direction="column" gap="14px">
        <Typography
          text={`value: ${String(value)} / active: ${String(active)}`}
          variant="b2Regular"
          color="text.primary"
        />

        {cases.map((c) => (
          <Flex key={c.title} direction="column" gap="8px">
            <Typography text={c.title} variant="b2Regular" color="text.primary" />
            <Rating
              {...c.props}
              value={value}
              onChange={(v) => setValue(v)}
              onChangeActive={(v) => setActive(v)}
            />
          </Flex>
        ))}
      </Flex>
    )
  },
}

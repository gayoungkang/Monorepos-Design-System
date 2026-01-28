import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import RadioGroup, { DataType, RadioGroupProps } from "./RadioGroup"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

type ValueType = string | number

const meta: Meta<typeof RadioGroup<ValueType>> = {
  title: "Components/RadioGroup",
  component: RadioGroup<ValueType>,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    data: { control: false },
    direction: { control: "radio", options: ["horizontal", "vertical"] },
    disabled: { control: "boolean" },
    name: { control: "text" },
    label: { control: "text" },
    required: { control: "boolean" },
    error: { control: "boolean" },
    helperText: { control: "text" },
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
    size: { control: "radio", options: ["S", "M", "L"] },
    p: { control: false },
    m: { control: false },
    px: { control: false },
    my: { control: false },
    width: { control: false },
    height: { control: false },
    bgColor: { control: false },
    sx: { control: false },
  },
} satisfies Meta<typeof RadioGroup<ValueType>>

export default meta
type Story = StoryObj<typeof RadioGroup<ValueType>>

const stringData: DataType<string>[] = [
  { text: "옵션 A", value: "A" },
  { text: "옵션 B", value: "B" },
  { text: "옵션 C", value: "C" },
]

const numberData: DataType<number>[] = [
  { text: "1번", value: 1 },
  { text: "2번", value: 2 },
  { text: "3번", value: 3 },
]

export const Playground: Story = {
  args: {
    direction: "horizontal",
    disabled: false,
    name: "playground",
    label: "라디오 그룹",
    required: false,
    error: false,
    helperText: "에러 메시지 예시",
    labelPlacement: "top",
    size: "M",
    data: stringData as DataType<ValueType>[],
  } as RadioGroupProps<ValueType>,
  render: (args) => {
    const data = useMemo(() => args.data ?? (stringData as DataType<ValueType>[]), [args.data])
    const [value, setValue] = useState<ValueType>((data?.[0]?.value as ValueType) ?? "A")

    return (
      <Flex direction="column" gap="12px">
        <Typography text={`선택값: ${String(value)}`} variant="b2Regular" color="text.primary" />
        <RadioGroup<ValueType>
          {...args}
          data={data}
          value={value}
          onChange={(v) => {
            setValue(v)
            args.onChange?.(v)
          }}
        />
      </Flex>
    )
  },
}

export const AllCases: Story = {
  args: {
    labelProps: {},
  } as RadioGroupProps<ValueType>,
  render: () => {
    const [v1, setV1] = useState<ValueType>("A")
    const [v2, setV2] = useState<ValueType>("B")
    const [v3, setV3] = useState<ValueType>(1)
    const [v4, setV4] = useState<ValueType>(2)

    return (
      <Flex direction="column" gap="20px">
        <Typography text="String / Horizontal / Top" variant="b2Regular" color="text.primary" />
        <RadioGroup<ValueType>
          data={stringData as DataType<ValueType>[]}
          value={v1}
          onChange={setV1}
          direction="horizontal"
          label="라디오 그룹"
          labelPlacement="top"
          size="M"
        />

        <Typography text="String / Vertical / Left" variant="b2Regular" color="text.primary" />
        <RadioGroup<ValueType>
          data={stringData as DataType<ValueType>[]}
          value={v2}
          onChange={setV2}
          direction="vertical"
          label="라디오 그룹"
          labelPlacement="left"
          size="L"
        />

        <Typography
          text="Number / Horizontal / Bottom + Error"
          variant="b2Regular"
          color="text.primary"
        />
        <RadioGroup<ValueType>
          data={numberData as DataType<ValueType>[]}
          value={v3}
          onChange={setV3}
          direction="horizontal"
          label="숫자 라디오"
          labelPlacement="bottom"
          size="S"
          error
          helperText="필수 선택 항목입니다."
        />

        <Typography text="Disabled" variant="b2Regular" color="text.primary" />
        <Box>
          <RadioGroup<ValueType>
            data={numberData as DataType<ValueType>[]}
            value={v4}
            onChange={setV4}
            direction="horizontal"
            label="비활성 라디오"
            labelPlacement="right"
            size="M"
            disabled
          />
        </Box>
      </Flex>
    )
  },
}

export const Variants: Story = {
  render: () => {
    const [value, setValue] = useState<ValueType>("A")

    const cases: Array<{
      title: string
      props: Omit<RadioGroupProps<ValueType>, "data" | "value" | "onChange">
    }> = [
      { title: "S / top", props: { size: "S", label: "Label", labelPlacement: "top" } },
      { title: "M / left", props: { size: "M", label: "Label", labelPlacement: "left" } },
      { title: "L / right", props: { size: "L", label: "Label", labelPlacement: "right" } },
      { title: "M / bottom-start", props: { size: "M", label: "Label", labelPlacement: "bottom" } },
      {
        title: "Error",
        props: {
          size: "M",
          label: "Label",
          labelPlacement: "top",
          error: true,
          helperText: "에러 상태",
        },
      },
      {
        title: "Disabled",
        props: { size: "M", label: "Label", labelPlacement: "top", disabled: true },
      },
      {
        title: "Vertical",
        props: { size: "M", label: "Label", labelPlacement: "top", direction: "vertical" },
      },
    ]

    return (
      <Flex direction="column" gap="16px">
        <Typography
          text={`공용 선택값: ${String(value)}`}
          variant="b2Regular"
          color="text.primary"
        />
        <Flex direction="column" gap="14px">
          {cases.map((c) => (
            <Flex key={c.title} direction="column" gap="8px">
              <Typography text={c.title} variant="b2Regular" color="text.primary" />
              <RadioGroup<ValueType>
                data={stringData as DataType<ValueType>[]}
                value={value}
                onChange={setValue}
                {...c.props}
              />
            </Flex>
          ))}
        </Flex>
      </Flex>
    )
  },
}

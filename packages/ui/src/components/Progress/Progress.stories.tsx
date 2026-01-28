import type { Meta, StoryObj } from "@storybook/react"
import { useEffect, useMemo, useState } from "react"
import Progress from "./Progress"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  args: {
    type: "bar",
    variant: "indeterminate",
    value: 40,
    size: "36px",
    height: "4px",
    label: "",
    color: undefined,
    backgroundColor: undefined,
  },
  argTypes: {
    type: { control: "radio", options: ["bar", "Circular"] },
    variant: { control: "radio", options: ["determinate", "indeterminate"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: { control: "text" },
    height: { control: "text" },
    label: { control: "text" },
    color: { control: "text" },
    backgroundColor: { control: "text" },
  },
}
export default meta

type Story = StoryObj<typeof Progress>

export const Playground: Story = {
  render: (args) => {
    const isDeterminate = args.variant === "determinate"

    return (
      <Flex direction="column" gap="16px" align="center">
        <Typography
          variant="b2Regular"
          text={`type=${args.type} / variant=${args.variant}${isDeterminate ? ` / value=${args.value}` : ""}`}
        />

        <Box width={args.type === "bar" ? "320px" : "auto"}>
          <Progress {...args} />
        </Box>
      </Flex>
    )
  },
}

export const AllCases: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [barValue, setBarValue] = useState(35)
    const [circleValue, setCircleValue] = useState(65)

    // * 데모용 determinate 값 자동 증가(루프)
    useEffect(() => {
      const t = setInterval(() => {
        setBarValue((v) => (v >= 100 ? 0 : v + 5))
        setCircleValue((v) => (v >= 100 ? 0 : v + 3))
      }, 600)
      return () => clearInterval(t)
    }, [])

    const rows = useMemo(
      () => [
        {
          title: "Bar / Indeterminate",
          node: (
            <Box width="360px">
              <Progress type="bar" variant="indeterminate" />
            </Box>
          ),
        },
        {
          title: "Bar / Determinate (auto)",
          node: (
            <Box width="360px">
              <Progress type="bar" variant="determinate" value={barValue} label="bar" />
            </Box>
          ),
        },
        {
          title: "Bar / Determinate (thick + custom colors)",
          node: (
            <Box width="360px">
              <Progress
                type="bar"
                variant="determinate"
                value={72}
                height="10px"
                color="#4f46e5"
                backgroundColor="#e5e7eb"
              />
            </Box>
          ),
        },
        {
          title: "Circular / Indeterminate (sizes)",
          node: (
            <Flex align="center" gap="16px">
              <Progress type="Circular" variant="indeterminate" size="24px" />
              <Progress type="Circular" variant="indeterminate" size="36px" />
              <Progress type="Circular" variant="indeterminate" size="48px" />
            </Flex>
          ),
        },
        {
          title: "Circular / Determinate (auto + label)",
          node: (
            <Progress
              type="Circular"
              variant="determinate"
              value={circleValue}
              label="Circular"
              size="44px"
            />
          ),
        },
        {
          title: "Circular / Determinate (custom colors)",
          node: (
            <Progress
              type="Circular"
              variant="determinate"
              value={88}
              size="44px"
              color="#10b981"
              backgroundColor="#d1fae5"
              label="Circular"
            />
          ),
        },
      ],
      [barValue, circleValue],
    )

    return (
      <Flex direction="column" gap="18px" align="stretch" sx={{ width: "460px" }}>
        {rows.map((r) => (
          <Box
            key={r.title}
            sx={{
              padding: "14px",
              borderRadius: "12px",
              backgroundColor: "white",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography variant="b1Bold" text={r.title} mb={10} />
            {r.node}
          </Box>
        ))}
      </Flex>
    )
  },
}

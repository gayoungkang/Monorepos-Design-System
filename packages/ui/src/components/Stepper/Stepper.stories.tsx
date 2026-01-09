import { useMemo, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import Stepper, { StepperOptionType } from "./Stepper"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import Divider from "../Divider/Divider"
import { theme } from "../../tokens/theme"
import { IconName, IconNames } from "../Icon/icon-loader"

/* ------------------------------------------------------------------ */
/* meta */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  argTypes: {
    options: { control: false },
    value: { control: false },
    orientation: { control: "radio", options: ["horizontal", "vertical"] },
    linear: { control: "boolean" },
    connector: { control: false },
    onSelect: { control: false },
    TypographyProps: { control: false },
  },
  args: {
    orientation: "horizontal",
    linear: true,
  },
  decorators: [(Story) => <Story />],
}

export default meta

type Story = StoryObj<typeof Stepper>

/* ------------------------------------------------------------------ */
/* helpers */
/* ------------------------------------------------------------------ */

const makeOptions = (activeIndex: number): StepperOptionType<string>[] => [
  {
    value: "step-1",
    children: IconNames[0],
    label:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cumque magnam hic quaerat dolores voluptatibus nam! Ex doloribus et recusandae at beatae? Harum, eum! Excepturi eaque, nihil quae at totam culpa! Modi, distinctio dolor explicabo sit temporibus eos aspernatur molestiae sunt placeat. Alias perspiciatis quae omnis, deleniti delectus dolorem facere amet maiores. Saepe eius minus consectetur officiis quia aliquam doloribus enim.",
  },
  {
    value: "step-2",
    children: "Configure settings",
    label: "Step",
  },
  {
    value: "step-3",
    children: IconNames[1],
    label: activeIndex === 2 ? "Error" : "Step",
    error: activeIndex === 2,
  },
  {
    value: "step-4",
    children: "Finish",
    label: "Step",
  },
  {
    value: "step-5",
    label: "disabled",
    disabled: true,
  },
]

/* ------------------------------------------------------------------ */
/* stories */
/* ------------------------------------------------------------------ */

export const Playground: Story = {
  render: (args) => {
    const [activeIndex, setActiveIndex] = useState(1)

    const options = useMemo(() => makeOptions(activeIndex), [activeIndex])
    const value = options[activeIndex]?.value ?? null

    const canPrev = activeIndex > 0
    const canNext = activeIndex < options.length - 1

    // * StepperProps가 HTMLAttributes를 합치며 onSelect가 ReactEventHandler와 교차 타입이 된 케이스 대응
    // * (event) 시그니처도 만족하면서 내부에서 (value, index) 형태로 사용 가능하도록 가변 인수로 처리
    const handleSelect = (...argsAny: any[]) => {
      const valueArg = argsAny[0] as string
      const indexArg = argsAny[1] as number
      if (typeof indexArg === "number") setActiveIndex(indexArg)
    }

    return (
      <Flex direction="column" gap={16} width="100%" align="center" justify="center">
        <Flex gap={8} align="center" wrap="wrap">
          <Button
            text="Prev"
            variant="outlined"
            disabled={!canPrev}
            onClick={() => setActiveIndex((n) => Math.max(0, n - 1))}
          />

          <Button
            text="Next"
            variant="contained"
            disabled={!canNext}
            onClick={() => setActiveIndex((n) => Math.min(options.length - 1, n + 1))}
          />

          <Button text=" Reset" variant="text" onClick={() => setActiveIndex(0)} />
        </Flex>

        <Stepper
          {...args}
          options={options}
          value={value}
          connector={<Divider direction={args.orientation} sx={{ zIndex: theme.zIndex.base }} />}
          onSelect={handleSelect as any}
        />

        <Box
          p={"12px"}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          Current step: {activeIndex + 1} / {options.length}
        </Box>
      </Flex>
    )
  },
}

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    linear: true,
  },
  render: (args) => {
    const [activeIndex, setActiveIndex] = useState(0)

    const options = useMemo(() => makeOptions(activeIndex), [activeIndex])
    const value = options[activeIndex]?.value ?? null

    const handleSelect = (...argsAny: any[]) => {
      const indexArg = argsAny[1] as number
      if (typeof indexArg === "number") setActiveIndex(indexArg)
    }

    return (
      <Flex direction="column" gap={16} width="100%" align="center" justify="center">
        <Stepper
          {...args}
          options={options}
          value={value}
          connector={<Divider direction={args.orientation} sx={{ zIndex: theme.zIndex.base }} />}
          onSelect={handleSelect as any}
        />

        <Flex gap={8} align="center" wrap="wrap">
          <Button
            text="Prev"
            variant="outlined"
            onClick={() => setActiveIndex((n) => Math.max(0, n - 1))}
          />

          <Button
            text="Next"
            variant="contained"
            onClick={() => setActiveIndex((n) => Math.min(options.length - 1, n + 1))}
          />
        </Flex>
      </Flex>
    )
  },
}

export const AlternativeLabel: Story = {
  args: {
    orientation: "horizontal",
    linear: true,
  },
  render: (args) => {
    const [activeIndex, setActiveIndex] = useState(2)

    const options = useMemo(
      () => [
        ...makeOptions(activeIndex),
        {
          value: "step-6",
          children: "More2Line" as IconName,
          label: "More",
          completed: activeIndex > 5,
        },
      ],
      [activeIndex],
    )

    const value = options[activeIndex]?.value ?? null

    const handleSelect = (...argsAny: any[]) => {
      const indexArg = argsAny[1] as number
      if (typeof indexArg === "number") setActiveIndex(indexArg)
    }

    return (
      <Flex direction="column" gap={16} width="100%">
        <Stepper
          {...args}
          options={options}
          value={value}
          connector={<Divider direction={args.orientation} sx={{ zIndex: theme.zIndex.base }} />}
          onSelect={handleSelect as any}
        />

        <Box
          p={"12px"}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          nonLinear=true: any enabled step can be selected. Disabled step cannot be selected.
        </Box>
      </Flex>
    )
  },
}

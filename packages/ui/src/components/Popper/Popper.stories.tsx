import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useRef, useState } from "react"
import Popper from "./Popper"
import type { DirectionalPlacement } from "../../types"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"
import { theme } from "../../tokens/theme"

const placements: DirectionalPlacement[] = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end",
]

const meta: Meta<typeof Popper> = {
  title: "Components/Popper",
  component: Popper,
  args: {
    placement: "bottom",
    offsetX: 0,
    offsetY: 8,
    showArrow: true,
    height: "240px",
    width: "auto",
  },
  argTypes: {
    placement: { control: "select", options: placements },
    offsetX: { control: { type: "number", step: 1 } },
    offsetY: { control: { type: "number", step: 1 } },
    showArrow: { control: "boolean" },
    height: { control: "text" },
    width: { control: "select", options: ["auto", "anchor", "max-content"] },
    open: { control: false },
    anchorRef: { control: false },
    onClose: { control: false },
    children: { control: false },
  },
}
export default meta

type Story = StoryObj<typeof Popper>

const DemoContent = ({ lines = 30 }: { lines?: number }) => {
  const items = useMemo(() => Array.from({ length: lines }, (_, i) => i + 1), [lines])
  return (
    <Box width="260px" p="8px">
      <Typography variant="b1Bold" text="Popper content" mb={8} />
      <Flex direction="column" gap={6}>
        {items.map((n) => (
          <Box
            key={n}
            p="8px"
            sx={{
              borderRadius: theme.borderRadius[4],
              backgroundColor: theme.colors.grayscale[50],
              border: `1px solid ${theme.colors.border.default}`,
            }}
          >
            <Typography variant="b2Regular" text={`Row ${n}`} />
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

export const Playground: Story = {
  render: (args) => {
    const anchorRef = useRef<HTMLButtonElement | null>(null)
    const [open, setOpen] = useState(false)

    return (
      <Flex gap={16} align="flex-start">
        <Flex direction="column" gap={12}>
          <Button
            ref={anchorRef as any}
            text={open ? "Close" : "Open"}
            onClick={() => setOpen((v) => !v)}
          />
          <Typography
            variant="b2Regular"
            color={theme.colors.text.secondary}
            text="스크롤/리사이즈/버튼 이동 시에도 따라붙는지 확인"
          />
          <Box height="1200px" width="360px" sx={{ backgroundColor: theme.colors.grayscale[50] }} />
        </Flex>

        <Popper {...args} open={open} anchorRef={anchorRef as any} onClose={() => setOpen(false)}>
          <DemoContent />
        </Popper>
      </Flex>
    )
  },
}

export const MultipleInstances: Story = {
  args: {
    placement: "bottom-start",
    showArrow: true,
    width: "anchor",
    height: "200px",
  },
  render: (args) => {
    const a1 = useRef<HTMLButtonElement | null>(null)
    const a2 = useRef<HTMLButtonElement | null>(null)
    const [o1, setO1] = useState(false)
    const [o2, setO2] = useState(false)

    return (
      <Flex gap={20} align="center">
        <Button ref={a1 as any} text={o1 ? "Close A" : "Open A"} onClick={() => setO1((v) => !v)} />
        <Button ref={a2 as any} text={o2 ? "Close B" : "Open B"} onClick={() => setO2((v) => !v)} />

        <Popper {...args} open={o1} anchorRef={a1 as any} onClose={() => setO1(false)}>
          <DemoContent lines={12} />
        </Popper>

        <Popper {...args} open={o2} anchorRef={a2 as any} onClose={() => setO2(false)}>
          <DemoContent lines={18} />
        </Popper>
      </Flex>
    )
  },
}

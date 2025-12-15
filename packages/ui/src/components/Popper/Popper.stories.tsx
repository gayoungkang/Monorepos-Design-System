import { Meta, StoryObj } from "@storybook/react"
import { useRef, useState } from "react"
import Popper, { PopperProps } from "./Popper"
import Button from "../Button/Button"
import Box from "../Box/Box"

/** ------------------------------------------------------------------
 * Story에서 anchorRef / children / open 은 Storybook args로 받을 수 없음
 * → 별도 Story 전용 타입을 만든다
 * ------------------------------------------------------------------ */
export type PopperStoryProps = Omit<PopperProps, "anchorRef" | "children"> & {
  anchorLabel: string
  content: string
}

/* ------------------------------------------------------------------ */
/*                                Meta                                */
/* ------------------------------------------------------------------ */

const meta: Meta<PopperStoryProps> = {
  title: "components/Popper",

  args: {
    placement: "bottom",
    offsetX: 0,
    offsetY: 8,
    showArrow: false,
    height: "200px",
    width: "auto",
    open: false,
    anchorLabel: "Open Popper",
    content: "팝오버 내용입니다.",
  },

  argTypes: {
    anchorLabel: { control: "text" },
    content: { control: "text" },
  },

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<PopperStoryProps>

/* ------------------------------------------------------------------ */
/*                              Playground                            */
/* ------------------------------------------------------------------ */

export const Playground: Story = {
  render: (args) => {
    const anchorRef = useRef<HTMLButtonElement | null>(null)
    const [open, setOpen] = useState(false)

    return (
      <Box sx={{ padding: 40 }}>
        <Button ref={anchorRef} text={args.anchorLabel} onClick={() => setOpen((prev) => !prev)} />

        <Popper
          anchorRef={anchorRef}
          open={open}
          placement={args.placement}
          offsetX={args.offsetX}
          offsetY={args.offsetY}
          showArrow={args.showArrow}
          height={args.height}
          width={args.width}
        >
          <Box sx={{ padding: 12 }}>{args.content}</Box>
        </Popper>
      </Box>
    )
  },
}

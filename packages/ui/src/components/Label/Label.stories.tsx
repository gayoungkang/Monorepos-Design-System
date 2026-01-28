import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Label from "./Label"
import type { LabelProps } from "./Label"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  parameters: { layout: "fullscreen" },
  argTypes: {
    typographyProps: { control: false },
  },
  args: {
    text: "라벨",
    textAlign: "left",
    placement: "right",
    required: false,
  },
}
export default meta
type Story = StoryObj<typeof Label>

export const Playground: Story = {
  render: (args) => {
    const [required, setRequired] = useState<boolean>(!!args.required)
    const [placement, setPlacement] = useState<LabelProps["placement"]>(args.placement ?? "right")
    const [textAlign, setTextAlign] = useState<LabelProps["textAlign"]>(args.textAlign ?? "left")

    return (
      <Box p="20px">
        <Typography variant="h3" text="Label Playground" mb="12px" />

        <Flex gap="8px" align="center" mb="12px" wrap="wrap">
          <Button
            text={`required: ${required ? "true" : "false"}`}
            variant="outlined"
            color="normal"
            onClick={() => setRequired((p) => !p)}
          />
          <Button
            text={`placement: ${placement}`}
            variant="outlined"
            color="normal"
            onClick={() => setPlacement((p) => (p === "left" ? "right" : "left"))}
          />
          <Button
            text={`textAlign: ${textAlign}`}
            variant="outlined"
            color="normal"
            onClick={() => setTextAlign((p) => (p === "left" ? "right" : "left"))}
          />
        </Flex>

        <Box
          p="12px"
          sx={{
            border: "1px dashed #ddd",
            width: "360px",
          }}
        >
          <Label
            {...(args as LabelProps)}
            required={required}
            placement={placement}
            textAlign={textAlign}
          />
        </Box>
      </Box>
    )
  },
}

export const Matrix: Story = {
  render: () => {
    const aligns: LabelProps["textAlign"][] = ["left", "right"]
    const placements: LabelProps["placement"][] = ["left", "right"]

    const cases = useMemo(() => {
      const out: Array<{ textAlign: LabelProps["textAlign"]; placement: LabelProps["placement"] }> =
        []
      aligns.forEach((a) => placements.forEach((p) => out.push({ textAlign: a, placement: p })))
      return out
    }, [])

    return (
      <Box p="20px">
        <Typography variant="h3" text="textAlign × placement × required" mb="12px" />

        <Flex direction="column" gap="12px">
          {cases.map((c, idx) => (
            <Box
              key={idx}
              p="12px"
              sx={{
                border: "1px solid #eee",
                width: "420px",
              }}
            >
              <Typography
                variant="b3Regular"
                text={`textAlign=${c.textAlign}, placement=${c.placement}`}
                mb="8px"
                color="#666666"
              />
              <Flex direction="column" gap="6px">
                <Label text="기본" textAlign={c.textAlign} placement={c.placement} />
                <Label text="필수 라벨" required textAlign={c.textAlign} placement={c.placement} />
                <Label
                  text="타이포 오버라이드"
                  required
                  textAlign={c.textAlign}
                  placement={c.placement}
                  typographyProps={{ variant: "h2" as any }}
                />
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>
    )
  },
}

import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Icon, { type IconProps } from "./Icon"
import { IconNames, type IconName } from "./icon-loader"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  parameters: { layout: "fullscreen" },
  argTypes: {
    name: { control: "text" },
    size: { control: "text" },
    color: { control: "color" },
    strokeWidth: { control: "number" },
    paint: { control: "radio", options: ["auto", "fill", "stroke", "both"] },
    ariaLabel: { control: "text" },
  },
  args: {
    name: "CloseLine" as any,
    size: 24,
    color: "",
    strokeWidth: 1.5,
    paint: "auto",
    ariaLabel: "",
  },
}
export default meta
type Story = StoryObj<typeof Icon>

export const Playground: Story = {
  render: (args) => {
    const [inlineColor, setInlineColor] = useState<string>("")

    return (
      <Box p="20px">
        <Typography variant="h3" text="Icon Playground" mb="12px" />

        <Flex gap="12px" align="center" mb="12px" wrap="wrap">
          <Box>
            <Icon {...(args as IconProps)} color={inlineColor || (args as any).color} />
          </Box>

          <Flex gap="8px" align="center" wrap="wrap">
            <Button
              text="Use default(currentColor)"
              variant="outlined"
              color="normal"
              onClick={() => setInlineColor("")}
            />
            <Button
              text="Set #333"
              variant="outlined"
              color="normal"
              onClick={() => setInlineColor("#333333")}
            />
            <Button
              text="Set #FF4D4F"
              variant="outlined"
              color="normal"
              onClick={() => setInlineColor("#FF4D4F")}
            />
          </Flex>
        </Flex>

        <Typography
          variant="b3Regular"
          text={`aria: ${args.ariaLabel ? `role=img, aria-label="${args.ariaLabel}"` : "aria-hidden=true"}`}
          color="#666666"
        />
      </Box>
    )
  },
}

export const PaintModes: Story = {
  render: () => {
    const paints: IconProps["paint"][] = ["auto", "fill", "stroke", "both"]
    const icon: IconName = "ArrowDown" as any

    return (
      <Box p="20px">
        <Typography variant="h3" text="paint (auto/fill/stroke/both)" mb="12px" />

        <Flex gap="18px" align="center" wrap="wrap">
          {paints.map((p) => (
            <Flex key={p} direction="column" align="center" gap="6px">
              <Icon
                name={icon}
                size={28}
                paint={p}
                strokeWidth={1.5}
                color="#333333"
                ariaLabel={p}
              />
              <Typography variant="b3Regular" text={p ?? ""} />
            </Flex>
          ))}
        </Flex>
      </Box>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const sizes = useMemo(() => [12, 16, 20, 24, 28, 32, 40], [])

    return (
      <Box p="20px">
        <Typography variant="h3" text="sizes" mb="12px" />

        <Flex gap="14px" align="center" wrap="wrap">
          {sizes.map((s) => (
            <Flex key={s} direction="column" align="center" gap="6px">
              <Icon name={IconNames[0]} size={s} color="#333333" ariaLabel={`size-${s}`} />
              <Typography variant="b3Regular" text={String(s)} />
            </Flex>
          ))}
        </Flex>
      </Box>
    )
  },
}

export const A11yExamples: Story = {
  render: () => {
    return (
      <Box p="20px">
        <Typography variant="h3" text="a11y" mb="12px" />

        <Flex gap="18px" align="center" wrap="wrap">
          <Flex direction="column" gap="6px" align="center">
            <Icon name={IconNames[3]} size={24} color="#333333" />
            <Typography variant="b3Regular" text="decorative (aria-hidden)" />
          </Flex>

          <Flex direction="column" gap="6px" align="center">
            <Icon name={IconNames[3]} size={24} color="#333333" ariaLabel="information" />
            <Typography variant="b3Regular" text='role="img" + aria-label' />
          </Flex>
        </Flex>
      </Box>
    )
  },
}

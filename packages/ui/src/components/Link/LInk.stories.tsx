import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"
import Link from "./Link"
import type { LinkProps } from "./Link"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  parameters: { layout: "fullscreen" },
  argTypes: {
    typographyProps: { control: false },
    onClick: { control: false },
  },
  args: {
    children: "Link",
    underline: "always",
    disabled: false,
    href: "https://example.com",
    color: "",
    hoverColor: "",
  },
}
export default meta
type Story = StoryObj<typeof Link>

export const Playground: Story = {
  render: (args) => {
    const [disabled, setDisabled] = useState<boolean>(!!args.disabled)
    const [underline, setUnderline] = useState<LinkProps["underline"]>(args.underline ?? "always")
    const [colorMode, setColorMode] = useState<"default" | "custom" | "custom-hover">("default")

    const resolved = (() => {
      if (colorMode === "custom") return { color: "#7C3AED", hoverColor: "" }
      if (colorMode === "custom-hover") return { color: "#0EA5E9", hoverColor: "#22C55E" }
      return { color: "", hoverColor: "" }
    })()

    return (
      <Box p="20px">
        <Typography variant="h3" text="Link Playground" mb="12px" />

        <Flex gap="8px" align="center" mb="12px" wrap="wrap">
          <Button
            text={`disabled: ${disabled ? "true" : "false"}`}
            variant="outlined"
            color="normal"
            onClick={() => setDisabled((p) => !p)}
          />

          <Button
            text={`underline: ${underline}`}
            variant="outlined"
            color="normal"
            onClick={() =>
              setUnderline((u) => (u === "none" ? "hover" : u === "hover" ? "always" : "none"))
            }
          />

          <Button
            text={`colorMode: ${colorMode}`}
            variant="outlined"
            color="normal"
            onClick={() =>
              setColorMode((m) =>
                m === "default" ? "custom" : m === "custom" ? "custom-hover" : "default",
              )
            }
          />
        </Flex>

        <Flex direction="column" gap="10px">
          <Link
            {...(args as LinkProps)}
            disabled={disabled}
            underline={underline}
            color={resolved.color || undefined}
            hoverColor={resolved.hoverColor || undefined}
            onClick={() => {}}
          />

          <Typography
            variant="b3Regular"
            text={`disabled=${disabled}, underline=${underline}, colorMode=${colorMode}`}
            color="#666666"
          />
        </Flex>
      </Box>
    )
  },
}

export const UnderlineVariants: Story = {
  render: () => {
    const variants: LinkProps["underline"][] = ["none", "hover", "always"]

    return (
      <Box p="20px">
        <Typography variant="h3" text="underline variants" mb="12px" />

        <Flex direction="column" gap="10px">
          {variants.map((v) => (
            <Flex key={v} gap="12px" align="center" wrap="wrap">
              <Typography variant="b2Regular" text={v ?? ""} width="90px" />
              <Link href="https://example.com" underline={v}>
                Example link
              </Link>
              <Link href="https://example.com" underline={v} color="#0EA5E9">
                Colored link
              </Link>
              <Link href="https://example.com" underline={v} color="#0EA5E9" hoverColor="#22C55E">
                Colored + hoverColor
              </Link>
            </Flex>
          ))}
        </Flex>
      </Box>
    )
  },
}

export const Disabled: Story = {
  render: () => {
    return (
      <Box p="20px">
        <Typography variant="h3" text="disabled" mb="12px" />

        <Flex direction="column" gap="10px">
          <Link href="https://example.com" disabled>
            Disabled (href blocked)
          </Link>

          <Link disabled underline="hover" color="#0EA5E9">
            Disabled (custom color)
          </Link>

          <Typography
            variant="b3Regular"
            text={`disabled links are aria-disabled and removed from tab order`}
            color="#666666"
          />
        </Flex>
      </Box>
    )
  },
}

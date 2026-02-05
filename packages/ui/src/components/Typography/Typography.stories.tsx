import type { Meta, StoryObj } from "@storybook/react"
import React, { useEffect, useMemo, useState } from "react"
import { Typography, TypographyProps } from "./Typography"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import TextField from "../TextField/TextField"
import ToggleButton from "../ToggleButton/ToggleButton"
import { theme, typographyVariants } from "../../tokens/theme"

type StoryArgs = TypographyProps
type VariantKey = keyof typeof typographyVariants
type AsTag = NonNullable<TypographyProps["as"]>
type Align = NonNullable<TypographyProps["align"]>

const meta: Meta<StoryArgs> = {
  title: "Components/Typography",
  component: Typography,
  argTypes: {
    variant: { control: "select", options: Object.keys(typographyVariants) },
    text: { control: "text" },
    as: {
      control: "select",
      options: ["p", "span", "div", "label", "strong", "em", "h1", "h2", "h3"],
    },
    color: { control: "text" },
    italic: { control: "boolean" },
    ellipsis: { control: "boolean" },
    underline: { control: "boolean" },
    align: { control: "radio", options: ["left", "center", "right", "justify"] },

    p: { control: "text" },
    px: { control: "text" },
    py: { control: "text" },
    pt: { control: "text" },
    pr: { control: "text" },
    pb: { control: "text" },
    pl: { control: "text" },

    m: { control: "text" },
    mx: { control: "text" },
    my: { control: "text" },
    mt: { control: "text" },
    mr: { control: "text" },
    mb: { control: "text" },
    ml: { control: "text" },

    width: { control: "text" },
    height: { control: "text" },
    bgColor: { control: "text" },
    sx: { control: "object" },
  },
  args: {
    variant: "b1Medium",
    text: "Typography\nmultiline text",
    as: "p",
    color: theme.colors.text.primary,
    italic: false,
    ellipsis: false,
    underline: false,
    align: "left",
    width: "100%",
  },
}

export default meta
type Story = StoryObj<StoryArgs>

const asOptions: AsTag[] = ["p", "span", "div", "label", "strong", "em", "h1", "h2", "h3"]
const alignOptions: Align[] = ["left", "center", "right", "justify"]

const isVariantKey = (v: unknown): v is VariantKey =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(typographyVariants, v)

const safeAsTag = (v: unknown): AsTag | null =>
  typeof v === "string" && (asOptions as string[]).includes(v) ? (v as AsTag) : null

const safeAlign = (v: unknown): Align | null =>
  typeof v === "string" && (alignOptions as string[]).includes(v) ? (v as Align) : null

export const Playground: Story = {
  render: (args) => {
    const variantKeys = useMemo(() => Object.keys(typographyVariants) as VariantKey[], [])
    const [text, setText] = useState<string>(
      typeof args.text === "string" ? args.text : "Typography",
    )

    const [variant, setVariant] = useState<VariantKey>(
      isVariantKey(args.variant) ? args.variant : "b1Medium",
    )
    const [asTag, setAsTag] = useState<AsTag>(args.as ?? "p")
    const [align, setAlign] = useState<Align>(args.align ?? "left")
    const [color, setColor] = useState<string>(args.color ?? theme.colors.text.primary)

    const [italic, setItalic] = useState<boolean>(!!args.italic)
    const [underline, setUnderline] = useState<boolean>(!!args.underline)
    const [ellipsis, setEllipsis] = useState<boolean>(!!args.ellipsis)

    useEffect(() => {
      setText(typeof args.text === "string" ? args.text : "Typography")
    }, [args.text])

    useEffect(() => {
      setVariant(isVariantKey(args.variant) ? args.variant : "b1Medium")
    }, [args.variant])

    useEffect(() => {
      setAsTag(args.as ?? "p")
    }, [args.as])

    useEffect(() => {
      setAlign(args.align ?? "left")
    }, [args.align])

    useEffect(() => {
      setColor(args.color ?? theme.colors.text.primary)
    }, [args.color])

    return (
      <Flex direction="column" gap={12} width="100%">
        <Box
          width="100%"
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
            padding: 12,
          }}
        >
          <Flex direction="column" gap={10} width="100%" p={10}>
            <TextField
              label="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="문자열 입력 (\\n 줄바꿈 지원)"
              variant="outlined"
              size="M"
              labelPlacement="top"
            />

            <Flex gap={10} wrap="wrap" width="100%" align="center">
              <ToggleButton
                label="variant"
                buttons={variantKeys.map((v) => ({ label: v, value: v }))}
                selectedValue={variant}
                onClick={(v) => {
                  if (isVariantKey(v)) setVariant(v)
                }}
                size="S"
              />
              <ToggleButton
                label="as"
                buttons={asOptions.map((v) => ({ label: v, value: v }))}
                selectedValue={asTag}
                onClick={(v) => {
                  const s = safeAsTag(v)
                  if (!s) return
                  setAsTag(s)
                }}
                size="S"
              />
              <ToggleButton
                label="align"
                buttons={alignOptions.map((v) => ({ label: v, value: v }))}
                selectedValue={align}
                onClick={(v) => {
                  const s = safeAlign(v)
                  if (!s) return
                  setAlign(s)
                }}
                size="S"
              />
            </Flex>

            <Flex gap={10} wrap="wrap" width="100%" align="center">
              <TextField
                label="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder={theme.colors.text.primary}
                variant="outlined"
                size="M"
                labelPlacement="top"
              />
              <ToggleButton
                label="italic"
                buttons={[
                  { label: "false", value: "false" },
                  { label: "true", value: "true" },
                ]}
                selectedValue={italic ? "true" : "false"}
                onClick={(v) => {
                  if (v === "true" || v === "false") setItalic(v === "true")
                }}
                size="S"
              />
              <ToggleButton
                label="underline"
                buttons={[
                  { label: "false", value: "false" },
                  { label: "true", value: "true" },
                ]}
                selectedValue={underline ? "true" : "false"}
                onClick={(v) => {
                  if (v === "true" || v === "false") setUnderline(v === "true")
                }}
                size="S"
              />
              <ToggleButton
                label="ellipsis"
                buttons={[
                  { label: "false", value: "false" },
                  { label: "true", value: "true" },
                ]}
                selectedValue={ellipsis ? "true" : "false"}
                onClick={(v) => {
                  if (v === "true" || v === "false") setEllipsis(v === "true")
                }}
                size="S"
              />
            </Flex>
          </Flex>
        </Box>

        <Flex
          direction="column"
          p={10}
          gap={10}
          width="100%"
          sx={{ backgroundColor: theme.colors.background.default }}
        >
          <Typography variant="b1Bold" text="Preview" />

          <Box
            width="100%"
            sx={{
              border: `1px solid ${theme.colors.border.default}`,
              borderRadius: theme.borderRadius[8],
              padding: 12,
            }}
          >
            <Typography
              text={text}
              variant={variant}
              as={asTag}
              align={align}
              color={color}
              italic={italic}
              underline={underline}
              ellipsis={ellipsis}
              p={args.p}
              px={args.px}
              py={args.py}
              pt={args.pt}
              pr={args.pr}
              pb={args.pb}
              pl={args.pl}
              m={args.m}
              mx={args.mx}
              my={args.my}
              mt={args.mt}
              mr={args.mr}
              mb={args.mb}
              ml={args.ml}
              width={args.width}
              height={args.height}
              bgColor={args.bgColor}
              sx={args.sx}
            />
          </Box>

          <Box
            width="260px"
            sx={{
              border: `1px solid ${theme.colors.border.default}`,
              borderRadius: theme.borderRadius[8],
              padding: 12,
            }}
          >
            <Typography
              variant={variant}
              as={asTag}
              align={align}
              color={color}
              italic={italic}
              underline={underline}
              ellipsis
              text="Ellipsis demo: this text should be truncated inside a constrained box width"
            />
          </Box>
        </Flex>
      </Flex>
    )
  },
}

import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Box from "./Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Box> = {
  title: "Components/Box",
  component: Box,
  parameters: { layout: "centered" },
  argTypes: {
    as: { control: { type: "select" }, options: ["div", "section", "article", "main"] },
    children: { control: false },

    p: { control: { type: "text" } },
    pt: { control: { type: "text" } },
    pr: { control: { type: "text" } },
    pb: { control: { type: "text" } },
    pl: { control: { type: "text" } },
    px: { control: { type: "text" } },
    py: { control: { type: "text" } },

    m: { control: { type: "text" } },
    mt: { control: { type: "text" } },
    mr: { control: { type: "text" } },
    mb: { control: { type: "text" } },
    ml: { control: { type: "text" } },
    mx: { control: { type: "text" } },
    my: { control: { type: "text" } },

    width: { control: { type: "text" } },
    height: { control: { type: "text" } },

    bgColor: { control: { type: "text" } },
    sx: { control: false },

    id: { control: { type: "text" } },
    className: { control: { type: "text" } },
  },
  args: {
    as: "div",
    p: "12px",
    width: "360px",
    height: "140px",
    bgColor: "#F5F5F5",
    id: "box-demo",
    className: "",
  },
}

export default meta
type Story = StoryObj<typeof Box>

const PlaygroundView = (args: React.ComponentProps<typeof Box>) => {
  const [toggle, setToggle] = useState(false)

  const sx = useMemo(
    () => ({
      borderRadius: "12px",
      border: "1px solid #D0D0D0",
      transition: "transform 0.15s ease",
      "&:hover": { transform: "translateY(-1px)" },
      ...(toggle ? { outline: "2px solid #999999" } : {}),
    }),
    [toggle],
  )

  return (
    <Flex direction="column" gap="12px" width="420px">
      <Flex align="center" justify="space-between">
        <Typography text="Playground" variant="b2Regular" />
        <Button
          text={toggle ? "Outline OFF" : "Outline ON"}
          variant="outlined"
          color="normal"
          size="S"
          onClick={() => setToggle((p) => !p)}
        />
      </Flex>

      <Box {...args} sx={sx}>
        <Typography
          text={`p=${String(args.p ?? "")}, width=${String(args.width ?? "")}, height=${String(args.height ?? "")}`}
          variant="b2Regular"
        />
        <Typography text={`bgColor=${String((args as any).bgColor ?? "")}`} variant="b3Regular" />
      </Box>
    </Flex>
  )
}

export const Playground: Story = {
  render: (args) => <PlaygroundView {...args} />,
}

export const AllCases: Story = {
  render: () => {
    return (
      <Flex direction="column" gap="16px" width="740px">
        <Typography text="Spacing" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <Box
            p="8px"
            width="220px"
            height="80px"
            bgColor="#F5F5F5"
            sx={{ border: "1px solid #DDD" }}
          >
            <Typography text="p=8px" variant="b2Regular" />
          </Box>
          <Box
            px="16px"
            py="10px"
            width="220px"
            height="80px"
            bgColor="#F5F5F5"
            sx={{ border: "1px solid #DDD" }}
          >
            <Typography text="px/py" variant="b2Regular" />
          </Box>
          <Box
            pt="16px"
            pl="16px"
            width="220px"
            height="80px"
            bgColor="#F5F5F5"
            sx={{ border: "1px solid #DDD" }}
          >
            <Typography text="pt/pl" variant="b2Regular" />
          </Box>
        </Flex>

        <Typography text="Size" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <Box width="160px" height="60px" bgColor="#F5F5F5" sx={{ border: "1px solid #DDD" }}>
            <Typography text="160x60" variant="b2Regular" />
          </Box>
          <Box width="240" height={80} bgColor="#F5F5F5" sx={{ border: "1px solid #DDD" }}>
            <Typography text="number width/height" variant="b2Regular" />
          </Box>
        </Flex>

        <Typography text="sx selectors/media" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <Box
            p="12px"
            width="220px"
            height="90px"
            bgColor="#F5F5F5"
            sx={{
              border: "1px solid #DDD",
              "&:hover": { transform: "scale(1.02)" },
              "@media (max-width: 600px)": { borderRadius: "18px" },
              transition: "transform 0.15s ease",
            }}
          >
            <Typography text="hover + media" variant="b2Regular" />
          </Box>
        </Flex>

        <Typography text="as prop" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <Box
            as="section"
            p="12px"
            width="220px"
            height="80px"
            bgColor="#F5F5F5"
            sx={{ border: "1px solid #DDD" }}
          >
            <Typography text="as=section" variant="b2Regular" />
          </Box>
          <Box
            as="article"
            p="12px"
            width="220px"
            height="80px"
            bgColor="#F5F5F5"
            sx={{ border: "1px solid #DDD" }}
          >
            <Typography text="as=article" variant="b2Regular" />
          </Box>
        </Flex>
      </Flex>
    )
  },
}

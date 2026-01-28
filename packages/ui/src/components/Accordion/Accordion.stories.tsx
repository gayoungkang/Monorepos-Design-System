import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import Accordion from "./Accordion"
import type { AccordionProps } from "./Accordion"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: { layout: "fullscreen" },
  argTypes: {
    expanded: { control: "boolean" },
    defaultExpanded: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { action: "onChange" },
    summary: { control: false },
    children: { control: false },
  },
  args: {
    disabled: false,
    defaultExpanded: false,
  },
}

export default meta
type Story = StoryObj<typeof Accordion>

const Content = () => (
  <Box
    sx={{
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      padding: "12px",
    }}
  >
    <Typography
      variant="b2Regular"
      text="Details 영역입니다. 텍스트/컴포넌트/리스트 등 어떤 콘텐츠도 들어갈 수 있습니다."
    />
  </Box>
)

export const Uncontrolled: Story = {
  render: (args) => {
    return (
      <Box p="20px" width="720px">
        <Typography variant="h3" text="Uncontrolled (defaultExpanded)" mb="12px" />
        <Accordion {...(args as AccordionProps)} summary="Uncontrolled Accordion">
          <Content />
        </Accordion>
      </Box>
    )
  },
}

export const Controlled: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(false)

    return (
      <Box p="20px" width="720px">
        <Typography variant="h3" text="Controlled (expanded/onChange)" mb="12px" />

        <Flex gap="10px" mb="12px" align="center">
          <Button
            text={expanded ? "Collapse" : "Expand"}
            variant="outlined"
            color="normal"
            onClick={() => setExpanded((v) => !v)}
          />
          <Typography variant="b3Regular" text={`expanded = ${String(expanded)}`} color="#666666" />
        </Flex>

        <Accordion
          expanded={expanded}
          onChange={(next) => setExpanded(next)}
          summary={<Typography variant="b1Bold" text="Controlled Accordion Summary (Custom)" />}
        >
          <Content />
        </Accordion>
      </Box>
    )
  },
}

export const Disabled: Story = {
  render: () => {
    return (
      <Box p="20px" width="720px">
        <Typography variant="h3" text="Disabled" mb="12px" />
        <Accordion disabled summary="Disabled Accordion">
          <Content />
        </Accordion>
      </Box>
    )
  },
}

export const MultipleAndSingleOpen: Story = {
  render: () => {
    const items = useMemo(
      () => [
        { id: "a", title: "Section A" },
        { id: "b", title: "Section B" },
        { id: "c", title: "Section C" },
      ],
      [],
    )

    const [openId, setOpenId] = useState<string | null>("a")

    return (
      <Box p="20px" width="720px">
        <Typography variant="h3" text="Multiple (single-open behavior)" mb="12px" />
        <Typography
          variant="b3Regular"
          text={`openId = ${openId ?? "null"}`}
          color="#666666"
          mb="12px"
        />

        <Flex direction="column" gap="10px">
          {items.map((it) => (
            <Accordion
              key={it.id}
              expanded={openId === it.id}
              onChange={(next) => setOpenId(next ? it.id : null)}
              summary={it.title}
            >
              <Content />
            </Accordion>
          ))}
        </Flex>
      </Box>
    )
  },
}

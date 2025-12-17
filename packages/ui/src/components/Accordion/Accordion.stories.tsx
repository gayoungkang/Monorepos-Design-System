import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Accordion, { AccordionProps } from "./Accordion"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { useState } from "react"

/* -------------------------------------------------------------------------- */
/*                                    Meta                                    */
/* -------------------------------------------------------------------------- */

const meta: Meta<AccordionProps> = {
  title: "components/Accordion",
  component: Accordion,

  args: {
    summary: "Accordion Title",
    defaultExpanded: false,
    disabled: false,
  },

  argTypes: {
    summary: { control: "text" },
    defaultExpanded: { control: "boolean" },
    disabled: { control: "boolean" },
    expanded: { control: false },
    onChange: { control: false },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Box p="24px" width="400px">
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<AccordionProps>

/* -------------------------------------------------------------------------- */
/*                                  Default                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: (args) => (
    <Accordion {...args}>
      <Typography text="기본 아코디언 내용입니다." />
    </Accordion>
  ),
}

/* -------------------------------------------------------------------------- */
/*                               Uncontrolled                                  */
/* -------------------------------------------------------------------------- */

export const Uncontrolled: Story = {
  render: () => (
    <Accordion summary="Uncontrolled Accordion" defaultExpanded>
      <Typography text="defaultExpanded=true 로 동작합니다." />
    </Accordion>
  ),
}

/* -------------------------------------------------------------------------- */
/*                                Controlled                                   */
/* -------------------------------------------------------------------------- */

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <Accordion
        summary={`Controlled Accordion (expanded = ${open})`}
        expanded={open}
        onChange={setOpen}
      >
        <Typography text="Story 내부에서 expanded 상태를 제어합니다." />
      </Accordion>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                                  Disabled                                   */
/* -------------------------------------------------------------------------- */

export const Disabled: Story = {
  render: () => (
    <Accordion summary="Disabled Accordion" disabled>
      <Typography text="비활성 상태에서는 토글되지 않습니다." />
    </Accordion>
  ),
}

/* -------------------------------------------------------------------------- */
/*                             Multiple Accordions                             */
/* -------------------------------------------------------------------------- */

export const Multiple: Story = {
  render: () => (
    <Flex direction="column" gap="12px">
      <Accordion summary="첫 번째 아코디언">
        <Typography text="첫 번째 내용입니다." />
      </Accordion>

      <Accordion summary="두 번째 아코디언" defaultExpanded>
        <Typography text="두 번째 내용입니다." />
      </Accordion>

      <Accordion summary="세 번째 아코디언">
        <Typography text="세 번째 내용입니다." />
      </Accordion>
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                           Custom Summary Component                          */
/* -------------------------------------------------------------------------- */

export const CustomSummary: Story = {
  render: () => (
    <Accordion
      summary={
        <Flex align="center" gap="8px">
          <Typography text="🔧 커스텀 Summary" variant="b1Medium" />
          <Typography text="(아이콘, 텍스트 조합 가능)" variant="b3Regular" />
        </Flex>
      }
    >
      <Typography text="summary 에 ReactNode 전달하여 원하는 UI 구성 가능" />
    </Accordion>
  ),
}

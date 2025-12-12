import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { useState } from "react"
import ResizablePanel, { ResizablePanelProps } from "./ResizablePanel"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"

/* -------------------------------------------------------------------------- */
/*                         Interactive Wrapper (필수)                         */
/* -------------------------------------------------------------------------- */

const PanelInteractive = (props: ResizablePanelProps) => {
  const [key, setKey] = useState(0)

  // Storybook Controls로 size 조정 시 강제 remount
  const reset = () => setKey((k) => k + 1)

  return (
    <Box width="100%" height="400px">
      <ResizablePanel key={key} {...props}>
        <Flex
          align="center"
          justify="center"
          sx={{ width: "100%", height: "100%", backgroundColor: theme.colors.background.default }}
        >
          Content Area
        </Flex>
      </ResizablePanel>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Meta 설정                                  */
/* -------------------------------------------------------------------------- */

const meta: Meta<ResizablePanelProps> = {
  title: "components/ResizablePanel",
  component: PanelInteractive,

  args: {
    direction: "vertical",
    minSize: 100,
    maxSize: 800,
    initialSize: 300,
    borderRadius: "8px",
  },

  argTypes: {
    direction: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "드래그 방향",
    },
    minSize: { control: "number", description: "최소 크기(px)" },
    maxSize: { control: "number", description: "최대 크기(px)" },
    initialSize: { control: "number", description: "초기 크기(px)" },
    borderRadius: { control: "text", description: "패널 border-radius" },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<ResizablePanelProps>

/* -------------------------------------------------------------------------- */
/*                                    Stories                                  */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: (args) => <PanelInteractive {...args} />,
}

/* ---------------------------- Vertical Panel --------------------------- */
export const Vertical: Story = {
  render: (args) => <PanelInteractive {...args} />,
  args: { direction: "vertical" },
}

/* ---------------------------- Horizontal Panel --------------------------- */
export const Horizontal: Story = {
  render: (args) => <PanelInteractive {...args} />,
  args: { direction: "horizontal" },
}

/* ---------------------------- Initial Size 비교 --------------------------- */
export const SizeVariants: Story = {
  render: (args) => (
    <Flex gap="24px">
      <Box width="300px" height="300px">
        <PanelInteractive {...args} initialSize={150} />
      </Box>

      <Box width="300px" height="300px">
        <PanelInteractive {...args} initialSize={300} />
      </Box>

      <Box width="300px" height="300px">
        <PanelInteractive {...args} initialSize={500} />
      </Box>
    </Flex>
  ),
}

/* -------------------------- Vertical / Horizontal 함께 보기 -------------------------- */
export const DirectionComparison: Story = {
  render: (args) => (
    <Flex gap="24px">
      <Box width="300px" height="300px">
        <PanelInteractive {...args} direction="vertical" />
      </Box>

      <Box width="300px" height="300px">
        <PanelInteractive {...args} direction="horizontal" />
      </Box>
    </Flex>
  ),
}

/* ---------------------------- Demo Grid Example --------------------------- */
export const DemoGrid: Story = {
  render: () => (
    <Flex direction="column" gap="32px">
      <Box width="300px" height="300px">
        <PanelInteractive direction="vertical" initialSize={250}>
          <Flex align="center" justify="center" sx={{ height: "100%" }}>
            Vertical Example
          </Flex>
        </PanelInteractive>
      </Box>

      <Box width="100%" height="250px">
        <PanelInteractive direction="horizontal" initialSize={120}>
          <Flex align="center" justify="center" sx={{ width: "100%" }}>
            Horizontal Example
          </Flex>
        </PanelInteractive>
      </Box>
    </Flex>
  ),
}

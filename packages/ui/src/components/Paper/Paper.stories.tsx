import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import Paper from "./Paper"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"

const meta: Meta<typeof Paper> = {
  title: "components/Paper",
  component: Paper,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
  argTypes: {
    elevation: {
      control: { type: "number", min: 0, max: 24, step: 1 },
      description: "그림자 레벨 (0~24)",
    },
    radius: {
      control: "text",
      description: "border-radius (theme.borderRadius 키 또는 px 값)",
    },
  },
}

export default meta

type Story = StoryObj<typeof Paper>

/**
 * 기본 사용 예제
 */
export const Default: Story = {
  args: {
    elevation: 1,
    radius: 4,
    children: "기본 Paper",
  },
}

/**
 * elevation 단계 비교
 */
export const ElevationLevels: Story = {
  render: (args) => (
    <Flex direction="column" gap="16px">
      <Paper {...args} elevation={0} sx={{ backgroundColor: theme.colors.grayscale[100] }}>
        elevation 0
      </Paper>
      <Paper {...args} elevation={2} sx={{ backgroundColor: theme.colors.grayscale[100] }}>
        elevation 2
      </Paper>
      <Paper {...args} elevation={8} sx={{ backgroundColor: theme.colors.grayscale[100] }}>
        elevation 8
      </Paper>
      <Paper {...args} elevation={16} sx={{ backgroundColor: theme.colors.grayscale[100] }}>
        elevation 16
      </Paper>
    </Flex>
  ),
  args: {
    radius: 4,
  },
}

/**
 * radius 변화 예제
 */
export const RadiusVariants: Story = {
  render: (args) => (
    <Flex gap={"16px"}>
      <Paper {...args} radius={0}>
        radius 0
      </Paper>
      <Paper {...args} radius={4}>
        radius 4 (기본)
      </Paper>
      <Paper {...args} radius={"16px"}>
        radius "16px"
      </Paper>
    </Flex>
  ),
  args: {
    elevation: 2,
  },
}

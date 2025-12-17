import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Skeleton, { SkeletonProps } from "./Skeleton"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Flex from "../Flex/Flex"

/* -------------------------------------------------------------------------- */
/*                                    Meta                                    */
/* -------------------------------------------------------------------------- */

const meta: Meta<SkeletonProps> = {
  title: "components/Skeleton",
  component: Skeleton,

  args: {
    variant: "text",
    width: "100%",
    height: undefined,
    animation: "wave",
  },

  argTypes: {
    variant: {
      control: "select",
      options: ["text", "rectangular", "rounded", "circular"],
    },
    animation: {
      control: "radio",
      options: ["wave", "none"],
    },
    width: { control: "text" },
    height: { control: "text" },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Box p="24px">
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<SkeletonProps>

/* -------------------------------------------------------------------------- */
/*                                  Default                                   */
/* -------------------------------------------------------------------------- */

/** Controls 로 변경 가능한 기본 Skeleton */
export const Default: Story = {
  render: (args) => (
    <Box width={"200px"}>
      <Skeleton {...args} />
    </Box>
  ),
}

/* -------------------------------------------------------------------------- */
/*                             Variant Showcase                               */
/* -------------------------------------------------------------------------- */

export const Variants: Story = {
  render: () => (
    <Flex direction="column" gap="20px" width="200px">
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rectangular" width="100%" height="40px" />
      <Skeleton variant="rounded" width="100%" height="40px" />
      <Skeleton variant="circular" width="40px" height="40px" />
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                            Animation Options                               */
/* -------------------------------------------------------------------------- */

export const Animation: Story = {
  args: {
    animation: "wave",
  },

  render: () => (
    <Flex gap="24px">
      <Skeleton width="120px" height="24px" animation="wave" />
      <Skeleton width="120px" height="24px" animation="none" />
    </Flex>
  ),
}

/* -------------------------------------------------------------------------- */
/*                          Skeleton With Children                             */
/* -------------------------------------------------------------------------- */

export const WithChildren: Story = {
  args: {
    animation: "none",
  },

  render: () => (
    <Skeleton width="200px" height="40px">
      <Typography text="실제 콘텐츠" />
    </Skeleton>
  ),
}

/* -------------------------------------------------------------------------- */
/*                         Multiple Skeleton Lines                            */
/* -------------------------------------------------------------------------- */

export const TextLines: Story = {
  render: () => (
    <Box width="220px">
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="90%" mt="8px" />
      <Skeleton variant="text" width="75%" mt="8px" />
      <Skeleton variant="text" width="60%" mt="8px" />
    </Box>
  ),
}

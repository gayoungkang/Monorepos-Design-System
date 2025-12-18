import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Breadcrumbs, { BreadcrumbsProps } from "./Breadcrumbs"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"

const meta: Meta<BreadcrumbsProps> = {
  title: "components/Breadcrumbs",
  component: Breadcrumbs,

  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Category", onClick: () => console.log("Category clicked") },
      { label: "Subpage", href: "/sub" },
      { label: "Detail" },
    ],
    maxItems: undefined,
  },

  argTypes: {
    items: { control: "object" },
    maxItems: { control: "number" },
    separator: { control: false },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Flex p="20px">
          <Story />
        </Flex>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<BreadcrumbsProps>

/* -------------------------------------------------------------------------- */
/*                                  Default                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {}

/* -------------------------------------------------------------------------- */
/*                           Custom Separator Example                          */
/* -------------------------------------------------------------------------- */

export const CustomSeparator: Story = {
  render: (args) => <Breadcrumbs {...args} separator={<Typography text="/" />} />,
}

/* -------------------------------------------------------------------------- */
/*                              Max Items Example                              */
/* -------------------------------------------------------------------------- */

export const MaxItems: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Home" },
        { label: "Section" },
        { label: "Category" },
        { label: "SubCategory" },
        { label: "Product" },
        { label: "Details" },
      ]}
      maxItems={4}
    />
  ),
}

/* -------------------------------------------------------------------------- */
/*                           Clickable Items Example                           */
/* -------------------------------------------------------------------------- */

export const ClickableItems: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        {
          label: "Home",
          onClick: () => alert("Home clicked"),
        },
        {
          label: "Library",
          onClick: () => alert("Library clicked"),
        },
        { label: "Data" },
      ]}
    />
  ),
}

/* -------------------------------------------------------------------------- */
/*                        Mixed href + onClick Example                         */
/* -------------------------------------------------------------------------- */

export const Mixed: Story = {
  render: () => (
    <Breadcrumbs
      items={[
        { label: "Dashboard", href: "/" },
        { label: "Users", onClick: () => alert("Users clicked") },
        { label: "User Details" },
      ]}
    />
  ),
}

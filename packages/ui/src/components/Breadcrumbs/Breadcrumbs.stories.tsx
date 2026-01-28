import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Breadcrumbs from "./Breadcrumbs"
import type { BreadcrumbItem, BreadcrumbsProps } from "./Breadcrumbs"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import Icon from "../Icon/Icon"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Breadcrumbs> = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  parameters: { layout: "fullscreen" },
  argTypes: {
    maxItems: { control: "number" },
    separator: { control: false },
    items: { control: false },
  },
  args: {
    maxItems: undefined,
  },
}

export default meta
type Story = StoryObj<typeof Breadcrumbs>

export const Playground: Story = {
  render: (args) => {
    const items = useMemo<BreadcrumbItem[]>(
      () => [
        { label: "Home", onClick: () => undefined },
        { label: "Library", onClick: () => undefined },
        { label: "Category", onClick: () => undefined },
        { label: "Detail" },
      ],
      [],
    )

    return (
      <Box p="20px">
        <Typography variant="h3" text="Breadcrumbs Playground" mb="12px" />
        <Breadcrumbs {...(args as BreadcrumbsProps)} items={items} />
      </Box>
    )
  },
}

export const MaxItemsInteractive: Story = {
  render: () => {
    const baseItems = useMemo<BreadcrumbItem[]>(
      () => [
        { label: "Home", onClick: () => undefined },
        { label: "Products", onClick: () => undefined },
        { label: "Electronics", onClick: () => undefined },
        { label: "Cameras", onClick: () => undefined },
        { label: "Mirrorless", onClick: () => undefined },
        { label: "Detail" },
      ],
      [],
    )

    const [maxItems, setMaxItems] = useState<number | undefined>(3)

    return (
      <Box p="20px">
        <Typography variant="h3" text="maxItems behavior" mb="12px" />

        <Flex gap="10px" mb="12px" wrap="wrap">
          <Button
            text="maxItems=undefined"
            variant="outlined"
            color="normal"
            onClick={() => setMaxItems(undefined)}
          />
          {[2, 3, 4, 5].map((v) => (
            <Button
              key={v}
              text={`maxItems=${v}`}
              variant="text"
              color="secondary"
              onClick={() => setMaxItems(v)}
            />
          ))}
        </Flex>

        <Breadcrumbs items={baseItems} maxItems={maxItems} />
      </Box>
    )
  },
}

export const CustomSeparator: Story = {
  render: () => {
    const items: BreadcrumbItem[] = [
      { label: "Home", onClick: () => undefined },
      { label: "Docs", onClick: () => undefined },
      { label: "Components", onClick: () => undefined },
      { label: "Breadcrumbs" },
    ]

    return (
      <Box p="20px">
        <Typography variant="h3" text="Custom separator" mb="12px" />
        <Breadcrumbs items={items} separator={<Icon name="ArrowRight" size={14} />} />
      </Box>
    )
  },
}

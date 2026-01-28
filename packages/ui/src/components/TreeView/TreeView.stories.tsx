import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import TreeView, { TreeNodeType, TreeViewProps } from "./TreeView"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { theme } from "../../tokens/theme"

const buildSampleItems = (): TreeNodeType[] => [
  {
    id: "root-1",
    label: "Root 1",
    icon: "Folder",
    children: [
      {
        id: "root-1-1",
        label: "Leaf 1-1 (clickable)",
        icon: "File",
        onClick: () => {
          // story no-op
        },
      },
      {
        id: "root-1-2",
        label: "Branch 1-2",
        icon: "Folder",
        children: [
          {
            id: "root-1-2-1",
            label: "Leaf 1-2-1",
            icon: "File",
            onClick: () => {
              // story no-op
            },
          },
          {
            id: "root-1-2-2",
            label: "Leaf 1-2-2 (disabled)",
            icon: "File",
            disabled: true,
            onClick: () => {
              // story no-op
            },
          },
        ],
      },
      {
        id: "root-1-3",
        label: "Leaf 1-3",
        icon: "File",
        onClick: () => {
          // story no-op
        },
      },
    ],
  },
  {
    id: "root-2",
    label: "Root 2 (disabled)",
    icon: "Folder",
    disabled: true,
    children: [
      {
        id: "root-2-1",
        label: "Leaf 2-1",
        icon: "File",
        onClick: () => {
          // story no-op
        },
      },
    ],
  },
  {
    id: "root-3",
    label: (
      <Typography
        variant="b1Bold"
        color={theme.colors.text.primary}
        text={"Custom ReactNode Label"}
        sx={{ userSelect: "none" }}
      />
    ),
    icon: "Folder",
    children: [
      {
        id: "root-3-1",
        label: "Leaf 3-1",
        icon: "File",
        onClick: () => {
          // story no-op
        },
      },
    ],
  },
]

type StoryArgs = TreeViewProps

const meta: Meta<StoryArgs> = {
  title: "Components/TreeView",
  component: TreeView,
  argTypes: {
    items: { control: "object" },
    depth: { control: "number" },
    breadth: { control: "number" },

    defaultExpandedIds: { control: "object" },
    expandedIds: { control: "object" },
    onExpandedChange: { control: false },

    defaultSelectedId: { control: "text" },
    selectedId: { control: "text" },
    onSelect: { control: false },

    expandOnLabelClick: { control: "boolean" },
    showHeaderControls: { control: "boolean" },
    showFooterButtons: { control: "boolean" },

    size: { control: "radio", options: ["S", "M", "L"] },

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
    items: buildSampleItems(),
    depth: 3,
    breadth: 4,

    defaultExpandedIds: ["root-1"],
    expandedIds: undefined,

    defaultSelectedId: null,
    selectedId: undefined,

    expandOnLabelClick: false,
    showHeaderControls: true,
    showFooterButtons: true,

    size: "M",

    width: "100%",
  },
}

export default meta

type Story = StoryObj<StoryArgs>

export const Playground: Story = {
  render: (args) => {
    const [expandedIds, setExpandedIds] = useState<string[]>(args.defaultExpandedIds ?? [])
    const [selectedId, setSelectedId] = useState<string | null>(args.defaultSelectedId ?? null)

    const items = useMemo(() => args.items, [args.items])

    return (
      <Flex direction="column" gap={12} width="80%">
        <Flex direction="column" gap={6}>
          <Typography
            variant="b1Bold"
            color={theme.colors.text.secondary}
            text="Playground (controlled expanded/selected via useState)"
          />
          <Typography
            variant="b3Regular"
            color={theme.colors.text.tertiary}
            text={`selectedId: ${selectedId ?? "null"} | expandedIds: [${expandedIds.join(", ")}]`}
          />
        </Flex>

        <TreeView
          {...args}
          items={items}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
        />
      </Flex>
    )
  },
}

export const Variants: Story = {
  render: () => {
    const items = useMemo(() => buildSampleItems(), [])

    const [expandedA, setExpandedA] = useState<string[]>(["root-1"])
    const [selectedA, setSelectedA] = useState<string | null>("root-1-1")

    const [expandedB, setExpandedB] = useState<string[]>([])
    const [selectedB, setSelectedB] = useState<string | null>(null)

    const [expandedC, setExpandedC] = useState<string[]>(["root-1", "root-1-2", "root-3"])
    const [selectedC, setSelectedC] = useState<string | null>("root-3-1")

    return (
      <Flex direction="column" gap={18} width="90%">
        <Section
          title="M / header+footer / label click does NOT expand"
          description={`controlled expanded+selected (interactive)`}
        >
          <TreeView
            items={items}
            size="M"
            expandOnLabelClick={false}
            showHeaderControls
            showFooterButtons
            expandedIds={expandedA}
            onExpandedChange={setExpandedA}
            selectedId={selectedA}
            onSelect={(id) => setSelectedA(id)}
          />
        </Section>

        <Section
          title="S / header only / label click expands"
          description={`controlled expanded+selected (interactive)`}
        >
          <TreeView
            items={items}
            size="S"
            expandOnLabelClick
            showHeaderControls
            showFooterButtons={false}
            expandedIds={expandedB}
            onExpandedChange={setExpandedB}
            selectedId={selectedB}
            onSelect={(id) => setSelectedB(id)}
          />
        </Section>

        <Section
          title="L / footer only / mixed expanded state"
          description={`controlled expanded+selected (interactive)`}
        >
          <TreeView
            items={items}
            size="L"
            expandOnLabelClick={false}
            showHeaderControls={false}
            showFooterButtons
            expandedIds={expandedC}
            onExpandedChange={setExpandedC}
            selectedId={selectedC}
            onSelect={(id) => setSelectedC(id)}
          />
        </Section>

        <Section
          title="Uncontrolled (defaultExpandedIds/defaultSelectedId)"
          description={`uncontrolled selection/expanded (interactive)`}
        >
          <TreeView
            items={items}
            size="M"
            expandOnLabelClick
            showHeaderControls
            showFooterButtons
            defaultExpandedIds={["root-1", "root-1-2"]}
            defaultSelectedId={"root-1-2-1"}
            onSelect={() => {
              // story no-op
            }}
          />
        </Section>
      </Flex>
    )
  },
}

const Section = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => {
  return (
    <Flex direction="column" gap={8} width="100%">
      <Flex direction="column" gap={4}>
        <Typography variant="b1Bold" color={theme.colors.text.primary} text={title} />
        <Typography variant="b3Regular" color={theme.colors.text.tertiary} text={description} />
      </Flex>
      {children}
    </Flex>
  )
}

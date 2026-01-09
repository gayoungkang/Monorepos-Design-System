import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import TreeView from "./TreeView"
import type { TreeNodeType } from "./TreeView"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { theme } from "../../tokens/theme"

/* ------------------------------------------------------------------ */
/* meta */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof TreeView> = {
  title: "Components/TreeView",
  component: TreeView,
  argTypes: {
    items: { control: false },
    depth: { control: { type: "number", min: 1, step: 1 } },
    breadth: { control: { type: "number", min: 1, step: 1 } },
    defaultExpandedIds: { control: false },
    expandedIds: { control: false },
    onExpandedChange: { control: false },
    selectedId: { control: false },
    onSelect: { control: false },
    expandOnLabelClick: { control: "boolean" },
    showHeaderControls: { control: "boolean" },
    showFooterButtons: { control: "boolean" },
  },
  args: {
    depth: 3,
    breadth: 4,
    expandOnLabelClick: false,
    showHeaderControls: true,
    showFooterButtons: true,
  },
  decorators: [
    (Story) => (
      <Box p={24} bgColor={theme.colors.background.default} width="100%">
        <Story />
      </Box>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof TreeView>

/* ------------------------------------------------------------------ */
/* stories */
/* ------------------------------------------------------------------ */

export const Playground: Story = {
  render: (args) => {
    const [expandedIds, setExpandedIds] = useState<string[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [selectedNode, setSelectedNode] = useState<TreeNodeType | null>(null)

    // * TreeViewProps가 HTMLAttributes를 합치며 onSelect가 ReactEventHandler와 교차 타입이 된 케이스 대응
    // * (event) 시그니처도 만족하면서 내부에서 (id, node) 형태로 사용 가능하도록 가변 인수로 처리
    const handleSelect = (...argsAny: any[]) => {
      const idArg = argsAny[0] as string
      const nodeArg = argsAny[1] as TreeNodeType
      if (typeof idArg === "string") setSelectedId(idArg)
      if (nodeArg) setSelectedNode(nodeArg)
    }

    return (
      <Flex direction="column" gap={16} width="100%">
        <Flex gap={8} align="center" wrap="wrap">
          <Button
            text=" Clear expanded (External)"
            variant="outlined"
            onClick={() => setExpandedIds([])}
          />

          <Button
            text="Clear selection"
            variant="outlined"
            onClick={() => {
              setSelectedId(null)
              setSelectedNode(null)
            }}
          />
        </Flex>

        <TreeView
          {...args}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          selectedId={selectedId}
          onSelect={handleSelect as any}
        />

        <Box
          p={12}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          Selected: {selectedId ?? "-"} / Expanded: {expandedIds.length}
        </Box>

        <Box
          p={12}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
            wordBreak: "break-word",
          }}
        >
          {selectedNode ? (
            <>
              <div>Node id: {selectedNode.id}</div>
              <div>Disabled: {selectedNode.disabled ? "true" : "false"}</div>
              <div>Has children: {selectedNode.children?.length ? "true" : "false"}</div>
              <div>Leaf onClick: {selectedNode.onClick ? "true" : "false"}</div>
            </>
          ) : (
            "No node selected"
          )}
        </Box>
      </Flex>
    )
  },
}

export const UncontrolledExpanded: Story = {
  args: {
    depth: 4,
    breadth: 3,
    expandOnLabelClick: true,
    showHeaderControls: true,
    showFooterButtons: true,
    defaultExpandedIds: [],
  },
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const handleSelect = (...argsAny: any[]) => {
      const idArg = argsAny[0] as string
      if (typeof idArg === "string") setSelectedId(idArg)
    }

    return (
      <Flex direction="column" gap={16} width="100%">
        <TreeView {...args} selectedId={selectedId} onSelect={handleSelect as any} />

        <Box
          p={12}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          Selected: {selectedId ?? "-"}
        </Box>
      </Flex>
    )
  },
}

export const CustomItems: Story = {
  args: {
    items: [
      {
        id: "root",
        label: "Root",
        icon: "Folder",
        children: [
          {
            id: "folder-a",
            label: "Folder A",
            icon: "Folder",
            children: [
              {
                id: "file-a-1",
                label: "File A-1",
                icon: "File",
                onClick: () => void 0,
              },
              {
                id: "file-a-2",
                label: "File A-2 (disabled)",
                icon: "File",
                disabled: true,
                onClick: () => void 0,
              },
            ],
          },
          {
            id: "folder-b",
            label: "Folder B",
            icon: "Folder",
            children: [
              {
                id: "file-b-1",
                label: "File B-1",
                icon: "File",
                onClick: () => void 0,
              },
              {
                id: "file-b-2",
                label: "File B-2",
                icon: "File",
                onClick: () => void 0,
              },
            ],
          },
        ],
      },
    ] as any,
    expandOnLabelClick: false,
    showHeaderControls: true,
    showFooterButtons: true,
  },
  render: (args) => {
    const [expandedIds, setExpandedIds] = useState<string[]>(["root", "folder-a"])
    const [selectedId, setSelectedId] = useState<string | null>("file-a-1")

    const handleSelect = (...argsAny: any[]) => {
      const idArg = argsAny[0] as string
      if (typeof idArg === "string") setSelectedId(idArg)
    }

    return (
      <Flex direction="column" gap={16} width="100%">
        <TreeView
          {...args}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          selectedId={selectedId}
          onSelect={handleSelect as any}
        />

        <Box
          p={12}
          bgColor={theme.colors.grayscale[50]}
          sx={{
            border: `1px solid ${theme.colors.border.default}`,
            borderRadius: theme.borderRadius[8],
          }}
        >
          Selected: {selectedId ?? "-"} / Expanded: {expandedIds.length}
        </Box>
      </Flex>
    )
  },
}

import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import ResizablePanel, { ResizablePanelProps } from "./ResizablePanel"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof ResizablePanel> = {
  title: "Components/ResizablePanel",
  component: ResizablePanel,
  parameters: { layout: "fullscreen" },
  argTypes: {
    direction: { control: "radio", options: ["vertical", "horizontal"] },
    minSize: { control: "number" },
    maxSize: { control: "number" },
    initialSize: { control: "number" },
    borderRadius: { control: "text" },

    children: { control: false },

    p: { control: false },
    m: { control: false },
    px: { control: false },
    my: { control: false },
    width: { control: false },
    height: { control: false },
    bgColor: { control: false },
    sx: { control: false },
  },
} satisfies Meta<typeof ResizablePanel>

export default meta
type Story = StoryObj<typeof ResizablePanel>

const PanelContent = ({ title }: { title: string }) => {
  return (
    <Flex direction="column" gap="8px" sx={{ height: "100%", padding: "16px" }}>
      <Typography text={title} variant="b2Regular" color="text.primary" />
      <Box
        width="100%"
        height="100%"
        sx={{
          backgroundColor: "background.default",
          border: "1px dashed",
          borderColor: "border.default",
          borderRadius: "12px",
        }}
      />
      <Typography
        text="드래그 핸들을 잡고 리사이즈 가능"
        variant="b3Regular"
        color="text.secondary"
      />
    </Flex>
  )
}

export const Playground: Story = {
  args: {
    direction: "vertical",
    minSize: 120,
    maxSize: 600,
    initialSize: 280,
    borderRadius: "",
  } as ResizablePanelProps,
  render: (args) => {
    const [seed, setSeed] = useState(0)

    const radius = useMemo(
      () => (args.borderRadius && args.borderRadius.trim() ? args.borderRadius : undefined),
      [args.borderRadius],
    )

    return (
      <Flex sx={{ width: "100vw", height: "100vh", padding: "24px", gap: "16px" }}>
        <Flex direction="column" gap="8px" sx={{ width: "280px" }}>
          <Typography text="Playground" variant="b2Regular" color="text.primary" />
          <Typography
            text="initialSize 변경은 내부 size를 재설정(초기화)한다."
            variant="b3Regular"
            color="text.secondary"
          />
          <Box
            sx={{
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: "12px",
              padding: "12px",
            }}
          >
            <Typography text={`seed: ${seed}`} variant="b3Regular" color="text.secondary" />
            <Box
              sx={{
                marginTop: "8px",
                display: "flex",
                gap: "8px",
              }}
            >
              <Box
                as="button"
                sx={{
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: "border.default",
                  backgroundColor: "background.default",
                  cursor: "pointer",
                }}
                onClick={() => setSeed((p) => p + 1)}
              >
                <Typography text="Re-render" variant="b3Regular" color="text.primary" />
              </Box>
            </Box>
          </Box>
        </Flex>

        <ResizablePanel {...args} borderRadius={radius}>
          <PanelContent title={`ResizablePanel (drag handle) / seed=${seed}`} />
        </ResizablePanel>

        <Box
          sx={{
            flex: 1,
            height: "100%",
            border: "1px solid",
            borderColor: "border.default",
            borderRadius: "12px",
          }}
        />
      </Flex>
    )
  },
}

export const AllCases: Story = {
  render: () => {
    return (
      <Flex direction="column" gap="16px" sx={{ width: "100vw", height: "100vh", padding: "24px" }}>
        <Typography text="AllCases" variant="b2Regular" color="text.primary" />

        <Flex gap="16px" sx={{ flex: 1, minHeight: 0 }}>
          <ResizablePanel direction="vertical" minSize={120} maxSize={520} initialSize={260}>
            <PanelContent title="Vertical (width resize)" />
          </ResizablePanel>

          <Box
            sx={{
              flex: 1,
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: "12px",
            }}
          />
        </Flex>

        <Flex gap="16px" sx={{ flex: 1, minHeight: 0 }}>
          <Flex direction="column" sx={{ width: "100%" }}>
            <ResizablePanel direction="horizontal" minSize={120} maxSize={420} initialSize={220}>
              <PanelContent title="Horizontal (height resize)" />
            </ResizablePanel>

            <Box
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "border.default",
                borderRadius: "12px",
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    )
  },
}

export const Variants: Story = {
  render: () => {
    const variants: Array<{ title: string; props: ResizablePanelProps }> = [
      {
        title: "min=80 / max=420 / initial=180",
        props: {
          minSize: 80,
          maxSize: 420,
          initialSize: 180,
          direction: "vertical",
          children: null as any,
        },
      },
      {
        title: "min=200 / max=800 / initial=360",
        props: {
          minSize: 200,
          maxSize: 800,
          initialSize: 360,
          direction: "vertical",
          children: null as any,
        },
      },
      {
        title: "horizontal small",
        props: {
          minSize: 100,
          maxSize: 320,
          initialSize: 160,
          direction: "horizontal",
          children: null as any,
        },
      },
    ]

    return (
      <Flex direction="column" gap="14px" sx={{ width: "100vw", height: "100vh", padding: "24px" }}>
        <Typography text="Variants" variant="b2Regular" color="text.primary" />

        <Flex direction="column" gap="16px" sx={{ flex: 1, minHeight: 0 }}>
          {variants.map((v) => (
            <Flex key={v.title} direction="column" gap="8px" sx={{ flex: 1, minHeight: 0 }}>
              <Typography text={v.title} variant="b3Regular" color="text.secondary" />
              <Flex gap="16px" sx={{ flex: 1, minHeight: 0 }}>
                <ResizablePanel {...v.props}>
                  <PanelContent title={v.title} />
                </ResizablePanel>
                <Box
                  sx={{
                    flex: 1,
                    border: "1px solid",
                    borderColor: "border.default",
                    borderRadius: "12px",
                  }}
                />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Flex>
    )
  },
}

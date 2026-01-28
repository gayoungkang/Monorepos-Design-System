import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import Button from "./Button"
import type { ButtonProps } from "./Button"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    text: { control: "text" },
    variant: { control: "radio", options: ["contained", "outlined", "text"] },
    color: { control: "radio", options: ["primary", "secondary", "normal"] },
    size: { control: "radio", options: ["S", "M", "L"] },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    startIcon: { control: "text" },
    endIcon: { control: "text" },
    fileUrl: { control: "text" },
    fileName: { control: "text" },
    onClick: { action: "onClick" },
    onDownload: { action: "onDownload" },
    progressProps: { control: false },
    iconProps: { control: false },
    typographyProps: { control: false },
  },
  args: {
    text: "Button",
    variant: "contained",
    color: "primary",
    size: "M",
    disabled: false,
    loading: false,
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Playground: Story = {
  render: (args) => {
    const [count, setCount] = useState(0)
    const [downloadCount, setDownloadCount] = useState(0)

    const isDownloadMode = !!args.fileUrl && !!args.fileName

    return (
      <Flex direction="column" gap="12px" align="flex-start">
        <Typography
          variant="b2Regular"
          text={`click: ${count} / download: ${downloadCount} ${isDownloadMode ? "(download mode)" : ""}`}
          color="#111111"
        />

        <Button
          {...args}
          onClick={(e) => {
            args.onClick?.(e)
            setCount((v) => v + 1)
          }}
          onDownload={async () => {
            args.onDownload?.()
            setDownloadCount((v) => v + 1)
          }}
        />

        <Flex gap="8px">
          <Button
            text="Toggle Loading"
            variant="outlined"
            color="normal"
            onClick={() => {
              ;(args as ButtonProps).loading = !args.loading
            }}
          />
          <Typography
            variant="b3Regular"
            text="(Playground는 Controls로 loading/disabled 변경 권장)"
            color="#666666"
          />
        </Flex>
      </Flex>
    )
  },
}

export const AllVariants: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const variants: ButtonProps["variant"][] = ["contained", "outlined", "text"]
    const colors: ButtonProps["color"][] = ["primary", "secondary", "normal"]
    const sizes: ButtonProps["size"][] = ["S", "M", "L"]

    const iconCandidates = useMemo(
      () => ({
        startIcon: "chevron-left" as any,
        endIcon: "chevron-right" as any,
      }),
      [],
    )

    return (
      <Box p="20px" width="900px">
        <Typography variant="h3" text="Button – Variant/Color/Size Matrix" mb="12px" />

        <Flex direction="column" gap="18px">
          {variants.map((variant) => (
            <Box key={variant}>
              <Typography variant="b1Bold" text={`variant: ${variant}`} mb="8px" />

              <Flex direction="column" gap="10px">
                {colors.map((color) => (
                  <Box key={`${variant}-${color}`}>
                    <Typography variant="b2Regular" text={`color: ${color}`} mb="6px" />

                    <Flex gap="10px" wrap="wrap">
                      {sizes.map((size) => (
                        <Button
                          key={`${variant}-${color}-${size}`}
                          text={`${size}`}
                          variant={variant}
                          color={color}
                          size={size}
                          startIcon={iconCandidates.startIcon}
                          endIcon={iconCandidates.endIcon}
                          onClick={() => undefined}
                        />
                      ))}

                      <Button
                        text="disabled"
                        variant={variant}
                        color={color}
                        size="M"
                        disabled
                        startIcon={iconCandidates.startIcon}
                        endIcon={iconCandidates.endIcon}
                        onClick={() => undefined}
                      />

                      <Button
                        text="loading"
                        variant={variant}
                        color={color}
                        size="M"
                        loading
                        startIcon={iconCandidates.startIcon}
                        endIcon={iconCandidates.endIcon}
                        onClick={() => undefined}
                      />
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>
    )
  },
}

export const DownloadAndOverride: Story = {
  render: () => {
    const [mode, setMode] = useState<"default" | "override">("default")
    const [log, setLog] = useState<string[]>([])

    const fileUrl = "data:text/plain;charset=utf-8,Hello%20Design%20System"
    const fileName = "hello.txt"

    return (
      <Flex direction="column" gap="12px" align="flex-start">
        <Typography
          variant="b1Bold"
          text="Download mode (fileUrl+fileName) + onDownload override"
        />

        <Flex gap="8px">
          <Button
            text="Use default anchor download"
            variant={mode === "default" ? "contained" : "outlined"}
            color="primary"
            onClick={() => setMode("default")}
          />
          <Button
            text="Use onDownload override"
            variant={mode === "override" ? "contained" : "outlined"}
            color="secondary"
            onClick={() => setMode("override")}
          />
        </Flex>

        <Button
          text={mode === "default" ? "Download (default)" : "Download (override)"}
          color="primary"
          variant="contained"
          fileUrl={fileUrl}
          fileName={fileName}
          onDownload={
            mode === "override"
              ? async () => {
                  setLog((prev) => [
                    `override download called: ${new Date().toLocaleTimeString()}`,
                    ...prev,
                  ])
                }
              : undefined
          }
        />

        <Box width="520px" p="12px" bgColor="#f7f7f7">
          <Typography variant="b2Regular" text="Logs" mb="8px" />
          {log.length === 0 ? (
            <Typography variant="b3Regular" text="(empty)" color="#666666" />
          ) : (
            log.slice(0, 6).map((t) => <Typography key={t} variant="b3Regular" text={`- ${t}`} />)
          )}
        </Box>
      </Flex>
    )
  },
}

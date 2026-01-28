import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import Modal from "./Modal"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"
import Divider from "../Divider/Divider"
import IconButton from "../IconButton/IconButton"
import { theme } from "../../tokens/theme"

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: { layout: "padded" },
  argTypes: {
    onClose: { action: "onClose" },
    onConfirm: { action: "onConfirm" },
    headerComponent: { control: false },
    footerComponent: { control: false },
    children: { control: false },
    bodySx: { control: false },
    container: { control: false },
  },
  args: {
    width: "420px",
    title: "Modal Title",
    open: false,
    allowBackdrop: false,
    confirmText: "확인",
    closeText: "취소",
  },
}
export default meta
type Story = StoryObj<typeof Modal>

export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)

    return (
      <Box>
        <Typography variant="h3" text="Modal Playground" mb="12px" />

        <Flex gap="8px" align="center" wrap="wrap" mb="12px">
          <Button text="Open Modal" onClick={() => setOpen(true)} />
          <Button
            text={`allowBackdrop: ${args.allowBackdrop ? "true" : "false"}`}
            variant="outlined"
            color="normal"
            onClick={() => {}}
          />
        </Flex>

        <Modal
          {...args}
          open={open}
          onClose={() => {
            args.onClose?.()
            setOpen(false)
          }}
          onConfirm={() => {
            args.onConfirm?.()
            setOpen(false)
          }}
        >
          <Typography
            variant="b2Regular"
            text="Body content. 스크롤/포커스/ESC/버튼 동작 확인."
            color={theme.colors.text.secondary}
          />
          <Box mt="12px">
            <Typography
              variant="b3Regular"
              text={
                "- ESC: 닫기\n- Confirm 버튼 자동 포커스\n- allowBackdrop=true면 배경 클릭 닫기"
              }
              sx={{ whiteSpace: "pre-line" }}
              color={theme.colors.text.tertiary}
            />
          </Box>
          <Box mt="12px">
            <Divider />
          </Box>
          <Box mt="12px">
            {Array.from({ length: 18 }).map((_, i) => (
              <Typography
                key={i}
                variant="b3Regular"
                text={`Row ${i + 1}`}
                color={theme.colors.text.secondary}
                mb="6px"
              />
            ))}
          </Box>
        </Modal>
      </Box>
    )
  },
}

export const WithCustomHeaderFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    const header = useMemo(
      () => (
        <>
          <Flex justify="space-between" align="center" p="10px 16px">
            <Typography variant="h2" text="Custom Header" />
            <IconButton
              disableInteraction
              onClick={() => setOpen(false)}
              icon="CloseLine"
              iconProps={{ color: theme.colors.grayscale[400] }}
            />
          </Flex>
          <Divider />
        </>
      ),
      [],
    )

    const footer = useMemo(
      () => (
        <>
          <Divider />
          <Flex justify="flex-end" align="center" p="12px 16px" gap="8px">
            <Button color="normal" variant="text" text="Close" onClick={() => setOpen(false)} />
            <Button text="Confirm" onClick={() => setOpen(false)} />
          </Flex>
        </>
      ),
      [],
    )

    return (
      <Box>
        <Typography variant="h3" text="Custom Header / Footer" mb="12px" />
        <Button text="Open" onClick={() => setOpen(true)} />

        <Modal
          open={open}
          width="520px"
          allowBackdrop
          headerComponent={header}
          footerComponent={footer}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          bodySx={{ p: "16px" }}
        >
          <Typography
            variant="b2Regular"
            text="headerComponent/footerComponent 적용 케이스."
            color={theme.colors.text.secondary}
          />
        </Modal>
      </Box>
    )
  },
}

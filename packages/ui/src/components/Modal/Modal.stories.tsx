import { useState, Suspense } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Modal, { type BasicModalProps } from "./Modal"
import Button from "../Button/Button"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import React from "react"
import Progress from "../Progress/Progress"

/* ----------------------------- Lazy Component ----------------------------- */

const LazyContent = React.lazy<React.ComponentType<any>>(
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          default: (() => (
            <Typography text="비동기 로드 완료된 콘텐츠입니다." />
          )) as React.ComponentType<any>,
        })
      }, 1500)
    }),
)

/* ----------------------------- Story Meta ----------------------------- */
const meta: Meta<BasicModalProps> = {
  title: "components/Modal",
  component: Modal,

  args: {
    open: false,
    title: "기본 모달",
    allowBackdrop: true,
    width: "420px",
  },

  argTypes: {
    /* UI */
    width: { control: "text", description: "모달 너비" },
    title: { control: "text" },
    allowBackdrop: { control: "boolean" },

    /* Base Props */
    p: { control: "text" },
    mt: { control: "text" },
    mb: { control: "text" },
    sx: { control: false },

    /* Disabled Controls */
    headerComponent: { control: false },
    footerComponent: { control: false },
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
type Story = StoryObj<BasicModalProps>

/* ----------------------------- Default Story ----------------------------- */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button text="모달 열기" onClick={() => setOpen(true)} />

        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        >
          <Typography text="기본 모달 내용입니다." />
        </Modal>
      </>
    )
  },
}

/* ----------------------------- Custom Header ----------------------------- */
export const WithCustomHeader: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button text="커스텀 헤더 모달 열기" onClick={() => setOpen(true)} />

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          headerComponent={
            <Flex justify="space-between" align="center" p="16px">
              <Typography variant="h2" text="커스텀 헤더" />
              <Button text="닫기" variant="text" onClick={() => setOpen(false)} />
            </Flex>
          }
        >
          <Typography text="헤더가 커스텀된 모달입니다." />
        </Modal>
      </>
    )
  },
}

/* ----------------------------- Footer Component ----------------------------- */
export const WithFooterComponent: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button text="커스텀 푸터 모달 열기" onClick={() => setOpen(true)} />

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          footerComponent={
            <Flex justify="flex-end" align="center" p="16px" gap="8px">
              <Button text="취소" onClick={() => setOpen(false)} />
              <Button text="수락" color="primary" onClick={() => setOpen(false)} />
            </Flex>
          }
        >
          <Typography text="푸터가 커스텀된 모달입니다." />
        </Modal>
      </>
    )
  },
}

/* ----------------------------- Async Lazy Content ----------------------------- */
export const AsyncContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button text="비동기 콘텐츠 모달 열기" onClick={() => setOpen(true)} />

        <Modal open={open} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)}>
          <Flex width={"100%"} height={"100%"} align="center" justify="center" p="20px">
            <Suspense fallback={<Progress type="Circular" variant="indeterminate" size="30px" />}>
              <LazyContent />
            </Suspense>
          </Flex>
        </Modal>
      </>
    )
  },
}

/* ----------------------------- Interactive Confirm ----------------------------- */
export const ConfirmAction: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")

    return (
      <Flex direction="column" gap="16px">
        <Button text="확인 모달 열기" onClick={() => setOpen(true)} />
        <Typography text={message} />

        <Modal
          open={open}
          title="확인 필요"
          onClose={() => {
            setMessage("취소됨")
            setOpen(false)
          }}
          onConfirm={() => {
            setMessage("확인됨")
            setOpen(false)
          }}
        >
          <Typography text="확인하시겠습니까?" />
        </Modal>
      </Flex>
    )
  },
}

/* ----------------------------- Long Content Scroll ----------------------------- */
export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    const longText = Array.from({ length: 30 }).map((_, i) => (
      <Typography key={i} text={`내용 줄 ${i + 1}`} />
    ))

    return (
      <>
        <Button text="긴 내용 모달 열기" onClick={() => setOpen(true)} />

        <Modal open={open} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)}>
          {longText}
        </Modal>
      </>
    )
  },
}

/* ----------------------------- Backdrop Disabled ----------------------------- */
export const NoBackdropClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button text="백드롭 닫힘 비활성화 모달 열기" onClick={() => setOpen(true)} />

        <Modal open={open} onClose={() => setOpen(false)} allowBackdrop={false}>
          <Typography text="백드롭 클릭해도 닫히지 않습니다." />
        </Modal>
      </>
    )
  },
}

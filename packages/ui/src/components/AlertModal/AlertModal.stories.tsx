import type { Meta, StoryObj } from "@storybook/react"
import { useCallback, useEffect } from "react"
import AlertModal from "./AlertModal"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"
import { useAlertStore } from "../../stores/useAlertStore"

const meta: Meta<typeof AlertModal> = {
  title: "Components/AlertModal",
  component: AlertModal,
  parameters: { layout: "fullscreen" },
}
export default meta

type Story = StoryObj<typeof AlertModal>

const OpenButtons = () => {
  const showAlert = useAlertStore((s) => s.showAlert)

  const openAlert = useCallback(() => {
    showAlert({
      type: "alert",
      title: "알림",
      message: "AlertModal 메시지 예시입니다.",
      confirmText: "확인",
      onConfirm: () => undefined,
    })
  }, [showAlert])

  const openConfirm = useCallback(() => {
    showAlert({
      type: "confirm",
      title: "삭제 확인",
      message: "정말 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      onConfirm: () => undefined,
      onCancel: () => undefined,
    })
  }, [showAlert])

  const openLongMessage = useCallback(() => {
    showAlert({
      type: "alert",
      title: "긴 메시지",
      message:
        "긴 메시지 줄바꿈/word-break 확인용 텍스트입니다. 아주아주아주아주아주아주 긴 문자열도 정상적으로 개행/줄바꿈되어야 합니다.",
      confirmText: "확인",
    })
  }, [showAlert])

  return (
    <Flex gap="10px" wrap="wrap">
      <Button text="Open Alert" variant="contained" color="primary" onClick={openAlert} />
      <Button text="Open Confirm" variant="outlined" color="secondary" onClick={openConfirm} />
      <Button text="Open Long Message" variant="text" color="normal" onClick={openLongMessage} />
    </Flex>
  )
}

const PlaygroundView = () => {
  const resetAlert = useAlertStore((s) => s.resetAlert)

  useEffect(() => {
    return () => {
      resetAlert()
    }
  }, [resetAlert])

  return (
    <Box p="20px">
      <Typography variant="h3" text="AlertModal (Global Store Driven)" mb="12px" />
      <OpenButtons />
      <AlertModal />
    </Box>
  )
}

export const Playground: Story = {
  render: () => <PlaygroundView />,
}

import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"

import AlertModal from "./AlertModal"
import Button from "../Button/Button"
import Flex from "../Flex/Flex"
import { useAlertStore } from "../../stores/useAlertStore"

/* -------------------------------------------------------------------------- */
/*                                   META                                     */
/* -------------------------------------------------------------------------- */

const meta: Meta = {
  title: "components/AlertModal",
  component: AlertModal,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
        <AlertModal />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj

/* -------------------------------------------------------------------------- */
/*                         내부 스토어 제어 헬퍼 함수                         */
/* -------------------------------------------------------------------------- */

const openAlert = () => {
  const { showAlert } = useAlertStore.getState()
  showAlert({
    type: "alert",
    title: "알림",
    message: "단순한 알림 메시지입니다.",
    confirmText: "확인",
    onConfirm: () => alert("Alert 확인 실행됨"),
  })
}

const openConfirm = () => {
  const { showAlert } = useAlertStore.getState()
  showAlert({
    type: "confirm",
    title: "확인 요청",
    message: "이 작업을 실행하시겠습니까?",
    confirmText: "확인",
    cancelText: "취소",
    onConfirm: () => alert("Confirm 확인 실행됨"),
    onCancel: () => alert("Confirm 취소 실행됨"),
  })
}

const openCustom = () => {
  const { showAlert } = useAlertStore.getState()
  showAlert({
    type: "alert",
    title: "긴 메시지 예제",
    message:
      "여러 줄 메시지를 테스트하기 위한 예제입니다.\n텍스트가 길어도 정상적으로 줄바꿈과 정렬이 유지됩니다.",
    confirmText: "닫기",
  })
}

/* -------------------------------------------------------------------------- */
/*                                   STORIES                                  */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: () => {
    return (
      <Flex direction="column" gap="12px">
        <Button text="Open Alert" onClick={openAlert} />
        <Button text="Open Confirm" onClick={openConfirm} />
      </Flex>
    )
  },
}

export const AlertOnly: Story = {
  render: () => {
    return (
      <Flex>
        <Button text="Show Alert Modal" onClick={openAlert} />
      </Flex>
    )
  },
}

export const ConfirmOnly: Story = {
  render: () => {
    return (
      <Flex>
        <Button text="Show Confirm Modal" onClick={openConfirm} />
      </Flex>
    )
  },
}

export const LongMessage: Story = {
  render: () => {
    return (
      <Flex>
        <Button text="Show Long Message Alert" onClick={openCustom} />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                추가: 커스텀 버튼 스타일 테스트 스토리                     */
/* -------------------------------------------------------------------------- */

export const CustomButtons: Story = {
  render: () => {
    const openStyledConfirm = () => {
      const { showAlert } = useAlertStore.getState()
      showAlert({
        type: "confirm",
        title: "커스텀 버튼",
        message: "버튼 스타일을 변경할 수 있습니다.",
        confirmText: "확인",
        cancelText: "취소",
        confirmButtonProps: {
          color: "primary",
          variant: "contained",
        },
        cancelButtonProps: {
          color: "secondary",
          variant: "outlined",
        },
        onConfirm: () => alert("Styled Confirm 실행됨"),
        onCancel: () => alert("Styled Cancel 실행됨"),
      })
    }

    return <Button text="Show Styled Confirm Modal" onClick={openStyledConfirm} />
  },
}

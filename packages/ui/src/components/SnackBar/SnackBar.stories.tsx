import type { Meta, StoryObj } from "@storybook/react"
import SnackBar, { type SnackBarProps } from "./SnackBar"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import { useSnackBarStore } from "../../stores/useSnackBarStore"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"

/* -------------------------------------------------------------
 * Storybook 기본 설정
 * ------------------------------------------------------------- */
const meta: Meta<SnackBarProps> = {
  title: "components/SnackBar",
  component: SnackBar,
  args: {
    id: "preview",
    message: "스낵바 메시지",
    status: "info",
    placement: "top-end",
    autoHideDuration: 3000,
  },
  argTypes: {
    id: { control: false },
    message: { control: "text" },
    status: {
      control: "radio",
      options: ["success", "error", "warning", "info"],
    },
    placement: {
      control: "select",
      options: [
        "top",
        "bottom",
        "left",
        "right",
        "top-start",
        "top-end",
        "bottom-start",
        "bottom-end",
        "left-start",
        "left-end",
        "right-start",
        "right-end",
      ],
    },
    autoHideDuration: { control: "number" },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <SnackBar.List />
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<SnackBarProps>

/* -------------------------------------------------------------
 * 기본 렌더링
 * ------------------------------------------------------------- */
export const Default: Story = {}

/* -------------------------------------------------------------
 * 상태별 스낵바
 * ------------------------------------------------------------- */
export const StatusVariants: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackBarStore()

    return (
      <Flex direction="column" gap="12px">
        <Button
          text="Success"
          onClick={() => enqueueSnackbar("성공했습니다!", { status: "success" })}
        />

        <Button
          text="Error"
          onClick={() => enqueueSnackbar("오류가 발생했습니다.", { status: "error" })}
        />

        <Button
          text="Warning"
          onClick={() => enqueueSnackbar("주의가 필요합니다.", { status: "warning" })}
        />
        <Button
          text="Info"
          onClick={() => enqueueSnackbar("안내 메시지입니다.", { status: "info" })}
        />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------
 * Placement 테스트
 * ------------------------------------------------------------- */
export const PlacementShowcase: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackBarStore()

    const placements = [
      "top",
      "top-start",
      "top-end",
      "bottom",
      "bottom-start",
      "bottom-end",
      "left",
      "left-start",
      "left-end",
      "right",
      "right-start",
      "right-end",
    ] as const

    return (
      <Flex direction="column" gap="8px">
        {placements.map((p) => (
          <Button
            text={p}
            key={p}
            onClick={() =>
              enqueueSnackbar(`placement: ${p}`, {
                placement: p,
                status: "info",
              })
            }
          />
        ))}
      </Flex>
    )
  },
}

/* -------------------------------------------------------------
 * 자동 사라짐 테스트
 * ------------------------------------------------------------- */
export const AutoHide: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackBarStore()

    return (
      <Button
        text="자동 사라짐 스낵바"
        onClick={() =>
          enqueueSnackbar("3초 뒤 사라집니다.", {
            autoHideDuration: 3000,
            status: "success",
          })
        }
      />
    )
  },
}

/* -------------------------------------------------------------
 * 수동 닫기 테스트
 * ------------------------------------------------------------- */
export const ManualClose: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackBarStore()

    return (
      <Button
        text="수동 닫기 스낵바 띄우기"
        onClick={() =>
          enqueueSnackbar("닫기 버튼이 있는 스낵바", {
            status: "warning",
            autoHideDuration: 999999,
          })
        }
      />
    )
  },
}

import type { Meta, StoryObj } from "@storybook/react"
import { useEffect, useMemo, useState } from "react"
import SnackBar, { SnackBarProps } from "./SnackBar"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Button from "../Button/Button"
import { DirectionalPlacement, StatusUiType } from "../../types"
import { useSnackBarStore } from "../../stores/useSnackBarStore"

type EnqueueOptions = Omit<SnackBarProps, "id" | "message">

const meta: Meta<typeof SnackBar> = {
  title: "Components/SnackBar",
  component: SnackBar,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    id: { control: false },
    message: { control: { type: "text" } },
    status: { control: { type: "radio" }, options: ["success", "error", "warning", "info"] },
    autoHideDuration: { control: { type: "number" } },
    placement: {
      control: { type: "select" },
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
    iconSize: { control: { type: "text" } },
    closeIconSize: { control: { type: "text" } },
  },
  args: {
    id: "storybook-snackbar",
    message: "저장이 완료되었습니다.",
    status: "success",
    autoHideDuration: 2500,
    placement: "bottom-end",
    iconSize: 16,
    closeIconSize: 16,
  },
}

export default meta
type Story = StoryObj<typeof SnackBar>

const placements: DirectionalPlacement[] = [
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
]

const statuses: StatusUiType[] = ["success", "error", "warning", "info"]

const getAllSnackbarIds = () => useSnackBarStore.getState().snackbars.map((s) => s.id)

const DemoController = (args: SnackBarProps) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackBarStore()
  const [message, setMessage] = useState(args.message)
  const [status, setStatus] = useState<StatusUiType>((args.status ?? "success") as StatusUiType)
  const [placement, setPlacement] = useState<DirectionalPlacement>(
    (args.placement ?? "bottom-end") as DirectionalPlacement,
  )
  const [autoHideDuration, setAutoHideDuration] = useState<number>(args.autoHideDuration ?? 2500)

  useEffect(() => {
    setMessage(args.message)
  }, [args.message])

  useEffect(() => {
    setStatus((args.status ?? "success") as StatusUiType)
  }, [args.status])

  useEffect(() => {
    setPlacement((args.placement ?? "bottom-end") as DirectionalPlacement)
  }, [args.placement])

  useEffect(() => {
    setAutoHideDuration(args.autoHideDuration ?? 2500)
  }, [args.autoHideDuration])

  const fire = () => {
    const options: EnqueueOptions = {
      status,
      placement,
      autoHideDuration,
      iconSize: (args as SnackBarProps).iconSize,
      closeIconSize: (args as SnackBarProps).closeIconSize,
    }
    enqueueSnackbar(message, options)
  }

  const fireMany = () => {
    for (let i = 0; i < 5; i++) {
      const options: EnqueueOptions = {
        status,
        placement,
        autoHideDuration: autoHideDuration + i * 300,
        iconSize: (args as SnackBarProps).iconSize,
        closeIconSize: (args as SnackBarProps).closeIconSize,
      }
      enqueueSnackbar(`${message} (${i + 1})`, options)
    }
  }

  const closeAll = () => {
    const ids = getAllSnackbarIds()
    ids.forEach((id) => closeSnackbar(id))
  }

  return (
    <Box sx={{ padding: "24px" }}>
      <SnackBar.List />

      <Flex direction="column" gap="12px" width="520px">
        <Typography text="SnackBar Playground" variant="h3" />
        <Flex gap="8px" wrap="wrap">
          <Button text="Open" onClick={fire} />
          <Button variant="outlined" text="Open x5" onClick={fireMany} />
          <Button variant="text" text="Close All" onClick={closeAll} />
        </Flex>

        <Box sx={{ padding: "12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
          <Flex direction="column" gap="10px">
            <Typography text={`message: ${message}`} variant="b2Regular" />
            <Typography text={`status: ${status}`} variant="b2Regular" />
            <Typography text={`placement: ${placement}`} variant="b2Regular" />
            <Typography text={`autoHideDuration: ${autoHideDuration}`} variant="b2Regular" />
          </Flex>
        </Box>

        <Box sx={{ padding: "12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
          <Typography text="Args로 제어 후 Open 버튼으로 실제 동작 확인" variant="b2Regular" />
        </Box>
      </Flex>
    </Box>
  )
}

export const Playground: Story = {
  render: (args) => <DemoController {...(args as SnackBarProps)} />,
}

export const Variants: Story = {
  render: (args) => {
    const { enqueueSnackbar, closeSnackbar } = useSnackBarStore()

    const closeAll = () => {
      const ids = getAllSnackbarIds()
      ids.forEach((id) => closeSnackbar(id))
    }

    const fire = (placement: DirectionalPlacement, status: StatusUiType) => {
      const options: EnqueueOptions = {
        status,
        placement,
        autoHideDuration: args.autoHideDuration,
        iconSize: (args as SnackBarProps).iconSize,
        closeIconSize: (args as SnackBarProps).closeIconSize,
      }
      enqueueSnackbar(`${status.toUpperCase()} @ ${placement}`, options)
    }

    const fireAll = () => {
      placements.forEach((p) => {
        statuses.forEach((s, i) => {
          const options: EnqueueOptions = {
            status: s,
            placement: p,
            autoHideDuration: (args.autoHideDuration ?? 2500) + i * 200,
            iconSize: (args as SnackBarProps).iconSize,
            closeIconSize: (args as SnackBarProps).closeIconSize,
          }
          enqueueSnackbar(`${s.toUpperCase()} @ ${p}`, options)
        })
      })
    }

    return (
      <Box sx={{ padding: "24px" }}>
        <SnackBar.List />

        <Flex direction="column" gap="14px" width="920px">
          <Flex gap="8px" wrap="wrap">
            <Button text="Open All (placements x statuses)" onClick={fireAll} />
            <Button variant="outlined" text="Close All" onClick={closeAll} />
          </Flex>

          <Box sx={{ padding: "12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
            <Typography
              text="각 버튼 클릭 시 해당 placement/status로 실제 Snackbar가 생성됩니다."
              variant="b2Regular"
            />
          </Box>

          <Flex direction="column" gap="10px">
            {placements.map((p) => (
              <Box
                key={p}
                sx={{
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: "grayscale.white",
                }}
              >
                <Typography text={`Placement: ${p}`} variant="b2Regular" />
                <Flex gap="8px" wrap="wrap" mt={8}>
                  {statuses.map((s) => (
                    <Button key={s} text={s} variant="outlined" onClick={() => fire(p, s)} />
                  ))}
                </Flex>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Box>
    )
  },
}

import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import Drawer from "./Drawer"
import type { DrawerCloseBehavior, DrawerProps, DrawerVariant } from "./Drawer"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"
import Divider from "../Divider/Divider"

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: { layout: "fullscreen" },
  argTypes: {
    children: { control: false },
    container: { control: false },
  },
  args: {
    placement: "left",
    variant: "fixed",
    closeBehavior: "hidden",
    width: 320,
    height: 240,
    collapsedSize: 56,
    overlay: true,
    disableBackdrop: false,
  },
}
export default meta
type Story = StoryObj<typeof Drawer>

const Panel = () => {
  return (
    <Box p="16px" width="100%" height="100%">
      <Typography variant="h3" text="Drawer Content" mb="10px" />
      <Divider my="10px" />
      <Typography
        variant="b2Regular"
        text="- fixed: portal + backdrop 가능\n- absolute: 부모 기준 배치\n- flex: 레이아웃 흐름 포함"
        sx={{ whiteSpace: "pre-line" }}
      />
      <Box mt="12px">
        <Button text="Dummy action" />
      </Box>
    </Box>
  )
}

export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)

    return (
      <Box p="20px">
        <Typography variant="h3" text="Drawer Playground" mb="12px" />
        <Flex gap="10px" mb="12px" wrap="wrap">
          <Button text={open ? "Close" : "Open"} onClick={() => setOpen((v) => !v)} />
        </Flex>

        <Drawer {...(args as DrawerProps)} open={open} onClose={() => setOpen(false)}>
          <Panel />
        </Drawer>

        <Box mt="14px">
          <Typography
            variant="b3Regular"
            text="Tip: absolute/flex는 portal이 아니므로 부모 레이아웃에 따라 보입니다."
            color="#666666"
          />
        </Box>
      </Box>
    )
  },
}

export const VariantsAndCloseBehavior: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [variant, setVariant] = useState<DrawerVariant>("fixed")
    const [closeBehavior, setCloseBehavior] = useState<DrawerCloseBehavior>("hidden")

    const common = useMemo(
      () => ({
        placement: "left" as const,
        width: 320,
        height: 240,
        collapsedSize: 72,
      }),
      [],
    )

    return (
      <Box p="20px">
        <Typography variant="h3" text="Variants + closeBehavior" mb="12px" />

        <Flex gap="10px" mb="12px" wrap="wrap">
          <Button text={open ? "Close" : "Open"} onClick={() => setOpen((v) => !v)} />
          {(["fixed", "absolute", "flex"] as const).map((v) => (
            <Button
              key={v}
              text={`variant=${v}`}
              variant={variant === v ? "contained" : "outlined"}
              color={variant === v ? "primary" : "normal"}
              onClick={() => setVariant(v)}
            />
          ))}
          {(["hidden", "collapsed"] as const).map((c) => (
            <Button
              key={c}
              text={`close=${c}`}
              variant={closeBehavior === c ? "contained" : "outlined"}
              color={closeBehavior === c ? "secondary" : "normal"}
              onClick={() => setCloseBehavior(c)}
            />
          ))}
        </Flex>

        <Box
          sx={{
            position: "relative",
            height: "320px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Box p="12px">
            <Typography variant="b2Regular" text="Parent container (absolute/flex 기준 영역)" />
          </Box>

          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            variant={variant}
            closeBehavior={closeBehavior}
            overlay
            disableBackdrop={false}
            {...common}
            // absolute는 이 박스 기준으로 배치되도록 부모에 position:relative가 있어야 함
          >
            <Panel />
          </Drawer>

          {variant === "flex" && (
            <Box p="12px">
              <Typography
                variant="b3Regular"
                text="flex variant는 레이아웃 흐름에 포함되므로, 실제 앱에서는 부모 레이아웃과 함께 구성하세요."
                color="#666666"
              />
            </Box>
          )}
        </Box>
      </Box>
    )
  },
}

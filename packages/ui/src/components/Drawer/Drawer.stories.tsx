import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Drawer, { DrawerProps } from "./Drawer"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"

const meta: Meta<DrawerProps> = {
  title: "components/Drawer",
  component: Drawer,
  args: {
    open: false,
    placement: "left",
    variant: "fixed",
    closeBehavior: "hidden",
    width: 280,
    height: 280,
    collapsedSize: 56,
    disableBackdrop: false,
  },
  argTypes: {
    open: { control: false },
    placement: {
      control: "radio",
      options: ["left", "right", "top", "bottom"],
    },
    variant: {
      control: "radio",
      options: ["fixed", "absolute", "flex"],
    },
    closeBehavior: {
      control: "radio",
      options: ["hidden", "collapsed"],
    },
    width: { control: "text" },
    height: { control: "text" },
    collapsedSize: { control: "text" },
    disableBackdrop: { control: "boolean" },
    onClose: { control: false },

    // BaseMixin (일부)
    m: { control: "text" },
    mt: { control: "text" },
    mr: { control: "text" },
    mb: { control: "text" },
    ml: { control: "text" },
    mx: { control: "text" },
    my: { control: "text" },
    p: { control: "text" },
    pt: { control: "text" },
    pr: { control: "text" },
    pb: { control: "text" },
    pl: { control: "text" },
    px: { control: "text" },
    py: { control: "text" },
    sx: { control: false },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Flex align="center" sx={{ height: "100vh", position: "relative", overflow: "hidden" }}>
          <Story />
        </Flex>
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<DrawerProps>

// * 기본 동작
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button text="Open Drawer" onClick={() => setOpen(true)} />
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <Box p="16px">Drawer Content</Box>
        </Drawer>
      </>
    )
  },
}

// * Fixed 레이아웃 사용 예
export const FixedAndAbsolute: Story = {
  render: () => {
    const [fixedOpen, setFixedOpen] = useState(false)

    return (
      <Flex direction="column" gap="32px" align="center">
        <Button
          text={fixedOpen ? "Close Fixed Drawer" : "Open Fixed Drawer"}
          onClick={() => setFixedOpen((v) => !v)}
        />

        <Drawer open={fixedOpen} variant="fixed" onClose={() => setFixedOpen(false)}>
          <Box p="16px">Fixed Drawer Content</Box>
        </Drawer>
      </Flex>
    )
  },
}

// * Absolute 레이아웃 사용 예
export const Absolute: Story = {
  render: () => {
    const [absoluteOpen, setAbsoluteOpen] = useState(false)

    return (
      <Flex direction="column" gap="32px">
        {/* Absolute */}
        <Box
          height="240px"
          p={"20px"}
          sx={{ position: "relative", backgroundColor: theme.colors.primary[100] }}
        >
          <Typography variant="h1" mb="8px" text="container 기준" />
          <Button
            text={absoluteOpen ? "Close Absolute Drawer" : "Open Absolute Drawer"}
            onClick={() => setAbsoluteOpen((v) => !v)}
          />

          <Drawer open={absoluteOpen} variant="absolute" onClose={() => setAbsoluteOpen(false)}>
            <Box p="16px">Absolute Drawer Content</Box>
          </Drawer>
        </Box>
      </Flex>
    )
  },
}

// * flex 레이아웃 사용 예
export const FlexLayout: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <Flex style={{ height: "100%" }}>
        <Drawer variant="flex" open={open} width={240} closeBehavior="collapsed">
          <Box p="16px">Flex Drawer</Box>
        </Drawer>

        <Flex direction="column" p="16px" gap="12px" style={{ flex: 1 }}>
          <Button
            text={open ? "Flex Drawer Close" : "Flex Drawer Open"}
            onClick={() => setOpen(!open)}
          />
          <Typography
            width="100%"
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus. Convallis convallis tellus id interdum velit laoreet id donec ultrices. Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat vivamus at augue. At augue eget arcu dictum varius duis at consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa sapien faucibus et molestie ac.

Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla posuere sollicitudin aliquam ultrices sagittis orci a."
          />
        </Flex>
      </Flex>
    )
  },
}

// * closeBehavior 비교
export const CloseBehavior: Story = {
  render: () => {
    const [hidden, setHidden] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    return (
      <Flex gap="12px">
        <Button text="Hidden" onClick={() => setHidden(true)} />
        <Button text="Collapsed" onClick={() => setCollapsed(true)} />

        <Drawer open={hidden} closeBehavior="hidden" onClose={() => setHidden(false)}>
          <Box p="16px">Hidden Close</Box>
        </Drawer>

        <Drawer
          open={collapsed}
          placement="right"
          closeBehavior="collapsed"
          onClose={() => setCollapsed(false)}
        >
          <Box p="16px">Collapsed Close</Box>
        </Drawer>
      </Flex>
    )
  },
}

import type { Meta, StoryObj } from "@storybook/react"
import FloatingButton, { type FloatingButtonProps } from "./FloatingButton"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { IconNames } from "../Icon/icon-loader"

/* -------------------------------------------------------------
 * META
 * ------------------------------------------------------------- */
const meta: Meta<FloatingButtonProps> = {
  title: "components/FloatingButton",
  component: FloatingButton,

  args: {
    icon: IconNames[0],
    label: "Label",
    size: "M",
    color: "primary",
    disabled: false,
    placement: "top",
  },

  argTypes: {
    icon: { control: "text" },
    label: { control: "text" },
    size: { control: "radio", options: ["S", "M", "L"] },
    color: { control: "radio", options: ["primary", "secondary", "normal"] },
    placement: { control: "radio", options: ["top", "bottom", "left", "right"] },
    disabled: { control: "boolean" },

    /* BaseMixin Props */
    p: { control: "text" },
    m: { control: "text" },
    mx: { control: "text" },
    my: { control: "text" },
    mt: { control: "text" },
    mb: { control: "text" },
    ml: { control: "text" },
    mr: { control: "text" },
    width: { control: "text" },

    item: { control: false },
    iconProps: { control: false },
    TypographyProps: { control: false },
    sx: { control: false },
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

type Story = StoryObj<FloatingButtonProps>

/* -------------------------------------------------------------
 * DEFAULT
 * ------------------------------------------------------------- */
export const Default: Story = {
  render: (args) => {
    return (
      <FloatingButton
        {...args}
        onClick={() => {
          console.log("Main FAB clicked")
        }}
      />
    )
  },
}

/* -------------------------------------------------------------
 * WithMenu — SpeedDial + item[].onClick 동작
 * ------------------------------------------------------------- */
export const WithMenu: Story = {
  render: () => {
    return (
      <FloatingButton
        icon={IconNames[0]}
        label="Label"
        color="secondary"
        item={[
          {
            icon: IconNames[1],
            label: "Item 01",
            onClick: () => {
              console.log("추가 버튼 클릭됨")
            },
          },
          {
            icon: IconNames[2],
            label: "Item 02",
            onClick: () => {
              console.log("수정 버튼 클릭됨")
            },
          },
          {
            icon: IconNames[3],
            label: "Item 03",
            onClick: () => {
              console.log("삭제 버튼 클릭됨")
            },
          },
        ]}
      />
    )
  },
}

/* -------------------------------------------------------------
 * Sizes (S, M, L)
 * ------------------------------------------------------------- */
export const Sizes: Story = {
  render: () => {
    return (
      <Flex gap="40px">
        <Flex direction="column" gap="24px">
          <FloatingButton icon={IconNames[0]} size="S" label="Size S" />
          <FloatingButton icon={IconNames[0]} size="M" label="Size M" />
          <FloatingButton icon={IconNames[0]} size="L" label="Size L" />
        </Flex>

        <Flex direction="column" gap="24px">
          <FloatingButton icon={IconNames[0]} size="S" />
          <FloatingButton icon={IconNames[0]} size="M" />
          <FloatingButton icon={IconNames[0]} size="L" />
        </Flex>
      </Flex>
    )
  },
}

/* -------------------------------------------------------------
 * Variants (circular vs extended)
 * ------------------------------------------------------------- */
export const Variants: Story = {
  render: () => {
    return (
      <Flex gap="24px">
        <FloatingButton icon={IconNames[1]} />
        <FloatingButton icon={IconNames[1]} label="Label" />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------
 * Placement Showcase
 * ------------------------------------------------------------- */
export const Placement: Story = {
  render: () => {
    const items = [
      { icon: IconNames[1], label: "Item 1", onClick: () => console.log("Item 1") },
      { icon: IconNames[2], label: "Item 2", onClick: () => console.log("Item 2") },
      { icon: IconNames[3], label: "Item 3", onClick: () => console.log("Item 3") },
    ]

    return (
      <Flex gap="50px">
        <FloatingButton icon={IconNames[3]} label="Top" placement="top" item={items} />
        <FloatingButton icon={IconNames[0]} label="Bottom" placement="bottom" item={items} />
        <FloatingButton icon={IconNames[1]} label="Left" placement="left" item={items} />
        <FloatingButton icon={IconNames[2]} label="Right" placement="right" item={items} />
      </Flex>
    )
  },
}

/* -------------------------------------------------------------
 * Disabled
 * ------------------------------------------------------------- */
export const Disabled: Story = {
  render: (args) => {
    return (
      <FloatingButton
        {...args}
        disabled
        onClick={() => {
          console.log("Disabled FAB click")
        }}
      />
    )
  },
}

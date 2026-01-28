import type { Meta, StoryObj } from "@storybook/react"
import { useMemo, useState } from "react"
import IconButton from "./IconButton"
import type { IconButtonProps } from "./IconButton"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"
import { IconNames } from "../Icon/icon-loader"

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: { layout: "fullscreen" },
  argTypes: {
    iconProps: { control: false },
    toolTipProps: { control: false },
    onClick: { control: false },
    onMouseDown: { control: false },
    onMouseUp: { control: false },
    onMouseLeave: { control: false },
  },
  args: {
    icon: "CloseLine" as any,
    variant: "contained",
    size: 16,
    disabled: false,
    disableInteraction: false,
    toolTip: "",
    ariaLabel: "icon button",
  },
}
export default meta
type Story = StoryObj<typeof IconButton>

export const Playground: Story = {
  render: (args) => {
    const [log, setLog] = useState<string>("")

    return (
      <Box p="20px">
        <Typography variant="h3" text="IconButton Playground" mb="12px" />

        <Flex gap="10px" align="center" mb="12px" wrap="wrap">
          <IconButton
            {...(args as IconButtonProps)}
            onClick={() => setLog(`clicked: ${String(args.icon)} / ${String(args.variant)}`)}
          />

          <Button text="Clear log" variant="outlined" color="normal" onClick={() => setLog("")} />
        </Flex>

        <Typography variant="b3Regular" text={log || "no logs"} color="#666666" />
      </Box>
    )
  },
}

export const Variants: Story = {
  render: () => {
    const variants: IconButtonProps["variant"][] = ["contained", "outlined", "text"]
    const icons = ["CloseLine", "File", "CheckLine"] as any[]

    return (
      <Box p="20px">
        <Typography variant="h3" text="Variants" mb="12px" />

        <Flex direction="column" gap="12px">
          {variants.map((v) => (
            <Flex key={v} gap="12px" align="center">
              <Typography variant="b2Regular" text={v ?? ""} width="90px" />
              <Flex gap="10px" align="center">
                {icons.map((ic) => (
                  <IconButton key={`${v}-${ic}`} icon={ic} variant={v} toolTip={`${v} / ${ic}`} />
                ))}
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Box>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const sizes = useMemo(() => [12, 16, 20, 24, 28, 32], [])
    const variants: IconButtonProps["variant"][] = ["contained", "outlined", "text"]

    return (
      <Box p="20px">
        <Typography variant="h3" text="Sizes" mb="12px" />

        <Flex direction="column" gap="14px">
          {variants.map((v) => (
            <Flex key={v} align="center" gap="12px" wrap="wrap">
              <Typography variant="b2Regular" text={v ?? ""} width="90px" />
              {sizes.map((s) => (
                <IconButton
                  key={`${v}-${s}`}
                  icon={IconNames[0]}
                  variant={v}
                  size={s}
                  toolTip={`size: ${s}`}
                />
              ))}
            </Flex>
          ))}
        </Flex>
      </Box>
    )
  },
}

export const TooltipAndAria: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(true)

    return (
      <Box p="20px">
        <Typography variant="h3" text="Tooltip / aria-label" mb="12px" />

        <Flex gap="10px" align="center" mb="12px" wrap="wrap">
          <Button
            text={enabled ? "Disable tooltip" : "Enable tooltip"}
            variant="outlined"
            color="normal"
            onClick={() => setEnabled((p) => !p)}
          />
        </Flex>

        <Flex gap="12px" align="center" wrap="wrap">
          <IconButton
            icon={IconNames[0]}
            variant="outlined"
            toolTip={enabled ? "Info tooltip" : ""}
            ariaLabel="info button"
          />
          <IconButton
            icon={IconNames[1]}
            variant="text"
            toolTip={enabled ? "Close tooltip" : ""}
            ariaLabel="close button"
          />
          <IconButton
            icon={IconNames[2]}
            variant="contained"
            toolTip={enabled ? "Delete tooltip" : ""}
            ariaLabel="delete button"
          />
        </Flex>
      </Box>
    )
  },
}

export const DisabledAndInteraction: Story = {
  render: () => {
    const [disableInteraction, setDisableInteraction] = useState(false)

    return (
      <Box p="20px">
        <Typography variant="h3" text="disabled / disableInteraction" mb="12px" />

        <Flex gap="10px" align="center" mb="12px" wrap="wrap">
          <Button
            text={disableInteraction ? "enableInteraction" : "disableInteraction"}
            variant="outlined"
            color="normal"
            onClick={() => setDisableInteraction((p) => !p)}
          />
        </Flex>

        <Flex direction="column" gap="12px">
          <Flex gap="12px" align="center" wrap="wrap">
            <Typography variant="b2Regular" text="Enabled" width="90px" />
            <IconButton
              icon={IconNames[0]}
              variant="outlined"
              disableInteraction={disableInteraction}
              toolTip={`disableInteraction=${disableInteraction}`}
              onClick={() => {}}
            />
            <IconButton
              icon={IconNames[1]}
              variant="text"
              disableInteraction={disableInteraction}
              toolTip={`disableInteraction=${disableInteraction}`}
            />
            <IconButton
              icon={IconNames[2]}
              variant="contained"
              disableInteraction={disableInteraction}
              toolTip={`disableInteraction=${disableInteraction}`}
            />
          </Flex>

          <Flex gap="12px" align="center" wrap="wrap">
            <Typography variant="b2Regular" text="Disabled" width="90px" />
            <IconButton
              icon={IconNames[0]}
              variant="outlined"
              disabled
              disableInteraction={disableInteraction}
              toolTip="disabled"
            />
            <IconButton
              icon={IconNames[1]}
              variant="text"
              disabled
              disableInteraction={disableInteraction}
              toolTip="disabled"
            />
            <IconButton
              icon={IconNames[2]}
              variant="contained"
              disabled
              disableInteraction={disableInteraction}
              toolTip="disabled"
            />
          </Flex>
        </Flex>
      </Box>
    )
  },
}

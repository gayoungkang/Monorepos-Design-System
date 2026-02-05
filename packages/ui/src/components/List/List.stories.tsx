import type { Meta, StoryObj } from "@storybook/react"
import React, { useMemo, useState } from "react"
import List, { ListItemProps, ListProps } from "./List"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import IconButton from "../IconButton/IconButton"
import { Typography } from "../Typography/Typography"

const ICON_MAIN = "File"
const ICON_PROFILE = "BookmarkLine"
const ICON_MORE = "MoreLine" as any
const ICON_NOTIFY = "AlertTriangle"
const ICON_RESET = "reset"
const ICON_LOCK = "LockLine" as any

const meta: Meta<typeof List> = {
  title: "Components/List",
  component: List,
  parameters: { layout: "fullscreen" },
  argTypes: {
    items: { control: false },
  },
  args: {
    dense: false,
    disablePadding: false,
    title: "Settings",
    separator: true,
  },
}
export default meta
type Story = StoryObj<typeof List>

const buildItems = (params: {
  selectedIndex: number | null
  setSelectedIndex: (i: number | null) => void
  simpleChecked: boolean
  setSimpleChecked: (v: boolean) => void
  groupValues: string[]
  setGroupValues: (v: string[]) => void
  switchChecked: boolean
  setSwitchChecked: (v: boolean) => void
}): ListItemProps[] => {
  const {
    selectedIndex,
    setSelectedIndex,
    simpleChecked,
    setSimpleChecked,
    groupValues,
    setGroupValues,
    switchChecked,
    setSwitchChecked,
  } = params

  return [
    {
      label: "Profile",
      selected: selectedIndex === 0,
      onClick: () => setSelectedIndex(selectedIndex === 0 ? null : 0),
      startItem: [
        { type: "Avatar", props: { name: "Jane Doe", size: "M" } },
        { type: "Icon", props: { name: ICON_PROFILE as any } },
      ],
      endItem: [
        {
          type: "IconButton",
          props: {
            icon: ICON_MORE as any,
            variant: "outlined",
            toolTip: "More actions",
          },
        },
      ],
    },
    {
      label: "Notifications",
      selected: selectedIndex === 1,
      onClick: () => setSelectedIndex(selectedIndex === 1 ? null : 1),
      startItem: [{ type: "Icon", props: { name: ICON_NOTIFY as any } }],
      endItem: [
        {
          type: "Switch",
          props: {
            checked: switchChecked,
            label: "On",
            onChange: () => setSwitchChecked(!switchChecked),
          },
        },
      ],
    },
    {
      label: "Single Check (wrapped by CheckBoxGroup)",
      selected: selectedIndex === 2,
      onClick: () => setSelectedIndex(selectedIndex === 2 ? null : 2),
      startItem: [
        {
          type: "CheckBox",
          props: {
            checked: simpleChecked,
            label: "Enable",
            onChange: setSimpleChecked,
          },
        },
      ],
      endItem: [
        {
          type: "IconButton",
          props: {
            icon: ICON_MAIN as any,
            variant: "text",
            toolTip: "Single checkbox example",
          },
        },
      ],
    },
    {
      label: "Group CheckBox",
      selected: selectedIndex === 3,
      onClick: () => setSelectedIndex(selectedIndex === 3 ? null : 3),
      startItem: [
        {
          type: "CheckBox",
          props: {
            value: groupValues,
            onChange: (v: any) => setGroupValues(v),
            data: [
              { text: "A", value: "A" },
              { text: "B", value: "B" },
              { text: "C", value: "C" },
            ],
            direction: "horizontal",
            allCheck: true,
            allCheckText: "All",
            size: "M",
          } as any,
        },
      ],
    },
    {
      label: "Disabled item",
      disabled: true,
      selected: false,
      startItem: [{ type: "Icon", props: { name: ICON_LOCK as any } }],
      endItem: [
        {
          type: "IconButton",
          props: {
            icon: ICON_MAIN as any,
            disabled: true,
            toolTip: "disabled",
          },
        },
      ],
    },
  ]
}

export const Playground: Story = {
  render: (args) => {
    const [dense, setDense] = useState<boolean>(!!args.dense)
    const [disablePadding, setDisablePadding] = useState<boolean>(!!args.disablePadding)
    const [separator, setSeparator] = useState<boolean>(args.separator ?? true)

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0)

    const [simpleChecked, setSimpleChecked] = useState<boolean>(true)
    const [groupValues, setGroupValues] = useState<string[]>(["A"])
    const [switchChecked, setSwitchChecked] = useState<boolean>(true)

    const items = useMemo(
      () =>
        buildItems({
          selectedIndex,
          setSelectedIndex,
          simpleChecked,
          setSimpleChecked,
          groupValues,
          setGroupValues,
          switchChecked,
          setSwitchChecked,
        }),
      [groupValues, selectedIndex, simpleChecked, switchChecked],
    )

    return (
      <Box p="20px">
        <Typography variant="h3" text="List Playground" mb="12px" />

        <Flex gap="8px" align="center" mb="12px" wrap="wrap">
          <Button
            text={`dense: ${dense ? "true" : "false"}`}
            variant="outlined"
            color="normal"
            onClick={() => setDense((p) => !p)}
          />
          <Button
            text={`disablePadding: ${disablePadding ? "true" : "false"}`}
            variant="outlined"
            color="normal"
            onClick={() => setDisablePadding((p) => !p)}
          />
          <Button
            text={`separator: ${separator ? "true" : "false"}`}
            variant="outlined"
            color="normal"
            onClick={() => setSeparator((p) => !p)}
          />
          <IconButton
            icon={ICON_RESET as any}
            toolTip="Reset selection"
            variant="outlined"
            onClick={() => setSelectedIndex(0)}
          />
        </Flex>

        <Box sx={{ width: "520px", border: "1px solid #eee" }}>
          <List
            {...(args as ListProps)}
            dense={dense}
            disablePadding={disablePadding}
            separator={separator}
            items={items}
          />
        </Box>

        <Box mt="12px">
          <Typography
            variant="b3Regular"
            color="#666666"
            text={`selectedIndex=${selectedIndex ?? "null"}, single=${simpleChecked ? "on" : "off"}, group=[${groupValues.join(
              ",",
            )}], switch=${switchChecked ? "on" : "off"}`}
          />
        </Box>
      </Box>
    )
  },
}

export const DensityMatrix: Story = {
  render: () => {
    const variants = [
      { dense: false, disablePadding: false },
      { dense: true, disablePadding: false },
      { dense: false, disablePadding: true },
      { dense: true, disablePadding: true },
    ] as const

    return (
      <Box p="20px">
        <Typography variant="h3" text="dense × disablePadding" mb="12px" />

        <Flex gap="16px" wrap="wrap">
          {variants.map((v, idx) => {
            const items: ListItemProps[] = [
              {
                label: "Clickable",
                selected: idx % 2 === 0,
                onClick: () => {},
                startItem: [{ type: "Icon", props: { name: ICON_MAIN as any } }],
                endItem: [
                  {
                    type: "IconButton",
                    props: { icon: ICON_MAIN as any, toolTip: "tooltip", variant: "outlined" },
                  },
                ],
              },
              {
                label: "Disabled",
                disabled: true,
                startItem: [{ type: "Icon", props: { name: ICON_MAIN as any } }],
              },
            ]

            return (
              <Box key={idx} sx={{ width: "380px", border: "1px solid #eee" }}>
                <Box p="10px">
                  <Typography
                    variant="b2Regular"
                    text={`dense=${v.dense}, disablePadding=${v.disablePadding}`}
                    color="#666666"
                    mb="8px"
                  />
                </Box>
                <List
                  title="Example"
                  dense={v.dense}
                  disablePadding={v.disablePadding}
                  items={items}
                />
              </Box>
            )
          })}
        </Flex>
      </Box>
    )
  },
}

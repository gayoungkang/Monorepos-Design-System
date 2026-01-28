import type { Meta, StoryObj } from "@storybook/react"
import React, { useState } from "react"

import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import Button from "../Button/Button"
import { Typography } from "../Typography/Typography"
import CheckBoxGroup, { CheckBox } from "./CheckBoxGroup"

const meta: Meta<typeof CheckBoxGroup> = {
  title: "Components/CheckBox",
  component: CheckBoxGroup,
  parameters: { layout: "fullscreen" },
}
export default meta
type Story = StoryObj<typeof CheckBoxGroup>

export const Single: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    const [indeterminate, setIndeterminate] = useState(true)

    return (
      <Box p="20px">
        <Typography variant="h3" text="Single" mb="12px" />
        <Flex gap="10px" mb="12px">
          <Button
            text="Toggle checked"
            variant="outlined"
            color="normal"
            onClick={() => setChecked((v) => !v)}
          />
          <Button
            text="Toggle indeterminate"
            variant="text"
            color="secondary"
            onClick={() => setIndeterminate((v) => !v)}
          />
        </Flex>

        <CheckBox
          checked={checked}
          onChange={setChecked}
          indeterminate={indeterminate}
          label="단일 체크"
          labelPlacement="right"
          size="M"
        />

        <Box mt="10px">
          <Typography
            variant="b3Regular"
            text={`checked=${checked}, indeterminate=${indeterminate}`}
            color="#666666"
          />
        </Box>
      </Box>
    )
  },
}

export const GroupAllCheck: Story = {
  render: () => {
    const data = [
      { text: "A", value: "A" },
      { text: "B", value: "B" },
      { text: "C", value: "C" },
    ] as const

    const [value, setValue] = useState<string[]>(["A"])

    return (
      <Box p="20px">
        <Typography variant="h3" text="Group + allCheck" mb="12px" />

        <CheckBoxGroup
          value={value}
          onChange={setValue}
          data={data as any}
          allCheck
          allCheckText="전체"
          direction="horizontal"
          label="선택"
          labelPlacement="top"
        />

        <Box mt="10px">
          <Typography variant="b3Regular" text={`value=[${value.join(", ")}]`} color="#666666" />
        </Box>
      </Box>
    )
  },
}

export const SizesAndDirection: Story = {
  render: () => {
    const data = [
      { text: "Option 1", value: 1 },
      { text: "Option 2", value: 2 },
      { text: "Option 3", value: 3 },
    ]

    const [value, setValue] = useState<number[]>([1])

    return (
      <Box p="20px">
        <Typography variant="h3" text="Sizes + direction" mb="12px" />

        <Flex gap="20px" wrap="wrap">
          {(["S", "M", "L"] as const).map((s) => (
            <Box key={s}>
              <Typography variant="b3Regular" text={`size=${s}`} mb="8px" color="#666666" />
              <CheckBoxGroup
                value={value}
                onChange={setValue}
                data={data}
                direction="vertical"
                size={s}
                labelPlacement="top"
              />
            </Box>
          ))}
        </Flex>
      </Box>
    )
  },
}

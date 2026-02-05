import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import TextField, { TextFieldProps } from "./TextField"
import Flex from "../Flex/Flex"
import Box from "../Box/Box"
import { Typography } from "../Typography/Typography"
import Button from "../Button/Button"

const meta: Meta<typeof TextField> = {
  title: "Components/TextField",
  component: TextField,
  parameters: { layout: "centered" },
  argTypes: {
    variant: { control: { type: "radio" }, options: ["outlined", "filled", "standard"] },
    size: { control: { type: "radio" }, options: ["S", "M", "L"] },
    type: { control: { type: "text" } },
    name: { control: { type: "text" } },
    label: { control: { type: "text" } },
    placeholder: { control: { type: "text" } },
    value: { control: false },
    onlyNumber: { control: { type: "boolean" } },
    maxLength: { control: { type: "number" } },
    onClear: { control: false },
    onChange: { control: false },
    onBlur: { control: false },
    onFocus: { control: false },
    onSearch: { control: false },
    onKeyDown: { control: false },
    onKeyUp: { control: false },
    onClick: { control: false },
    onMouseDown: { control: false },
    onMouseUp: { control: false },
    disabled: { control: { type: "boolean" } },
    error: { control: { type: "boolean" } },
    helperText: { control: { type: "text" } },
    startIcon: { control: "text" },
    endIcon: { control: "text" },
    required: { control: { type: "boolean" } },
    readOnly: { control: { type: "boolean" } },
    labelPlacement: { control: { type: "radio" }, options: ["top", "bottom", "left", "right"] },
    labelProps: { control: false },
    iconProps: { control: false },
    multiline: { control: { type: "boolean" } },
    rows: { control: { type: "number" } },
    clearable: { control: { type: "boolean" } },
    autoFocus: { control: { type: "boolean" } },
    onSearchEnter: { control: false },
  },
  args: {
    variant: "outlined",
    size: "M",
    type: "text",
    name: "field",
    label: "Label",
    placeholder: "Type here",
    onlyNumber: false,
    maxLength: undefined,
    disabled: false,
    error: false,
    helperText: "Helper text",
    startIcon: undefined,
    endIcon: undefined,
    required: false,
    readOnly: false,
    labelPlacement: "top",
    multiline: false,
    rows: 4,
    clearable: true,
    autoFocus: false,
  },
}

export default meta
type Story = StoryObj<typeof TextField>

const Controlled = (args: TextFieldProps) => {
  const [val, setVal] = useState<string>("")
  const [err, setErr] = useState<boolean>(!!args.error)

  return (
    <Flex direction="column" gap="12px" width="640px">
      <Flex justify="space-between" align="center">
        <Typography text="Playground" variant="h3" />
        <Flex gap="8px">
          <Button
            variant="outlined"
            text={err ? "Error: ON" : "Error: OFF"}
            onClick={() => setErr((p) => !p)}
          />
          <Button text="Set sample" onClick={() => setVal("sample value")} />
          <Button variant="outlined" text="Clear" onClick={() => setVal("")} />
        </Flex>
      </Flex>

      <TextField
        {...args}
        value={val}
        error={err}
        helperText={err ? "Error helper text" : args.helperText}
        onChange={(e) => setVal(e.target.value)}
        onClear={() => setVal("")}
        onSearch={(v, isEnter) => {
          // * demo: 검색 시 값에 태그 추가
          setVal((p) => (p ? `${p} | search:${v}(${isEnter ? "enter" : "click"})` : `search:${v}`))
        }}
        onSearchEnter={(v) => {
          // * demo: 엔터 검색 시 추가 태그
          setVal((p) => (p ? `${p} | enter:${v}` : `enter:${v}`))
        }}
      />

      <Box sx={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "grayscale.50" }}>
        <Typography text={`value: ${val}`} variant="b2Regular" />
      </Box>
    </Flex>
  )
}

export const Playground: Story = {
  render: (args) => <Controlled {...(args as TextFieldProps)} />,
}

export const Variants: Story = {
  render: (args) => {
    const common = args as TextFieldProps

    const [vText, setVText] = useState("hello")
    const [vSearch, setVSearch] = useState("query")
    const [vPass, setVPass] = useState("password")
    const [vNum, setVNum] = useState("1234")
    const [vMulti, setVMulti] = useState("line1\nline2\nline3")

    return (
      <Flex direction="column" gap="18px" width="980px">
        <Typography text="Basic" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            label="Outlined"
            variant="outlined"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            label="Filled"
            variant="filled"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            label="Standard"
            variant="standard"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
        </Flex>

        <Typography text="Sizes" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            size="S"
            label="Size S"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            size="M"
            label="Size M"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            size="L"
            label="Size L"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
        </Flex>

        <Typography text="States" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            label="Disabled"
            disabled
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            label="ReadOnly"
            readOnly
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            label="Error"
            error
            helperText="error helper text"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
        </Flex>

        <Typography text="Icons" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            label="Start/End"
            startIcon={"ClipboardLine" as any}
            endIcon={"CheckLine" as any}
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
        </Flex>

        <Typography text="Search" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            type="search"
            label="Search (Enter / Click)"
            placeholder="type and Enter"
            value={vSearch}
            onChange={(e) => setVSearch(e.target.value)}
            onSearch={(v) => setVSearch(v)}
          />
        </Flex>

        <Typography text="Password" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            type="password"
            label="Password"
            value={vPass}
            onChange={(e) => setVPass(e.target.value)}
          />
        </Flex>

        <Typography text="Only number / MaxLength" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            label="onlyNumber"
            onlyNumber
            value={vNum}
            onChange={(e) => setVNum(e.target.value)}
          />
          <TextField
            {...common}
            label="maxLength=6"
            maxLength={6}
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
        </Flex>

        <Typography text="Multiline" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            label="Multiline"
            multiline
            rows={4}
            value={vMulti}
            onChange={(e) => setVMulti(e.target.value)}
          />
        </Flex>

        <Typography text="Label placement" variant="h3" />
        <Flex gap="12px" wrap="wrap">
          <TextField
            {...common}
            label="Top"
            labelPlacement="top"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            label="Bottom"
            labelPlacement="bottom"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            label="Left"
            labelPlacement="left"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
          <TextField
            {...common}
            label="Right"
            labelPlacement="right"
            value={vText}
            onChange={(e) => setVText(e.target.value)}
          />
        </Flex>
      </Flex>
    )
  },
}

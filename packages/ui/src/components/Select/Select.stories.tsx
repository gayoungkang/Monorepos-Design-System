// Select.stories.tsx
import type { Meta, StoryObj } from "@storybook/react"
import React, { useEffect, useMemo, useState } from "react"
import Select, { SelectOptionType, SelectValue, SelectProps } from "./Select"
import Box from "../Box/Box"
import Flex from "../Flex/Flex"
import { Typography } from "../Typography/Typography"
import { theme } from "../../tokens/theme"

type SingleValue = string
type MultiValue = string[]

const baseOptions: SelectOptionType[] = [
  { value: "", label: "선택 안 함" },
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Orange" },
  { value: "grape", label: "Grape" },
]

const multiOptions: SelectOptionType[] = [
  { value: "ALL", label: "전체", isAllOption: true },
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
  { value: "delta", label: "Delta" },
]

const actionButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: `1px solid ${theme.colors.border.default}`,
  background: theme.colors.grayscale.white,
  cursor: "pointer",
  fontSize: 12,
}

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: { layout: "centered" },
  args: {
    variant: "outlined",
    multipleType: "default",
    label: "Select",
    options: baseOptions,
    placeholder: "선택",
    size: "M",
    disabled: false,
    readOnly: false,
    required: false,
    error: false,
    helperText: "에러 메시지",
    autoFocus: false,
    isLoading: false,
    labelPlacement: "top",
    color: undefined,
    popperProps: undefined,
    labelProps: undefined,
    typographyProps: undefined,
    value: undefined,
    defaultValue: undefined,
    onChange: undefined,
    onBlur: undefined,
    onFocus: undefined,
  } satisfies Partial<SelectProps>,
  argTypes: {
    variant: { control: { type: "radio" }, options: ["outlined", "filled", "standard"] },
    multipleType: { control: { type: "radio" }, options: ["default", "chip", "multiple"] },
    label: { control: "text" },
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
    onBlur: { control: false },
    onFocus: { control: false },
    error: { control: "boolean" },
    helperText: { control: "text" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    size: { control: { type: "radio" }, options: ["S", "M", "L"] },
    color: { control: "text" },
    required: { control: "boolean" },
    readOnly: { control: "boolean" },
    autoFocus: { control: "boolean" },
    isLoading: { control: "boolean" },
    labelProps: { control: false },
    typographyProps: { control: false },
    labelPlacement: {
      control: { type: "select" },
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "right",
      ],
    },
    popperProps: { control: false },
  },
}

export default meta

type Story = StoryObj<typeof Select>

export const Playground: Story = {
  render: (args) => {
    const isMulti = args.multipleType === "chip" || args.multipleType === "multiple"

    const [single, setSingle] = useState<SelectValue<SingleValue>>("")
    const [multi, setMulti] = useState<SelectValue<MultiValue>>(["alpha", "gamma"])

    useEffect(() => {
      if (!isMulti) return
      if (!Array.isArray(multi)) setMulti([])
    }, [isMulti, multi])

    const options = useMemo(() => (isMulti ? multiOptions : baseOptions), [isMulti])

    const currentValue: SelectValue<SingleValue | MultiValue> = isMulti ? multi : single

    const setPresetSingle = (v: SingleValue) => setSingle(v)
    const clearSingle = () => setSingle("")
    const setPresetMulti = (v: MultiValue) => setMulti(v)
    const clearMulti = () => setMulti([])

    return (
      <Box
        width="760px"
        p={16}
        sx={{ border: `1px solid ${theme.colors.border.default}`, borderRadius: 12 }}
      >
        <Flex direction="column" gap="12px">
          <Typography
            variant="b2Regular"
            text="Playground (값 변경/리셋/프리셋 + 실제 선택 인터랙션)"
          />

          <Flex gap="8px" sx={{ flexWrap: "wrap" }}>
            {!isMulti ? (
              <>
                <button style={actionButtonStyle} onClick={() => setPresetSingle("apple")}>
                  Set: apple
                </button>
                <button style={actionButtonStyle} onClick={() => setPresetSingle("banana")}>
                  Set: banana
                </button>
                <button style={actionButtonStyle} onClick={() => setPresetSingle("")}>
                  Set: empty("")
                </button>
                <button style={actionButtonStyle} onClick={clearSingle}>
                  Reset
                </button>
              </>
            ) : (
              <>
                <button style={actionButtonStyle} onClick={() => setPresetMulti(["alpha"])}>
                  Set: ["alpha"]
                </button>
                <button
                  style={actionButtonStyle}
                  onClick={() => setPresetMulti(["alpha", "beta", "gamma"])}
                >
                  Set: ["alpha","beta","gamma"]
                </button>
                <button
                  style={actionButtonStyle}
                  onClick={() => setPresetMulti(["alpha", "beta", "gamma", "delta"])}
                >
                  Set: all(except ALL)
                </button>
                <button style={actionButtonStyle} onClick={clearMulti}>
                  Reset
                </button>
              </>
            )}
          </Flex>

          <Select<any>
            {...args}
            options={options}
            value={currentValue as any}
            onChange={(v) => {
              if (isMulti) setMulti(v as SelectValue<MultiValue>)
              else setSingle(v as SelectValue<SingleValue>)
            }}
          />

          <Box
            p={12}
            sx={{
              border: `1px solid ${theme.colors.border.default}`,
              borderRadius: 10,
              backgroundColor: theme.colors.grayscale[50],
            }}
          >
            <Typography
              variant="b3Regular"
              color={theme.colors.text.secondary}
              text={`현재 값(JSON): ${JSON.stringify(currentValue)}`}
            />
            <Typography
              mt={6}
              variant="b3Regular"
              color={theme.colors.text.secondary}
              text={`모드: ${isMulti ? "MULTI" : "SINGLE"} / multipleType=${args.multipleType}`}
            />
          </Box>
        </Flex>
      </Box>
    )
  },
}

export const AllCases: Story = {
  render: () => {
    const [vOutlined, setVOutlined] = useState<SelectValue<SingleValue>>("")
    const [vFilled, setVFilled] = useState<SelectValue<SingleValue>>("apple")
    const [vStandard, setVStandard] = useState<SelectValue<SingleValue>>("banana")

    const [vMultiDefault, setVMultiDefault] = useState<SelectValue<MultiValue>>(["alpha", "gamma"])
    const [vMultiChip, setVMultiChip] = useState<SelectValue<MultiValue>>(["beta", "delta"])
    const [vMultiAll, setVMultiAll] = useState<SelectValue<MultiValue>>([])

    return (
      <Box
        width="980px"
        p={16}
        sx={{ border: `1px solid ${theme.colors.border.default}`, borderRadius: 12 }}
      >
        <Flex direction="column" gap="18px">
          <Typography
            variant="b2Regular"
            text="AllCases (각 케이스 모두 실제 값 변경됨 + 값 표시)"
          />

          <Flex gap="16px">
            <Box width="300px">
              <Select<SingleValue>
                label="Outlined / S"
                variant="outlined"
                size="S"
                options={baseOptions}
                value={vOutlined}
                onChange={setVOutlined}
                placeholder="선택"
                labelPlacement="top"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vOutlined)}`}
              />
            </Box>

            <Box width="300px">
              <Select<SingleValue>
                label="Filled / M"
                variant="filled"
                size="M"
                options={baseOptions}
                value={vFilled}
                onChange={setVFilled}
                placeholder="선택"
                labelPlacement="top"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vFilled)}`}
              />
            </Box>

            <Box width="300px">
              <Select<SingleValue>
                label="Standard / L"
                variant="standard"
                size="L"
                options={baseOptions}
                value={vStandard}
                onChange={setVStandard}
                placeholder="선택"
                labelPlacement="top"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vStandard)}`}
              />
            </Box>
          </Flex>

          <Flex gap="16px">
            <Box width="300px">
              <Select<SingleValue>
                label="Disabled"
                variant="outlined"
                size="M"
                options={baseOptions}
                value={"apple"}
                disabled
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: "apple" (고정)`}
              />
            </Box>

            <Box width="300px">
              <Select<SingleValue>
                label="ReadOnly"
                variant="outlined"
                size="M"
                options={baseOptions}
                value={"banana"}
                readOnly
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: "banana" (고정)`}
              />
            </Box>

            <Box width="300px">
              <Select<SingleValue>
                label="Error + HelperText"
                variant="outlined"
                size="M"
                options={baseOptions}
                value={vOutlined}
                onChange={setVOutlined}
                error
                helperText="필수 항목입니다."
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vOutlined)}`}
              />
            </Box>
          </Flex>

          <Flex gap="16px">
            <Box width="300px">
              <Select<SingleValue>
                label="Loading"
                variant="outlined"
                size="M"
                options={baseOptions}
                value={"apple"}
                isLoading
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: "apple" (고정)`}
              />
            </Box>

            <Box width="300px">
              <Select<SingleValue>
                label="Label Left"
                variant="outlined"
                size="M"
                options={baseOptions}
                value={vFilled}
                onChange={setVFilled}
                labelPlacement="left"
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vFilled)}`}
              />
            </Box>

            <Box width="300px">
              <Select<SingleValue>
                label="Label Bottom"
                variant="outlined"
                size="M"
                options={baseOptions}
                value={vStandard}
                onChange={setVStandard}
                labelPlacement="bottom"
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vStandard)}`}
              />
            </Box>
          </Flex>

          <Typography
            variant="b2Regular"
            text="Multiple (default / chip / all option) - 모두 클릭으로 값 변경됨"
          />

          <Flex gap="16px">
            <Box width="300px">
              <Select<MultiValue>
                label="multipleType=default"
                variant="outlined"
                size="M"
                options={multiOptions}
                value={vMultiDefault}
                onChange={setVMultiDefault}
                multipleType="default"
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vMultiDefault)}`}
              />
            </Box>

            <Box width="300px">
              <Select<MultiValue>
                label="multipleType=chip"
                variant="outlined"
                size="M"
                options={multiOptions}
                value={vMultiChip}
                onChange={setVMultiChip}
                multipleType="chip"
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vMultiChip)}`}
              />
            </Box>

            <Box width="300px">
              <Select<MultiValue>
                label="All Option Toggle"
                variant="outlined"
                size="M"
                options={multiOptions}
                value={vMultiAll}
                onChange={setVMultiAll}
                multipleType="multiple"
                placeholder="선택"
              />
              <Typography
                mt={6}
                variant="b3Regular"
                color={theme.colors.text.secondary}
                text={`값: ${JSON.stringify(vMultiAll)}`}
              />
            </Box>
          </Flex>
        </Flex>
      </Box>
    )
  },
}

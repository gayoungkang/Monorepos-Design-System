// import type { Meta, StoryObj } from "@storybook/react";
// import ToggleButton, { type ToggleButtonProps } from "./ToggleButton";
// import { ThemeProvider } from "styled-components";
// import { theme } from "../../tokens/theme";
// import { useState } from "react";
// import { IconNames } from "../Icon/icon-loader";



// const sampleButtons = [
//   { label: "Option 1", value: "1", icon: IconNames[0] },
//   { label: "Option 2", value: "2", icon: IconNames[1] },
//   { label: "Option 3", value: "3", icon: IconNames[2] },
// ];

// const meta: Meta<ToggleButtonProps> = {
//   title: "Atoms/Controls/ToggleButton",
//   component: ToggleButton,
//   args: {
//     buttons: sampleButtons,
//     selectedValue: "1",
//     size: "M",
//     disabled: false,
//     required: false,
//     label: "토글 버튼",
//     labelPlacement: "top",
//   },
//   argTypes: {
//     buttons: {
//       control: false,
//       description: "버튼 목록",
//     },
//     selectedValue: {
//       control: "text",
//       description: "현재 선택된 값",
//     },
//     size: {
//       control: "radio",
//       options: [ "S", "M", "L"],
//       description: "버튼 size",
//     },
//     disabled: { control: "boolean" },
//     required: { control: "boolean" },
//     label: {
//       control: "text",
//       description: "상단 라벨",
//     },
//     labelPlacement: {
//       control: "radio",
//       options: ["top", "bottom", "left", "right"],
//     },

//     iconProps: { control: false },
//     labelProps: { control: false },

//     onClick: {
//       action: "clicked",
//       description: "클릭 시 호출",
//     },

//     /* BaseMixinProps */
//     p: { control: "text" },
//     pt: { control: "text" },
//     pr: { control: "text" },
//     pb: { control: "text" },
//     pl: { control: "text" },
//     px: { control: "text" },
//     py: { control: "text" },

//     m: { control: "text" },
//     mt: { control: "text" },
//     mr: { control: "text" },
//     mb: { control: "text" },
//     ml: { control: "text" },
//     mx: { control: "text" },
//     my: { control: "text" },

//     width: { control: "text" },
//     height: { control: "text" },

//     sx: { control: false },
//   },

//   decorators: [
//     (Story) => (
//       <ThemeProvider theme={theme}>
//         <div style={{ padding: "24px" }}>
//           <Story />
//         </div>
//       </ThemeProvider>
//     ),
//   ],

//   tags: ["autodocs"],
// };

// export default meta;
// type Story = StoryObj<ToggleButtonProps>;

// /* ---------------- 기본 ---------------- */
// export const Default: Story = {};

// /* ---------------- Sizes ---------------- */
// export const Sizes: Story = {
//   render: (args) => (
//     <div style={{ display: "flex", gap: 16 }}>
//       <ToggleButton {...args} size="S" />
//       <ToggleButton {...args} size="M" />
//       <ToggleButton {...args} size="L" />
//     </div>
//   ),
// };

// /* ---------------- Disabled ---------------- */
// export const Disabled: Story = {
//   args: {
//     disabled: true,
//   },
// };

// /* ---------------- Label Placement ---------------- */
// export const LabelPlacements: Story = {
//   render: (args) => (
//     <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//       <ToggleButton {...args} labelPlacement="top" />
//       <ToggleButton {...args} labelPlacement="bottom" />
//       <ToggleButton {...args} labelPlacement="left" />
//       <ToggleButton {...args} labelPlacement="right" />
//     </div>
//   ),
// };

// /* ---------------- Controlled ---------------- */
// export const Controlled: Story = {
//   render: (args) => {
//     const [val, setVal] = useState("2");

//     return (
//       <ToggleButton
//         {...args}
//         selectedValue={val}
//         onClick={(v) => {
//           setVal(v);
//           console.log("clicked:", v);
//         }}
//       />
//     );
//   },
// };



import type { Meta, StoryObj } from "@storybook/react";
import ToggleButton, { type ToggleButtonProps } from "./ToggleButton";
import { ThemeProvider } from "styled-components";
import { theme } from "../../tokens/theme";
import { useState } from "react";
import { IconNames } from "../Icon/icon-loader";

const sampleButtons = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
];

const meta: Meta<ToggleButtonProps> = {
  title: "Atoms/Controls/ToggleButton",
  component: ToggleButton,
  args: {
    buttons: sampleButtons,
    selectedValue: "1",
    size: "M",
    disabled: false,
    required: false,
    label: "토글버튼",
    labelPlacement: "top",
    orientation: "horizontal",
  },
  argTypes: {
    buttons: { control: false },

    selectedValue: { control: "text" },

    size: {
      control: "radio",
      options: ["S", "M", "L"],
    },

    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },

    disabled: { control: "boolean" },
    required: { control: "boolean" },

    label: { control: "text" },

    labelPlacement: {
      control: "radio",
      options: ["top", "bottom", "left", "right"],
    },

    iconProps: { control: false },
    labelProps: { control: false },

    onClick: { action: "clicked" },

    /* BaseMixinProps */
    p: { control: "text" },
    m: { control: "text" },
    mx: { control: "text" },
    my: { control: "text" },
    mt: { control: "text" },
    mr: { control: "text" },
    mb: { control: "text" },
    ml: { control: "text" },

    width: { control: "text" },
    height: { control: "text" },

    sx: { control: false },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<ToggleButtonProps>;

/* ─────────── Default ─────────── */
export const Default: Story = {};

/* ─────────── Sizes ─────────── */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16 }}>
      <ToggleButton {...args} size="S" />
      <ToggleButton {...args} size="M" />
      <ToggleButton {...args} size="L" />
    </div>
  ),
};

/* ─────────── LabelPlacement ─────────── */
export const LabelPlacements: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ToggleButton {...args} labelPlacement="top" />
      <ToggleButton {...args} labelPlacement="bottom" />
      <ToggleButton {...args} labelPlacement="left" />
      <ToggleButton {...args} labelPlacement="right" />
    </div>
  ),
};

/* ─────────── Orientation ─────────── */
export const Orientation: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 20 }}>
      <ToggleButton {...args} orientation="horizontal" />
      <ToggleButton {...args} orientation="vertical" />
    </div>
  ),
};

/* ─────────── Controlled ─────────── */
export const Controlled: Story = {
  render: (args) => {
    const [val, setVal] = useState("2");

    return (
      <ToggleButton
        {...args}
        selectedValue={val}
        onClick={(v) => {
          setVal(v);
          console.log("clicked:", v);
        }}
      />
    );
  },
};

/* ─────────── Buttons Variants ─────────── */

export const ButtonsVariants: Story = {
    render: (args) => {
  
      const onlyIconButtons = [
        { icon: IconNames[0], value: "icon1" },
        { icon: IconNames[1], value: "icon2" },
        { icon: IconNames[2], value: "icon3" },
      ];
  
      const iconLabelButtons = [
        { icon: "InfoLine", label: "Info", value: "il1" },
        { icon: "SettingsLine", label: "Settings", value: "il2" },
        { icon: "BellLine", label: "Alarm", value: "il3" },
      ];
  
      const onlyLabelButtons = [
        { label: "One", value: "lbl1" },
        { label: "Two", value: "lbl2" },
        { label: "Three", value: "lbl3" },
      ];
  
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Icon Only */}
          <ToggleButton
            {...args}
            label="Icon Only"
            buttons={onlyIconButtons}
          />
  
          {/* Icon + Label */}
          <ToggleButton
            {...args}
            label="Icon + Label"
            buttons={iconLabelButtons}
          />
  
          {/* Label Only */}
          <ToggleButton
            {...args}
            label="Label Only"
            buttons={onlyLabelButtons}
          />
        </div>
      );
    },
  };
  

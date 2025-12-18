import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ThemeProvider } from "styled-components"
import { theme } from "../../tokens/theme"
import List, { ListProps } from "./List"
import { IconNames } from "../Icon/icon-loader"
import Box from "../Box/Box"

/* -------------------------------------------------------------------------- */
/*                                    Meta                                    */
/* -------------------------------------------------------------------------- */

const meta: Meta<ListProps> = {
  title: "components/List",
  component: List,

  args: {
    dense: false,
    disablePadding: false,
    separator: true,
  },

  argTypes: {
    dense: { control: "boolean" },
    disablePadding: { control: "boolean" },
    separator: { control: "boolean" },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Box width="340px">
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<ListProps>

/* -------------------------------------------------------------------------- */
/*                                  Default                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  args: {
    title: "Default List",
    items: [{ label: "Item One" }, { label: "Item Two" }, { label: "Item Three" }],
  },
}

/* -------------------------------------------------------------------------- */
/*                                With Avatar                                 */
/* -------------------------------------------------------------------------- */

export const WithAvatar: Story = {
  args: {
    title: "With Avatar",
    items: [
      {
        label: "Alice",
        startItem: [{ type: "Avatar", props: { name: "Alice", size: "S" } }],
      },
      {
        label: "Bob",
        startItem: [{ type: "Avatar", props: { name: "Bob", size: "S" } }],
      },
    ],
  },
}

/* -------------------------------------------------------------------------- */
/*                                With Icons                                  */
/* -------------------------------------------------------------------------- */

export const WithIcons: Story = {
  args: {
    title: "With Icons",
    items: [
      { label: "Icon 1", startItem: [{ type: "Icon", props: { name: IconNames[0] } }] },
      { label: "Icon 2", startItem: [{ type: "Icon", props: { name: IconNames[1] } }] },
      { label: "Icon 3", startItem: [{ type: "Icon", props: { name: IconNames[2] } }] },
    ],
  },
}

/* -------------------------------------------------------------------------- */
/*                               With CheckBox                                */
/* -------------------------------------------------------------------------- */

export const WithCheckBox: Story = {
  render: (args) => {
    const [checkedMap, setCheckedMap] = useState({
      notify: true,
      newsletter: false,
    })

    return (
      <List
        {...args}
        title="Checklist"
        items={[
          {
            label: "Receive notifications",
            startItem: [
              {
                type: "CheckBox",
                props: {
                  checked: checkedMap.notify,
                  label: "",
                  onChange: () => setCheckedMap((prev) => ({ ...prev, notify: !prev.notify })),
                },
              },
            ],
          },
          {
            label: "Subscribe newsletter",
            startItem: [
              {
                type: "CheckBox",
                props: {
                  checked: checkedMap.newsletter,
                  label: "",
                  onChange: () =>
                    setCheckedMap((prev) => ({ ...prev, newsletter: !prev.newsletter })),
                },
              },
            ],
          },
        ]}
      />
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                          With IconButton (Actions)                          */
/* -------------------------------------------------------------------------- */

export const WithActions: Story = {
  args: {
    title: "With IconButton",
    items: [
      {
        label: "Edit Profile",
        endItem: [{ type: "IconButton", props: { icon: IconNames[8] } }],
      },
      {
        label: "Remove User",
        endItem: [{ type: "IconButton", props: { icon: IconNames[6] } }],
      },
    ],
  },
}

/* -------------------------------------------------------------------------- */
/*                                With Switch                                  */
/* -------------------------------------------------------------------------- */

export const WithSwitch: Story = {
  render: (args) => {
    const [darkMode, setDarkMode] = useState(true)
    const [emailAlerts, setEmailAlerts] = useState(false)

    return (
      <List
        {...args}
        title="With Switch"
        items={[
          {
            label: "Dark Mode",
            endItem: [
              {
                type: "Switch",
                props: {
                  label: "",
                  checked: darkMode,
                  onChange: () => setDarkMode((v) => !v),
                },
              },
            ],
          },
          {
            label: "Email Alerts",
            endItem: [
              {
                type: "Switch",
                props: {
                  label: "",
                  checked: emailAlerts,
                  onChange: () => setEmailAlerts((v) => !v),
                },
              },
            ],
          },
        ]}
      />
    )
  },
}

/* -------------------------------------------------------------------------- */
/*                               Selected Items                                */
/* -------------------------------------------------------------------------- */

export const SelectedItems: Story = {
  args: {
    title: "Selected Example",
    items: [{ label: "Item A", selected: true }, { label: "Item B" }, { label: "Item C" }],
  },
}

/* -------------------------------------------------------------------------- */
/*                                Disabled Items                               */
/* -------------------------------------------------------------------------- */

export const DisabledItems: Story = {
  args: {
    title: "Disabled Example",
    items: [{ label: "Unavailable Feature", disabled: true }, { label: "Active Feature" }],
  },
}

/* -------------------------------------------------------------------------- */
/*                              Complex Multi UI                               */
/* -------------------------------------------------------------------------- */

export const ComplexItems: Story = {
  render: (args) => {
    const [autoSave, setAutoSave] = useState(true)
    const [syncEnabled, setSyncEnabled] = useState(true)

    return (
      <List
        {...args}
        title="Complex UI Example"
        separator
        items={[
          {
            label: "User Info",
            startItem: [{ type: "Avatar", props: { name: "GY", size: "S" } }],
            endItem: [{ type: "IconButton", props: { icon: "More2Line" } }],
          },
          {
            label: "Auto Save",
            startItem: [{ type: "Icon", props: { name: IconNames[8] } }],
            endItem: [
              {
                type: "Switch",
                props: {
                  label: "",
                  checked: autoSave,
                  onChange: () => setAutoSave((v) => !v),
                },
              },
            ],
          },
          {
            label: "Enable Sync",
            startItem: [
              {
                type: "CheckBox",
                props: {
                  checked: syncEnabled,
                  label: "",
                  onChange: () => setSyncEnabled((v) => !v),
                },
              },
            ],
          },
        ]}
      />
    )
  },
}

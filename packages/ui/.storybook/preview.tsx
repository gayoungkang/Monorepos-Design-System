import "virtual:svg-icons-register"
import type { Preview } from "@storybook/react"
import { withThemeByClassName } from "@storybook/addon-themes"
import { ThemeProvider } from "styled-components"
import { GlobalStyle } from "../src/tokens/globalStyle"
import { theme } from "../src/tokens/theme"
import SnackBar from "../src/components/SnackBar/SnackBar"
import React from "react"

const preview: Preview = {
  parameters: {
    themes: {
      defaultTheme: "light",
      list: [
        { name: "light", class: "light" },
        { name: "dark", class: "dark" },
      ],
    },
  },

  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),

    (Story) => (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <SnackBar.List />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "100vw",
            height: "100vh",
            padding: "40px",
            margin: "0 40px",
            overflowY: "auto",
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export default preview

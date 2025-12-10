// .storybook/preview.ts

import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from '../src/components/tokens/globalStyle'

import { theme } from '../src/components/tokens/theme'
import 'virtual:svg-icons-register'
import React from 'react'

const preview: Preview = {

  parameters: {
    themes: {
      defaultTheme: 'light',
      list: [
        {
          name: 'light',
          class: 'light',
        },
        {
          name: 'dark',
          class: 'dark',
        },
      ],
    },
  },

  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Story />
      </ThemeProvider>
    ),
  ],
}

export default preview

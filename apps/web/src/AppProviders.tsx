import type { ReactNode } from "react"
import { ThemeProvider } from "styled-components"
import { GlobalStyle, theme } from "@acme/ui"

type Props = { children: ReactNode }

export const AppProviders = ({ children }: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  )
}

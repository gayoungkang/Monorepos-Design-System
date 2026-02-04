import type { ReactNode } from "react"
import { ThemeProvider } from "styled-components"
import { GlobalStyle, theme, IconSpriteProvider } from "@acme/ui"

type Props = { children: ReactNode }

export default function AppProviders({ children }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <IconSpriteProvider spriteUrl="/acme-ui-icon-sprite.svg" />
      {children}
    </ThemeProvider>
  )
}

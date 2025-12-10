import 'styled-components'
import type { ThemeVariantType, ColorsType, ZindexType, FontsType, ShadowsType, BorderRadiusType } from './theme'

declare module 'styled-components' {
  export interface DefaultTheme {
    zIndex: ZindexType
    colors: ColorsType
    fonts: FontsType
    shadows: ShadowsType
    borderRadius: BorderRadiusType
  }
}

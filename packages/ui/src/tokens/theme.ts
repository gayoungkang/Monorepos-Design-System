import { css } from "styled-components"
import type { DefaultTheme } from "styled-components"

const colors = {
  grayscale: {
    "900": "#1C1D22",
    "800": "#32363E",
    "700": "#494E5A",
    "600": "#606776",
    "500": "#787F91",
    "400": "#959CAC",
    "300": "#B9BECB",
    "200": "#DCDEE5",
    "100": "#E8E9EE",
    "50": "#F6F7F9",
    white: "#FFFFFF",
  },
  text: {
    primary: "#32363E",
    secondary: "#494E5A",
    tertiary: "#787F91",
    disabled: "#B9BECB",
  },
  background: {
    dark: "#E8E9EE",
    default: "#F6F7F9",
  },
  border: {
    thick: "#DCDEE5",
    default: "#E8E9EE",
  },
  dim: {
    default: "#00000033",
  },
  primary: {
    "400": "#435C9D",
    "300": "#5171C2",
    "200": "#6480C9",
    "100": "#B9C8F9",
    "50": "#E8EDFD",
  },
  secondary: {
    "400": "#2196F3",
    "300": "#64B5F6",
    "200": "#90CAF9",
    "100": "#BBDEFB",
    "50": "#E3F2FD",
  },
  error: {
    "500": "#EC5555",
    "300": "#F58480",
    "100": "#FCEAE8",
    "50": "#FDF3F2",
  },
  info: {
    "500": "#2980D6",
    "300": "#80B3E5",
    "100": "#DEEBF7",
    "50": "#F2F7FC",
  },
  success: {
    "500": "#5EBA97",
    "300": "#7DD9B6",
    "100": "#D6F5E9",
    "50": "#ECF9F4",
  },
  warning: {
    "500": "#F98C06",
    "300": "#FBC36A",
    "100": "#FCF1D9",
    "50": "#FDF8ED",
  },
  darkblue: {
    "800": "#222B44",
    "700": "#2F3956",
    "100": "#C8CEDF",
    "50": "#D9DDE8",
  },
} as const

const shadows = {
  elevation: [
    "none",
    "0px 1px 3px rgba(0,0,0,0.2), 0px 1px 1px rgba(0,0,0,0.14), 0px 2px 1px rgba(0,0,0,0.12)",
    "0px 1px 4px rgba(0, 0, 0, 0.18),0px 2px 8px rgba(0, 0, 0, 0.12)",
    "0px 1px 5px rgba(0,0,0,0.2), 0px 2px 2px rgba(0,0,0,0.14), 0px 3px 1px rgba(0,0,0,0.12)",
    "0px 1px 8px rgba(0,0,0,0.2), 0px 3px 4px rgba(0,0,0,0.14), 0px 3px 3px rgba(0,0,0,0.12)",
    "0px 2px 4px rgba(0,0,0,0.2), 0px 4px 5px rgba(0,0,0,0.14), 0px 1px 10px rgba(0,0,0,0.12)",
    "0px 3px 5px rgba(0,0,0,0.2), 0px 5px 8px rgba(0,0,0,0.14), 0px 1px 14px rgba(0,0,0,0.12)",
    "0px 3px 5px rgba(0,0,0,0.2), 0px 6px 10px rgba(0,0,0,0.14), 0px 1px 18px rgba(0,0,0,0.12)",
    "0px 4px 5px rgba(0,0,0,0.2), 0px 7px 10px rgba(0,0,0,0.14), 0px 2px 16px rgba(0,0,0,0.12)",
    "0px 5px 5px rgba(0,0,0,0.2), 0px 8px 10px rgba(0,0,0,0.14), 0px 3px 14px rgba(0,0,0,0.12)",
    "0px 5px 6px rgba(0,0,0,0.2), 0px 9px 12px rgba(0,0,0,0.14), 0px 3px 16px rgba(0,0,0,0.12)",
    "0px 6px 6px rgba(0,0,0,0.2), 0px 10px 14px rgba(0,0,0,0.14), 0px 4px 18px rgba(0,0,0,0.12)",
    "0px 6px 7px rgba(0,0,0,0.2), 0px 11px 15px rgba(0,0,0,0.14), 0px 4px 20px rgba(0,0,0,0.12)",
    "0px 7px 8px rgba(0,0,0,0.2), 0px 12px 17px rgba(0,0,0,0.14), 0px 5px 22px rgba(0,0,0,0.12)",
    "0px 7px 8px rgba(0,0,0,0.2), 0px 13px 19px rgba(0,0,0,0.14), 0px 5px 24px rgba(0,0,0,0.12)",
    "0px 7px 9px rgba(0,0,0,0.2), 0px 14px 21px rgba(0,0,0,0.14), 0px 5px 26px rgba(0,0,0,0.12)",
    "0px 8px 9px rgba(0,0,0,0.2), 0px 15px 22px rgba(0,0,0,0.14), 0px 6px 28px rgba(0,0,0,0.12)",
    "0px 8px 10px rgba(0,0,0,0.2), 0px 16px 24px rgba(0,0,0,0.14), 0px 6px 30px rgba(0,0,0,0.12)",
    "0px 8px 11px rgba(0,0,0,0.2), 0px 17px 26px rgba(0,0,0,0.14), 0px 6px 32px rgba(0,0,0,0.12)",
    "0px 9px 11px rgba(0,0,0,0.2), 0px 18px 28px rgba(0,0,0,0.14), 0px 7px 34px rgba(0,0,0,0.12)",
    "0px 9px 12px rgba(0,0,0,0.2), 0px 19px 29px rgba(0,0,0,0.14), 0px 7px 36px rgba(0,0,0,0.12)",
    "0px 10px 13px rgba(0,0,0,0.2), 0px 20px 31px rgba(0,0,0,0.14), 0px 8px 38px rgba(0,0,0,0.12)",
    "0px 10px 13px rgba(0,0,0,0.2), 0px 21px 33px rgba(0,0,0,0.14), 0px 8px 40px rgba(0,0,0,0.12)",
    "0px 10px 14px rgba(0,0,0,0.2), 0px 22px 35px rgba(0,0,0,0.14), 0px 8px 42px rgba(0,0,0,0.12)",
    "0px 11px 14px rgba(0,0,0,0.2), 0px 23px 36px rgba(0,0,0,0.14), 0px 9px 44px rgba(0,0,0,0.12)",
    "0px 11px 15px rgba(0,0,0,0.2), 0px 24px 38px rgba(0,0,0,0.14), 0px 9px 46px rgba(0,0,0,0.12)",
  ],
} as const

export const zIndex = {
  base: 0,
  content: 1,
  dropdown: 100,
  sticky: 200,
  modal: 1000,
  popover: 1100,
  toast: 1200,
  tooltip: 1300,
  loading: 2000,
}

export const fonts = {
  heading: {
    h1: css`
      font-size: 1.125rem;
      font-weight: 700;
      line-height: 1.125rem;
    `,
    h2: css`
      font-size: 1rem;
      font-weight: 700;
      line-height: 1rem;
    `,
    h3: css`
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 0.875rem;
    `,
  },

  body: {
    b1: {
      Bold: css`
        font-size: 0.875rem;
        font-weight: 700;
        line-height: 1.09375rem;
      `,
      Medium: css`
        font-size: 0.875rem;
        font-weight: 500;
        line-height: 1.09375rem;
      `,
      Regular: css`
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.09375rem;
      `,
    },
    b2: {
      Medium: css`
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 0.9375rem;
      `,
      Regular: css`
        font-size: 0.75rem;
        font-weight: 400;
        line-height: 0.9375rem;
      `,
    },
    b3: {
      Medium: css`
        font-size: 0.625rem;
        font-weight: 500;
        line-height: 0.78125rem;
      `,
      Regular: css`
        font-size: 0.625rem;
        font-weight: 400;
        line-height: 0.78125rem;
      `,
    },
  },
}

const borderRadius = {
  0: "0",
  1: "2px",
  4: "4px",
  6: "6px",
  8: "8px",
  16: "16px",
  18: "18px",
  50: "50%",
} as const

export type TypographyVariant = keyof typeof typographyVariants

export const typographyVariants = {
  // heading
  h1: fonts.heading.h1,
  h2: fonts.heading.h2,
  h3: fonts.heading.h3,

  // body b1
  b1Bold: fonts.body.b1.Bold,
  b1Medium: fonts.body.b1.Medium,
  b1Regular: fonts.body.b1.Regular,

  // body b2
  b2Medium: fonts.body.b2.Medium,
  b2Regular: fonts.body.b2.Regular,

  // body b3
  b3Medium: fonts.body.b3.Medium,
  b3Regular: fonts.body.b3.Regular,
} as const

export type ThemeVariantType = "WHITE" | "BLUE" | "BLACK"
export type ColorsType = typeof colors
export type ZindexType = typeof zIndex
export type FontsType = typeof fonts
export type ShadowsType = typeof shadows
export type BorderRadiusType = typeof borderRadius

export const theme: DefaultTheme = {
  zIndex,
  colors,
  fonts,
  shadows,
  borderRadius,
}

import type { StorybookConfig } from "@storybook/react-vite"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    {
      name: "@storybook/addon-essentials",
      options: {
        toolbar: false,
      },
    },
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal(config) {
    config.plugins = [
      ...(config.plugins ?? []),
      createSvgIconsPlugin({
        iconDirs: [resolve(__dirname, "../src/components/atoms/Icon/svgs")],
        symbolId: "icon-[name]",
      }),
    ]

    return config
  },
}

export default config

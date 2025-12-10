import type { StorybookConfig } from "@storybook/react-vite"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"

const __dirname = dirname(fileURLToPath(import.meta.url))

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
        iconDirs: [join(__dirname, "../src/components/Icon/svg")],
        symbolId: "icon-[dir]-[name]",
      }),
    ]

    return config
  },
}

export default config

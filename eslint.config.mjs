import "jiti/register"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import configPrettier from "eslint-config-prettier"
import globals from "globals"

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/storybook-static/**",
      "**/.storybook/**",
      "**/coverage/**",
      "**/.yarn/**",
      "**/*.config.*",
      "**/*.d.ts",
      "**/vite.config.ts",
    ],
  },

  {
    settings: { react: { version: "detect" } },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  configPrettier,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react: reactPlugin },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
      ],

      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@acme/ui/*", "@acme/ui/**"],
              message: "Deep import 금지. '@acme/ui' 공개 API만 사용.",
            },
          ],
          paths: [
            {
              name: "styled-components",
              message:
                "apps/*에서 styled-components 직접 사용 금지(또는 제한). UI는 @acme/ui로 이동.",
              allowImportNames: [
                "ThemeProvider",
                "css",
                "keyframes",
                "createGlobalStyle",
                "DefaultTheme",
                "CSSObject",
              ],
            },
          ],
        },
      ],

      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message: "임의 HEX 컬러 금지. theme/tokens를 사용하세요.",
        },
      ],
    },
  },

  {
    files: ["**/*.stories.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    files: ["packages/ui/src/tokens/theme.ts"],
    rules: {
      "no-restricted-imports": "off",
      "no-restricted-syntax": "off",
    },
  },

  {
    files: ["**/*.{test,spec}.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "react/display-name": "off",
    },
  },
)

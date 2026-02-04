import "jiti/register"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import configPrettier from "eslint-config-prettier"

export default tseslint.config(
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      ".yarn",
      "storybook-static",
      "**/*.config.*",
      "**/*.d.ts",
      "**/vite.config.ts",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: reactPlugin,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactPlugin.configs.recommended,
      configPrettier,
    ],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
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
)

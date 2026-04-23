import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // 1. 忽略構建產物
  { ignores: ["dist", "node_modules"] },

  // 2. 核心 React 配置
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node, // 讓你在 vite.config.js 不會報錯
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" }, // 自動偵測 React 版本
    },
    rules: {
      // 繼承各插件的推薦規則
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules, // 支援 React 17+ 不需要 import React
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // 自定義現代開發建議
      "react/prop-types": "off", // 現代開發多用 TypeScript 或不強制檢查 prop-types
      "react/self-closing-comp": "warn", // 強制使用自閉合標籤，代碼更乾淨
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }], // 防止留下太多調試資訊
    },
  },

  // 3. 放在最後：停用所有與 Prettier 衝突的 ESLint 規則
  eslintConfigPrettier,
];

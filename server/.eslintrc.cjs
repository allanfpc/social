module.exports = {
  env: {
    es2021: true,    
    node: true,
  },
  extends: ["standard", "plugin:prettier/recommended"],
  //parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {    
    "no-useless-constructor": 0,
    "prettier/prettier": [
      "error",
      {
        "tabWidth": 2,
        "quoteProps": "as-needed",
        "printWidth": 80,
        "singleQuote": false,
        "trailingComma": "none",
        "arrowParens": "always",
        "useTabs": true,
        "semi": true,
        "endOfLine": "auto"
        }   
    ],
  },
  ignorePatterns: [
    '**/node_modules', '**/.git', '.eslintrc.cjs', '**/.svn', '**/.hg', '.json'
  ]
}
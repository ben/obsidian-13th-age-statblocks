# 13th Age Statblocks

This plugin renders 13th-Age plugins, and includes SRD content to base your monsters from.

![](https://user-images.githubusercontent.com/39902/149404290-3dcb6793-0437-496d-b066-b2d7d5355374.png)

![](https://user-images.githubusercontent.com/39902/149404315-5a9d6d45-55da-421b-b424-9596d2f95d55.png)


### Development

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

### Improve code quality with eslint (optional)
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code.
- To use eslint with this project, make sure to install eslint from terminal:
  - `npm install -g eslint`
- To use eslint to analyze this project use this command:
  - `eslint main.ts`
  - eslint will then create a report with suggestions for code improvement by file and line number.
- If your source code is in a folder, such as `src`, you can use eslint with this command to analyze all files in that folder:
  - `eslint .\src\`


### API Documentation

See https://github.com/obsidianmd/obsidian-api

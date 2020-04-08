/* eslint-disable i18next/no-literal-string */
module.exports = {
  testTimeout: 60000,
  preset: "jest-puppeteer",
  testMatch: [
    "**/perf/**/*.[tj]s",
  ],
}

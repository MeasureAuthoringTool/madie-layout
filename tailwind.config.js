const formsPlugin = require("@tailwindcss/forms");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [formsPlugin],
};

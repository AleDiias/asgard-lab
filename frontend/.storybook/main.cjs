const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

const extraAlias = {
  "@": path.join(projectRoot, "src"),
  react: path.join(projectRoot, "node_modules/react"),
  "react-dom": path.join(projectRoot, "node_modules/react-dom"),
};

/** @type {import("@storybook/react-vite").StorybookConfig} */
const config = {
  stories: ["../src/stories/**/*.mdx", "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(userConfig) {
    const prevAlias = userConfig.resolve?.alias;

    const alias = Array.isArray(prevAlias)
      ? [
          ...prevAlias,
          { find: "@", replacement: extraAlias["@"] },
          { find: "react", replacement: extraAlias.react },
          { find: "react-dom", replacement: extraAlias["react-dom"] },
        ]
      : {
          ...(prevAlias ?? {}),
          ...extraAlias,
        };

    return {
      ...userConfig,
      resolve: {
        ...userConfig.resolve,
        alias,
        dedupe: [...(userConfig.resolve?.dedupe ?? []), "react", "react-dom"],
      },
      server: {
        ...userConfig.server,
        fs: {
          ...userConfig.server?.fs,
          allow: [
            ...new Set([
              ...(Array.isArray(userConfig.server?.fs?.allow) ? userConfig.server.fs.allow : []),
              projectRoot,
              path.join(projectRoot, ".."),
            ]),
          ],
        },
      },
      optimizeDeps: {
        ...userConfig.optimizeDeps,
        include: [
          ...new Set([
            ...(userConfig.optimizeDeps?.include ?? []),
            "react",
            "react-dom",
            "react/jsx-runtime",
            "react-router-dom",
            "i18next",
            "react-i18next",
            "@storybook/react",
          ]),
        ],
      },
    };
  },
};

module.exports = config;

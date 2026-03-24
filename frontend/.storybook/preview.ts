import type { Preview } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { TooltipProvider } from "@/components/ui";
import "../src/index.css";

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        TooltipProvider,
        null,
        React.createElement(MemoryRouter, null, React.createElement(Story))
      ),
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
        desktopLg: {
          name: "Desktop (large)",
          styles: { width: "1920px", height: "1080px" },
          type: "desktop",
        },
      },
      defaultViewport: "desktop",
    },
  },
};

export default preview;

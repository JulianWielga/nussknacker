import { ModuleUrl } from "@touk/federated-component";
import { ToolbarConfig } from "./types";

const isProd = process.env.NODE_ENV === "production";
export const isVisualTesting = window["Cypress"];

const isDev = !isProd && !isVisualTesting;

export const DEV_TOOLBARS: ToolbarConfig[] = isDev
    ? [
          { id: "user-settings-panel" },
          {
              id: "remote-panel",
              componentUrl: "managerWebEnrichers/test@http://enrichers.test.localhost:4000/remoteEntry.js" as ModuleUrl,
              color: "#993300",
              additionalParams: {
                  tenantId: "0fe49819-411e-458b-a539-cf50157a41de",
              },
          },
          {
              id: "creator-panel",
              title: "Creator",
              additionalParams: {
                  tenantId: "0fe49819-411e-458b-a539-cf50157a41de",
                  addGroupElement: "managerWebEnrichers/addButton@http://enrichers.test.localhost:4000/remoteEntry.js" as ModuleUrl,
              },
          },
      ]
    : [];

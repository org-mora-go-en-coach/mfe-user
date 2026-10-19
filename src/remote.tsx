import React from "react";
import { createRoot } from "react-dom/client";
import { UserApp } from "./1-page/user";
import "./style.scss";
import "./library.scss";

function ensureStylesheet() {
  const id = "mfe-user-styles";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  const entryUrl = new URL(import.meta.url);
  const stylesheetUrl = new URL("./assets/mfe-user.css", entryUrl);
  stylesheetUrl.search = entryUrl.search;
  link.href = stylesheetUrl.href;
  document.head.append(link);
}

export function mount(
  element: HTMLElement,
  options: { apiBaseUrl?: string; lessonApiBaseUrl?: string } = {},
) {
  ensureStylesheet();
  const root = createRoot(element);
  root.render(
    <UserApp
      apiBaseUrl={options.apiBaseUrl}
      lessonApiBaseUrl={options.lessonApiBaseUrl}
    />,
  );
  return () => root.unmount();
}

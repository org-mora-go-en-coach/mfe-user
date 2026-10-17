import React from "react";
import { createRoot } from "react-dom/client";
import { UserApp } from "./UserApp";
import "./style.css";

function ensureStylesheet() {
  const id = "mfe-user-styles";
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = new URL("./assets/mfe-user.css", import.meta.url).href;
  document.head.append(link);
}

export function mount(element: HTMLElement, options: { apiBaseUrl?: string } = {}) {
  ensureStylesheet();
  const root = createRoot(element);
  root.render(<UserApp apiBaseUrl={options.apiBaseUrl} />);
  return () => root.unmount();
}

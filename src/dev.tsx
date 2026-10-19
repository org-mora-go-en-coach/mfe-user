import { mount } from "./remote";
mount(document.getElementById("root")!, {
  apiBaseUrl: "http://localhost:4202/api/v1.0.1",
});

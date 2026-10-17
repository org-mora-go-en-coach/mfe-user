import { expect, test } from "@playwright/test";

test("2. 저장한 강의를 목록에서 제거한다", async ({ page }) => {
  let saved = true;
  await page.addInitScript(() => { sessionStorage.setItem("mora-go:user-view", "saved"); });
  await page.route("**/api/v1.0.1/users", route => route.fulfill({json:{users:[]}}));
  await page.route("**/api/v1.0.2/activity", route => route.fulfill({json:{history:[],saved:saved?[{id:"opinion",title:"Share a clear opinion",level:"B1",durationMinutes:22,progress:0,saved:true,lastStudiedAt:null}]:[]}}));
  await page.route("**/api/v1.0.2/lessons/opinion", async route => { saved = false; await route.fulfill({json:{lesson:{id:"opinion",saved}}}); });
  await page.goto("/");
  await expect(page.getByText("Share a clear opinion")).toBeVisible();
  await page.getByRole("button", { name: "Remove Share a clear opinion from saved" }).click();
  await expect(page.getByRole("button", { name: "Remove Share a clear opinion from saved" })).toHaveCount(0);
  await expect(page.getByText("Share a clear opinion removed from Saved.")).toBeVisible();
});

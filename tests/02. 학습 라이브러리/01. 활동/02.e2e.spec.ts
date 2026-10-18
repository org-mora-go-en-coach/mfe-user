import { expect, test } from "@playwright/test";

test("2. 저장한 강의를 목록에서 제거한다", async ({ page }) => {
  let saved = true;
  await page.addInitScript(() => { sessionStorage.setItem("mora-go:user-view", "saved"); });
  await page.route("**/api/v1.0.1/users", route => route.fulfill({json:{users:[]}}));
  await page.route("**/api/v1.0.2/activity", route => route.fulfill({json:{history:[],saved:saved?[{id:"opinion",title:"명확하게 의견 말하기",level:"B1",durationMinutes:22,progress:0,saved:true,lastStudiedAt:null}]:[]}}));
  await page.route("**/api/v1.0.2/lessons/opinion", async route => { saved = false; await route.fulfill({json:{lesson:{id:"opinion",saved}}}); });
  await page.goto("/");
  await expect(page.getByText("명확하게 의견 말하기")).toBeVisible();
  await page.getByRole("button", { name: "명확하게 의견 말하기 보관함에서 제거" }).click();
  await expect(page.getByRole("button", { name: "명확하게 의견 말하기 보관함에서 제거" })).toHaveCount(0);
  await expect(page.getByText("명확하게 의견 말하기 강의를 보관함에서 제거했습니다.")).toBeVisible();
});

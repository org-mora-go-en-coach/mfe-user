import { expect, test } from "@playwright/test";

test("1. 학습 기록의 진행률을 갱신한다", async ({ page }) => {
  let progress = 35;
  await page.addInitScript(() => { sessionStorage.setItem("mora-go:user-view", "history"); });
  await page.route("**/api/v1.0.1/users", route => route.fulfill({json:{users:[]}}));
  await page.route("**/api/v1.0.2/activity", route => route.fulfill({json:{history:[{id:"followups",title:"Ask follow-up questions",level:"A2",durationMinutes:18,progress,saved:false,lastStudiedAt:"2026-10-17T00:00:00.000Z"}],saved:[]}}));
  await page.route("**/api/v1.0.2/lessons/followups", async route => { progress = 45; await route.fulfill({json:{lesson:{id:"followups",progress}}}); });
  await page.goto("/");
  await expect(page.getByText("35% complete")).toBeVisible();
  await page.getByRole("button", { name: "Continue Ask follow-up questions" }).click();
  await expect(page.getByText("45% complete")).toBeVisible();
});

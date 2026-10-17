import { expect, test } from "@playwright/test";

test("2. 회원 목록에서 마이페이지를 연다", async ({ page }) => {
  await page.route("**/api/v1.0.1/users", route => route.fulfill({json:{users:[{id:"user-1",name:"Mora Learner",email:"mora@example.com",createdAt:"2026-10-17T00:00:00.000Z"}]}}));
  await page.goto("/");
  await page.getByRole("button", { name: /Members/ }).click();
  await page.getByRole("button", { name: /Mora Learner/ }).click();
  await expect(page.getByRole("heading", { name: "Mora Learner" })).toBeVisible();
  await expect(page.getByText("mora@example.com")).toBeVisible();
});

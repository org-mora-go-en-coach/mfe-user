import { expect, test } from "@playwright/test";

test("1. 프로필을 생성하고 마이페이지를 표시한다", async ({ page }) => {
  await page.route("**/api/v1.0.1/users", async route => {
    if (route.request().method() === "POST") return route.fulfill({status:201,json:{user:{id:"user-1",name:"Mora Learner",email:"mora@example.com",createdAt:"2026-10-17T00:00:00.000Z"}}});
    return route.fulfill({json:{users:[]}});
  });
  await page.goto("/");
  await page.getByLabel("이름").fill("Mora Learner");
  await page.getByLabel("이메일").fill("mora@example.com");
  await page.getByRole("button", { name: "내 프로필 만들기" }).click();
  await expect(page.getByRole("heading", { name: "Mora Learner" })).toBeVisible();
  await expect(page.getByText("환영합니다! 학습 프로필이 준비되었습니다.")).toBeVisible();
});

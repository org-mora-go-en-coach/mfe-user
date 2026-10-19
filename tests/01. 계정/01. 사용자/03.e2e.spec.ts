import { expect, test } from "@playwright/test";

test("3. 선택한 회원을 탈퇴한다", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("mora-go:selected-user", "user-1");
  });
  await page.route("**/api/v1.0.1/users", (route) =>
    route.fulfill({
      json: {
        users: [
          {
            id: "user-1",
            name: "Mora Learner",
            email: "mora@example.com",
            createdAt: "2026-10-17T00:00:00.000Z",
          },
        ],
      },
    }),
  );
  await page.route("**/api/v1.0.1/users/user-1", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
  await page.getByRole("button", { name: "계정 삭제" }).click();
  await expect(page.getByText("계정이 삭제되었습니다.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "내 프로필 만들기" }),
  ).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('has title and start course button', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Skudo/i);

    // Check for the main heading
    await expect(page.locator('text=Video Course Tracker')).toBeVisible();

    // Check for the input and button
    await expect(page.locator('input[placeholder*="Paste YouTube Playlist URL"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Learning/i })).toBeVisible();
});

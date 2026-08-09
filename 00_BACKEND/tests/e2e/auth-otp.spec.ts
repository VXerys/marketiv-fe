import { test, expect } from '@playwright/test';

const baseURL = process.env.AUTH_E2E_BASE_URL ?? 'http://127.0.0.1:3000';
const runLive = process.env.AUTH_E2E_RUN_LIVE === 'true';

const registerEmail = process.env.AUTH_E2E_REGISTER_EMAIL;
const registerPassword = process.env.AUTH_E2E_REGISTER_PASSWORD ?? 'MarketivTest123!';
const registerOtp = process.env.AUTH_E2E_REGISTER_OTP;

const resetEmail = process.env.AUTH_E2E_RESET_EMAIL;
const resetPassword = process.env.AUTH_E2E_RESET_PASSWORD ?? 'MarketivReset123!';
const resetOtp = process.env.AUTH_E2E_RESET_OTP;

test.describe('Auth OTP register flow', () => {
  test.skip(!runLive || !registerEmail || !registerOtp, 'Needs live Appwrite email OTP env.');

  test('registers UMKM, verifies email OTP, and reaches onboarding', async ({ page }) => {
    await page.goto(`${baseURL}/register?role=umkm`);
    await page.getByLabel('Nama Usaha').fill('E2E Marketiv UMKM');
    await page.getByLabel('Kategori Usaha').selectOption({ index: 1 });
    await page.getByLabel('Email').fill(registerEmail!);
    await page.getByLabel('Nomor WhatsApp').fill('081234567890');
    await page.getByLabel('Password').fill(registerPassword);
    await page.getByRole('button', { name: /Buat Akun UMKM/i }).click();

    await expect(page.getByText(/Kode OTP terkirim/i)).toBeVisible();
    await page.getByLabel(/Kode Verifikasi 6 Digit/i).fill(registerOtp!);

    await expect(page).toHaveURL(/\/onboarding/);
  });
});

test.describe('Auth OTP reset flow', () => {
  test.skip(!runLive || !resetEmail || !resetOtp, 'Needs live Appwrite reset OTP env.');

  test('resets password with email OTP and allows login with the new password', async ({ page }) => {
    await page.goto(`${baseURL}/forgot-password`);
    await page.getByLabel('Email').fill(resetEmail!);
    await page.getByRole('button', { name: /Kirim Kode OTP Reset/i }).click();

    await expect(page.getByText(/Kode OTP/i)).toBeVisible();
    await page.getByRole('link', { name: /Masukkan Kode OTP/i }).click();
    await page.getByLabel('Email Akun').fill(resetEmail!);
    await page.getByLabel(/Kode OTP 6 Digit/i).fill(resetOtp!);
    await page.getByLabel('Password Baru').fill(resetPassword);
    await page.getByLabel('Ulangi Password Baru').fill(resetPassword);
    await page.getByRole('button', { name: /Simpan password baru/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel('Email').fill(resetEmail!);
    await page.getByLabel('Password').fill(resetPassword);
    await page.getByRole('button', { name: /Masuk/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });
});

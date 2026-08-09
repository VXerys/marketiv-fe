# 📐 DESIGN & ARCHITECTURE: FORGOT PASSWORD OTP CONTRACT FIX

---

## 1. SEQUENCE DIAGRAM (FIXED OTP RESET CONTRACT)

```
[ User Input Email ]
         │
(Click "Kirim Kode OTP Reset")
         │
         ▼
[ requestPasswordRecovery({ email }) ] ──► [ Function: request-password-otp ]
         │                                            │
         │                                (Always returns success: true,
         │                                 no userId returned to client)
         ▼                                            │
[ UI: Cek Email / Input OTP 6-Digit ] ◄───────────────┘
         │
(Click "Simpan Password Baru")
         │
         ▼
[ completePasswordRecoveryWithOtp({ email, otpCode, password }) ]
         │
         ▼
[ Function: resetPasswordWithOtp ] ──► (Server-side lookup userId via email)
         │
         ▼
[ await logoutSession() ] ──► (Invalidate browser session)
         │
         ▼
[ Navigate to /login ]
```

---

## 2. API CONTRACT COMPARISON

### Before Fix:
```typescript
requestPasswordRecovery(input: ForgotPasswordInput): ServiceResult<{ userId: string | null }>;
completePasswordRecoveryWithOtp(args: { userId: string; otpCode: string; ... }): ServiceResult<null>;
```

### After Fix (SECURE):
```typescript
requestPasswordRecovery(input: ForgotPasswordInput): ServiceResult<null>;
completePasswordRecoveryWithOtp(args: { email: string; otpCode: string; ... }): ServiceResult<null>;
```

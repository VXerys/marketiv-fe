# 📐 DESIGN & ARCHITECTURE: AUTH OTP SESSION HANDOFF BUGFIX (BUGFIX #2)

---

## 1. SEQUENCE DIAGRAM (FIXED HANDOFF FLOW)

```
[ User Input OTP 6-Digit ]
           │
  (Click "Verifikasi Email")
           │
           ▼
[ EmailVerificationPending ] ── (verifyingRef = true) ──► [ confirmEmailOtp ]
           │                                                      │
           │                                            Appwrite deleteSession &
           │                                            createSession(userId, secret)
           │                                                      │
           ▼                                                      ▼
    [ onContinue() ] ◄─────────────────────────── [ Return Success ]
           │
    await refresh()
           │
   (Check sessionRes)
    ├── success: true  ──► RedirectIfAuthenticated ──► /onboarding
    └── success: false ──► Show error banner (No redirect)
```

---

## 2. SYNCHRONOUS REF LOCK (MUTEX PATTERN)

```typescript
const verifyingRef = useRef(false);

const submitOtp = useCallback(async (otpCode: string) => {
  if (otpCode.length !== 6 || verifyingRef.current) return;

  verifyingRef.current = true;
  setVerifying(true);

  try {
    const res = await confirmEmailOtp({ userId, email, password, code: otpCode });
    if (res.success) {
      onContinue();
    } else {
      setVerifyError(res.error);
    }
  } finally {
    verifyingRef.current = false;
    setVerifying(false);
  }
}, [...]);
```

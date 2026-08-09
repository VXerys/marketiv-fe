# 🎨 DESIGN SPECIFICATION: AUTHENTICATION & OTP SYSTEM

> **Arsitektur & Data Flow Sistem Otentikasi berbasis OTP (Email Token & Reset Password)**  
> **Modul**: Marketiv Auth Service  
> **Target Role**: Frontend Lead & Backend Engineer

---

## 1. ARCHITECTURE & DATA FLOW

### 1.1 Flow Verifikasi Email OTP saat Register

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant FE as Next.js Client (UI)
    participant AuthSvc as auth.service.ts
    participant Appwrite as Appwrite Auth SDK
    participant DB as Appwrite Database

    User->>FE: Isi Form Register & Submit
    FE->>AuthSvc: registerUser(email, password, name)
    AuthSvc->>Appwrite: account.create() + createEmailPasswordSession()
    Appwrite-->>AuthSvc: Return User Account & Session
    AuthSvc->>Appwrite: account.createEmailToken(userId, email)
    Appwrite-->>User: Kirim Kode OTP 6-Digit via Email
    FE->>User: Tampilkan Screen EmailVerificationPending (InputOTP + Timer 60s)
    
    User->>FE: Input 6-Digit OTP & Submit
    FE->>AuthSvc: confirmEmailOtp(userId, email, code)
    AuthSvc->>Appwrite: account.createSession(userId, secret: code)
    
    alt OTP Valid
        Appwrite-->>AuthSvc: Session Verified
        AuthSvc->>DB: Trigger Event emailVerification -> update email_verified_at
        AuthSvc-->>FE: Return Success
        FE->>User: Auto-redirect ke Dashboard / Onboarding
    else OTP Invalid / Expired
        Appwrite-->>AuthSvc: Error (401 Invalid Token)
        AuthSvc-->>FE: Return Error Message (Sesi login tetap aman)
        FE->>User: Tampilkan Error Banner + Izinkan Try Again / Resend OTP
    end
```

---

### 1.2 Flow Lupa & Reset Password via Kode OTP 6-Digit

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant FE as Next.js Client (UI)
    participant Func as Appwrite Function / Server Action
    participant Appwrite as Appwrite Server SDK
    participant UserDB as Database (users collection)

    User->>FE: Masukkan Email di /forgot-password
    FE->>Func: requestPasswordResetOtp(email)
    Func->>Func: Check Rate Limit (Max 3 req / 10 min)
    Func->>Appwrite: Generate 6-Digit OTP & Store Hashed Token
    Appwrite-->>User: Kirim OTP 6-Digit ke Email
    FE->>User: Redirect ke /reset-password (Input Email + OTP + Password Baru)

    User->>FE: Input Kode OTP + Password Baru & Submit
    FE->>Func: resetPasswordWithOtp(email, otpCode, newPassword)
    Func->>Func: Verify OTP Code & Expiration (15 mins)
    
    alt OTP Match & Valid
        Func->>Appwrite: users.updatePassword(userId, newPassword)
        Func-->>FE: Return Success (Password Updated)
        FE->>User: Show Success Toast -> Redirect ke /login
    else OTP Invalid / Expired
        Func-->>FE: Return Error (Kode Salah / Kedaluwarsa)
        FE->>User: Display Error Banner
    end
```

---

## 2. COMPONENT & FUNCTION SPECIFICATIONS

### 2.1 Component: `EmailVerificationPending.tsx` (Refactored)

- **Input Control**: Ganti `<input type="text">` dengan `<InputOTP maxLength={6}>` yang memuat 6 `<InputOTPSlot>`.
- **State Management**:
  - `otpValue`: string (6 digit).
  - `countdown`: number (60 detik cooldown untuk resend).
  - `isResendDisabled`: boolean (`countdown > 0`).
  - `isSubmitting`: boolean (loading indicator pada tombol verifikasi).
- **Auto-Submit**: Ketika `otpValue.length === 6`, pemicu handler verifikasi berjalan otomatis tanpa mengharuskan pengguna menekan enter.

### 2.2 Component: `InputOTP` (`src/components/ui/input-otp.tsx`)

- **Slots**:
  - Slot 1 - 3: Blok pertama 3 digit.
  - Separator: Tanda hubung `-` di tengah.
  - Slot 4 - 6: Blok kedua 3 digit.
- **Visual Styles**: Border `border-neutral-200`, active state `border-orange-500 ring-2 ring-orange-500/20`, rounded-xl.

### 2.3 Service Function: `confirmEmailOtp` (`auth.service.ts`)

```typescript
export async function confirmEmailOtp(args: {
  userId: string;
  email: string;
  code: string;
}): Promise<ServiceResult<null>> {
  // Sesi pengguna TIDAK dihapus secara destruktif sebelum verifikasi.
  // Panggil createSession dengan OTP token.
}
```

---

## 3. SECURITY & PERFORMANCE CONSIDERATIONS

1. **OTP Token Lifespan**: Ditetapkan tepat **15 menit** sejak diterbitkan.
2. **Rate Limiting**: Maksimal 3 kali request OTP per 10 menit per IP / Email address untuk mencegah email flooding & SMS API abuse.
3. **No Sensitive Leaks**: Kode OTP mentah *TIDAK BOLEH* dikembalikan dalam HTTP Response payload client maupun tercatat di `console.log` browser.
4. **Session Protection**: Kegagalan verifikasi OTP *TIDAK BOLEH* membatalkan sesi login dasar pengguna jika pengguna sudah berhasil melakukan autentikasi password.

# Skill: marketiv-cloud-functions

Panduan lengkap untuk mengembangkan dan mendebug Appwrite Cloud Functions di proyek Marketiv. Baca skill ini sebelum membuat, memodifikasi, atau mendebug function apapun.

---

## Struktur Folder

```
00_BACKEND/functions/
└── <nama-function>/
    ├── package.json
    └── src/
        └── main.js     ← Entry point, satu-satunya file logic
```

---

## Signature Function

Semua function mengikuti pola yang sama:

```javascript
import { Client, Databases, ID, Query, Permission, Role } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  // req.body      — string JSON body (parse manual)
  // req.headers   — object headers
  // req.method    — "GET", "POST", dll
  // req.path      — path setelah function URL
  // log("pesan")  — tulis ke function logs (debug)
  // error("msg")  — tulis ke error logs

  try {
    const body = JSON.parse(req.body || '{}');
    // logic...
    return res.json({ success: true, data: {} });
  } catch (err) {
    error(err.message);
    return res.json({ success: false, error: err.message }, 500);
  }
};
```

---

## Appwrite SDK di Functions (Server-side)

Gunakan `node-appwrite` (bukan `appwrite`) dengan API Key:

```javascript
import { Client, Databases, ID, Query, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // Server API key — bypass RLS

const databases = new Databases(client);
```

**Penting:** Functions menggunakan `APPWRITE_API_KEY` (server key), bukan publishable key. Ini memungkinkan functions melewati RLS permissions.

---

## Environment Variables

| Variable | Source | Keterangan |
|---|---|---|
| `APPWRITE_FUNCTION_API_ENDPOINT` | Auto (Appwrite) | Endpoint project |
| `APPWRITE_FUNCTION_PROJECT_ID` | Auto (Appwrite) | Project ID |
| `APPWRITE_API_KEY` | Set manual di Appwrite Console | Server key |
| `MIDTRANS_SERVER_KEY` | Set manual | Midtrans server key |
| `MIDTRANS_IS_PRODUCTION` | Set manual | `"true"` atau `"false"` |
| `DATABASE_ID` | Set manual | `6a4c8598001da3b0d7f0` |

---

## Daftar 17 Functions

### Event-Triggered (Database Events)

| Function | Trigger Event | Fungsi |
|---|---|---|
| `create-user-profile` | `databases.*.collections.users.documents.*.create` | Buat umkmProfile/creatorProfile + wallet saat user baru |
| `create-user-wallet` | Dipanggil dari create-user-profile | Buat wallet record untuk user baru |
| `campaign-claimed` | `databases.*.collections.campaign_claims.documents.*.create` | Proses logic saat kreator claim campaign |
| `campaign-published` | `databases.*.collections.campaigns.documents.*.update` (status=active) | Logic saat UMKM publish campaign |
| `send-chat-notification` | `databases.*.collections.messages.documents.*.create` | Kirim notifikasi ke penerima pesan baru |

### CRON Jobs

| Function | Schedule | Fungsi |
|---|---|---|
| `expire-stale-claims` | `0 0 * * *` (daily midnight) | Expire claims yang melebihi `submissionDays` |

### HTTP Functions (dipanggil dari client/service)

| Function | Method | Fungsi |
|---|---|---|
| `create-payment` | POST | Buat transaksi Midtrans + snap token |
| `create-order` | POST | Buat order dari offer yang diterima |
| `create-escrow` | POST | Buat escrow record untuk order |
| `release-escrow` | POST | Release dana dari escrow ke wallet kreator |
| `validate-and-upload` | POST | Validasi tipe/ukuran file + upload ke Storage |
| `delete-file` | POST | Soft-delete file dari Storage + userFiles |
| `upload-chat-attachment` | POST | Validasi + simpan attachment pesan chat |
| `calculate-campaign-reward` | POST | Hitung PPV reward berdasarkan views |
| `ai-brief` | POST | Generate AI brief untuk campaign (OpenAI) |
| `ai-fraud-precheck` | POST | Cek fraud konten sebelum diapprove |
| `midtrans-webhook` | POST | Terima callback status pembayaran dari Midtrans |

---

## Pola HTTP Function Lengkap

```javascript
// create-order/src/main.js
import { Client, Databases, ID, Query, Permission, Role } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const DATABASE_ID = process.env.DATABASE_ID || '6a4c8598001da3b0d7f0';

  try {
    const { offerId, userId } = JSON.parse(req.body || '{}');

    if (!offerId || !userId) {
      return res.json({ success: false, error: 'offerId dan userId wajib' }, 400);
    }

    // Ambil offer
    const offer = await databases.getDocument(DATABASE_ID, 'offers', offerId);

    if (offer.status !== 'accepted') {
      return res.json({ success: false, error: 'Offer belum accepted' }, 400);
    }

    // Buat order
    const order = await databases.createDocument(
      DATABASE_ID, 'orders', ID.unique(),
      {
        offerId,
        creatorId: offer.creatorId,
        umkmId: offer.umkmId,
        packageId: offer.packageId,
        amount: offer.price,
        status: 'pending_payment',
      },
      [
        Permission.read(Role.user(offer.creatorId)),
        Permission.read(Role.user(offer.umkmId)),
      ]
    );

    log(`Order created: ${order.$id}`);
    return res.json({ success: true, data: { orderId: order.$id } });
  } catch (err) {
    error(err.message);
    return res.json({ success: false, error: 'Gagal membuat order' }, 500);
  }
};
```

---

## Pola Event Function Lengkap

```javascript
// send-chat-notification/src/main.js
export default async ({ req, res, log, error }) => {
  // Event payload ada di req.body untuk database events
  const event = JSON.parse(req.body || '{}');

  // Appwrite event body berisi document yang di-trigger
  const message = event; // document yang baru dibuat

  log(`New message in conversation: ${message.conversationId}`);

  // ... kirim notifikasi ke penerima
};
```

---

## Pola Midtrans Integration

```javascript
// create-payment/src/main.js
const midtransUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64');

const response = await fetch(midtransUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    transaction_details: { order_id: paymentId, gross_amount: amount },
    customer_details: { /* ... */ },
  }),
});

const { token, redirect_url } = await response.json();
```

---

## package.json Template

```json
{
  "name": "<nama-function>",
  "version": "1.0.0",
  "type": "module",
  "main": "src/main.js",
  "dependencies": {
    "node-appwrite": "^14.0.0"
  }
}
```

---

## Checklist Deploy Function Baru

1. Buat folder `00_BACKEND/functions/<nama>/`
2. Buat `package.json` dengan `"type": "module"`
3. Buat `src/main.js` dengan signature standard
4. Set environment variables di Appwrite Console
5. Daftarkan ke `appwrite.json` jika function event-triggered
6. Test dengan Appwrite Console → Execute function
7. Cek logs di Appwrite Console → Functions → Logs

---

## Debugging

```javascript
// Di dalam function, gunakan log() dan error():
log(`Processing order: ${orderId}`);           // untuk debugging
error(`Validation failed: ${err.message}`);    // untuk errors

// Jangan gunakan console.log — tidak muncul di Appwrite logs
```

**Cek logs:** Appwrite Console → Functions → pilih function → Executions tab

**Via MCP tool:** Gunakan `get_logs` dengan filter function_id untuk melihat logs real-time.

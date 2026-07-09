Prioritas Baca

1. Project Scope & Rules

- Baca dulu docs/00_Project/20_Scope.md
- Lalu docs/00_Project/40_Tech_Stack.md
- Lalu docs/00_Project/50_Project_Rules.md
- Tujuannya: validasi apakah fitur yang didokumentasikan memang masuk MVP, teknologi yang dipilih benar, dan aturan arsitektur dasarnya konsisten.

2. Domain Model

- Baca docs/02_Modules/10_Domain_Model.md
- Ini penting sebelum masuk modul, karena Anda perlu tahu relasi besar antar domain: user, campaign, order, payment, wallet, notification, dan sebagainya.
- Kalau domain model tidak masuk akal, dokumen modul di bawahnya kemungkinan ikut bermasalah.

3. Workflow End-to-End

- Baca semua file di docs/03_Workflows/ dengan prioritas:
- 10_Registration.md
- 30_RateCard_Order.md
- 20_Campaign_PPV.md
- 50_Withdrawal.md
- 60_Dispute.md
- 40_Submission_Fraud.md
- Ini bagian paling penting untuk kebutuhan Anda, karena Anda ingin validasi flow sistem, bukan hanya daftar fitur.

4. Architecture Decisions

- Baca docs/04_Decisions/00_Index.md, lalu ADR yang relevan:
- ADR-001.md untuk alasan pakai Appwrite
- ADR-002.md untuk service layer
- ADR-003.md untuk order sebagai aggregate utama Rate Card
- ADR-004.md untuk fraud check
- ADR-005.md untuk denormalized counter
- ADR ini harus menjawab “kenapa desain teknisnya seperti ini”.

5. Global Technical Standards

- Baca:
- docs/01_Global/30_Naming_Convention.md
- docs/01_Global/40_Folder_Structure.md
- docs/01_Global/50_Security_Guidelines.md
- docs/01_Global/60_Error_Handling.md
- docs/01_Global/70_Testing_Strategy.md
- Ini untuk validasi apakah dokumentasi teknis punya standar implementasi yang cukup jelas.

6. Module Index Saja

- Setelah flow besar jelas, baru baca 00_Index.md tiap modul di docs/02_Modules/.
- Jangan langsung baca semua file modul.
- Tujuannya hanya memastikan ownership tiap modul jelas: siapa punya database, siapa punya API, siapa memicu event, siapa menerima event.

7. Detail Modul Berdasarkan Workflow

- Untuk setiap workflow, baca hanya modul yang terlibat.
- Contoh Registration:
- Authentication/10_Overview.md
- Authentication/40_User_Flow.md
- Authentication/60_API.md
- Authentication/70_Backend.md
- Authentication/90_Events.md
- Users/50_Database.md
- Payments/50_Database.md
- Notifications/90_Events.md
  Cara Validasi
  Gunakan checklist ini saat membaca:
- Ownership jelas? Satu data hanya dimiliki satu modul.
- Flow masuk akal? Urutan aksi user, backend, database, event, dan notification tidak lompat.
- Database cocok dengan flow? Setiap data yang dibuat/dibaca di flow punya collection pemilik.
- API cocok dengan frontend/backend? Endpoint/service yang disebut di flow tersedia di dokumen API.
- Event jelas? Ada trigger, producer, consumer, payload, dan efek samping.
- Permission aman? Role UMKM, Creator, Admin punya hak akses yang benar.
- Tidak ada duplikasi knowledge? Fakta yang sama tidak ditulis beda di dua tempat.
- ADR mendukung desain? Keputusan teknis besar punya alasan, bukan hanya hasil AI.
  Urutan Praktis Yang Saya Sarankan

1.  00_Project/20_Scope.md
2.  00_Project/40_Tech_Stack.md
3.  02_Modules/10_Domain_Model.md
4.  03_Workflows/00_Index.md
5.  Semua workflow di 03_Workflows/
6.  04_Decisions/00_Index.md
7.  ADR relevan
8.  01_Global/50_Security_Guidelines.md
9.  01_Global/40_Folder_Structure.md
10. 02_Modules/00_Index.md
11. Detail modul hanya berdasarkan workflow yang sedang divalidasi

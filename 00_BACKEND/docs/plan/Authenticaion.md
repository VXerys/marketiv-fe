# Register UMKM
/register?role=umkm 
- nama usaha
- kategori usaha
- email 
- nomor hp
- password 

# Register Creator
/register?role=creator
- nama lengkap
- email 
- password 
bisa oauth googleregister/login

# Login UKM/Creator 
/login dengan query (?role=umkm atau ?role=creator)
- email 
- password 
bisa login dengan oauth google tetapi khusus untuk creator saja, umkm tidak bisa harus secara manual

# Lupa Password 
/forgot-password
- email 
- button kirim link reset password

# Verifikasi Email setelah Daftar UMKM/Creator 
/ (belum tahu endpointnya)
- Button check inbox (bahwa pesan email telah terkirim dengan batas link verfikasinya itu hanya 10 menit saja berlakunya)
- Teks kecil dengan tulisan kirim ulang link 

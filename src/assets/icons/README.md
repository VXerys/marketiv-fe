# Icons Directory

Directori ini digunakan untuk menyimpan file ikon dalam format SVG mentah.

### Rekomendasi:
Untuk fleksibilitas maksimal (mengubah warna/ukuran via props), sebaiknya transform SVG menjadi komponen React di folder `src/components/icons`.
Namun, jika Anda ingin menggunakan SVG sebagai file gambar statis, simpan di sini.

### Cara Penggunaan (Sebagai File):
```tsx
import arrowIcon from '@/assets/icons/arrow.svg'
import Image from 'next/image'

<Image src={arrowIcon} alt="Arrow" width={24} height={24} />
```

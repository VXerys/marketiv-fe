# Images Directory

Directori ini digunakan untuk menyimpan file gambar raster (PNG, JPG, WebP) atau SVG statis yang akan di-import ke dalam komponen React.

### Cara Penggunaan:
1. Simpan gambar di folder ini.
2. Import di komponen:
   ```tsx
   import myImage from '@/assets/images/example.png'
   import Image from 'next/image'
   
   <Image src={myImage} alt="Example" />
   ```

import { convert } from "@opendataloader/pdf";

// Jalankan dari folder ini (referensi/) — hasil masuk ke ../review/output/
// await convert(["syarat-dan-ketentuan-marketiv-v3-1.pdf"], {
//   outputDir: "../review/output/",
//   format: "json,html,pdf,markdown",
// });
await convert(["midtrans-tnc-template-13-jan-2017-1.pdf"], {
  outputDir: "../review/output/",
  format: "json,html,pdf,markdown",
});

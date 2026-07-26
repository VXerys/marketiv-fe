import { convert } from "@opendataloader/pdf";

// await convert(["syarat-dan-ketentuan-marketiv-v3-1.pdf"], {
//   outputDir: "output/",
//   format: "json,html,pdf,markdown",
// });
await convert(["midtrans-tnc-template-13-jan-2017-1.pdf"], {
  outputDir: "review-sechan/",
  format: "json,html,pdf,markdown",
});

export default async ({ res, log }) => {
  log("Function ai-fraud-precheck triggered.");
  return res.json({ success: true, message: "Fraud check placeholder" });
};

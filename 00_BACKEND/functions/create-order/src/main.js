module.exports = async ({ req, res, log, error }) => {
  log("Function create-order triggered.");
  return res.json({ success: true, message: "Order creation placeholder" });
};

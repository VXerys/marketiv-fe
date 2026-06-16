module.exports = async ({ req, res, log, error }) => {
  log("Function campaign-published triggered.");
  return res.json({ success: true, message: "Campaign published placeholder" });
};

const { ensureUser, getUserToken, APP_KEY } = require("../utils/agoraChat");

// POST /lawapi/common/agora-chat/token
// body: { username } — we will namespace by role if needed
async function issueChatToken(req, res) {
  try {
    const { username } = req.body || {};
    if (!username) return res.status(400).json({ error: true, message: "username is required" });

    // Ensure user exists in Agora Chat app, then mint user token
    await ensureUser(username);
    const tokenResp = await getUserToken(username);

    return res.status(200).json({
      success: true,
      appKey: APP_KEY,
      accessToken: tokenResp?.access_token,
      expireAt: tokenResp?.expire_timestamp,
      username,
    });
  } catch (err) {
    console.error("issueChatToken error:", err?.response?.data || err.message);
    return res.status(500).json({ error: true, message: "Failed to issue chat token" });
  }
}

module.exports = { issueChatToken };



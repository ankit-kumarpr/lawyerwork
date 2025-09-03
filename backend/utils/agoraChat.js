const axios = require("axios");

// AGORA CHAT (NOT RTC) – helper utilities
// Expects env:
// - AGORA_CHAT_APP_KEY in the form "org#app"
// - AGORA_CHAT_CLIENT_ID
// - AGORA_CHAT_CLIENT_SECRET

const APP_KEY = process.env.AGORA_CHAT_APP_KEY || "your_org#your_app";
const CLIENT_ID = process.env.AGORA_CHAT_CLIENT_ID || "your_client_id";
const CLIENT_SECRET = process.env.AGORA_CHAT_CLIENT_SECRET || "your_client_secret";

function parseAppKey(appKey) {
  const [org, app] = String(appKey).split("#");
  if (!org || !app) throw new Error("Invalid AGORA_CHAT_APP_KEY");
  return { org, app };
}

function baseUrl() {
  const { org, app } = parseAppKey(APP_KEY);
  return `https://a1.easemob.com/${org}/${app}`;
}

async function getAppToken() {
  const url = `${baseUrl()}/token`;
  const res = await axios.post(url, {
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });
  return res.data; // { access_token, expires_in, ... }
}

async function ensureUser(username, password = "default_password_123") {
  const admin = await getAppToken();
  // Try to create user; if exists, ignore
  try {
    const url = `${baseUrl()}/users`;
    await axios.post(
      url,
      { username, password },
      { headers: { Authorization: `Bearer ${admin.access_token}` } }
    );
  } catch (e) {
    if (!(e?.response?.status === 400 || e?.response?.status === 409)) {
      throw e;
    }
  }
  return { username, password };
}

async function getUserToken(username, ttl = 24 * 60 * 60) {
  const admin = await getAppToken();
  const url = `${baseUrl()}/users/${encodeURIComponent(username)}/token`;
  const res = await axios.post(
    url,
    { ttl },
    { headers: { Authorization: `Bearer ${admin.access_token}` } }
  );
  return res.data; // { access_token, expire_timestamp }
}

module.exports = { APP_KEY, ensureUser, getUserToken };



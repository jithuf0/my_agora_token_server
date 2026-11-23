
// api/token.js

module.exports = async (req, res) => {

  // CORS configuration
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://jithufrancis.app'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  res.setHeader('Vary', 'Origin');

  // Handle browser preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { channelName, uid, isPublisher } = req.body || {};

    if (!channelName || uid === undefined) {
      return res.status(400).json({
        error: 'Missing channelName or uid'
      });
    }

    const { RtcTokenBuilder, RtcRole } =
      require('agora-access-token');

    const AGORA_APP_ID = process.env.AGORA_APP_ID;
    const AGORA_APP_CERTIFICATE =
      process.env.AGORA_APP_CERTIFICATE;

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      return res.status(500).json({
        error: 'Missing Agora credentials'
      });
    }

    const numericUid = Number(uid);

    if (!Number.isSafeInteger(numericUid) || numericUid < 0) {
      return res.status(400).json({
        error: 'Invalid uid'
      });
    }

    const expirationInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs =
      currentTimestamp + expirationInSeconds;

    const role = isPublisher
      ? RtcRole.PUBLISHER
      : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      numericUid,
      role,
      privilegeExpiredTs
    );

    return res.status(200).json({ token });

  } catch (error) {
    console.error('Agora token error:', error);

    return res.status(500).json({
      error: 'Token generation failed'
    });
  }
};

const crypto = require('crypto');

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

const Role = {
  PUBLISHER: 1,
  SUBSCRIBER: 2
};

function buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs) {
  const tokenVersion = "006";

  const tokenContent = {
    appID: appId,
    appCertificate: appCertificate,
    channelName: channelName,
    uid: parseInt(uid),
    privilegeExpiredTs
  };

  const content = JSON.stringify(tokenContent);
  const sign = crypto.createHmac('sha256', appCertificate)
    .update(`${appId}${channelName}${uid}${privilegeExpiredTs}`)
    .digest('hex');

  return `${tokenVersion}${content}${sign}`;
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { channelName, uid, isPublisher } = req.body;

  if (!channelName || !uid) {
    return res.status(400).json({ error: 'Missing channelName or uid' });
  }

  const numericUid = parseInt(uid, 10);
  if (isNaN(numericUid)) {
    return res.status(400).json({ error: 'Invalid UID format' });
  }

  const expirationInSeconds = 86400;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationInSeconds;
  const role = isPublisher ? Role.PUBLISHER : Role.SUBSCRIBER;

  const token = buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    numericUid,
    role,
    privilegeExpiredTs
  );

  res.status(200).json({
    token,
    uid: numericUid,
    expiresAt: privilegeExpiredTs
  });
}

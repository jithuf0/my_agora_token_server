const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// Enable CORS for all responses
const enableCors = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
};

module.exports = async (req, res) => {
  // Enable CORS
  enableCors(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { channelName, uid, isPublisher } = req.body;
    
    // Validate inputs
    if (!channelName || uid === undefined || uid === null) {
      return res.status(400).json({ error: 'Missing channelName or uid' });
    }

    // Get Agora credentials from environment variables
    const AGORA_APP_ID = process.env.AGORA_APP_ID;
    const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      console.error('Missing Agora credentials in environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Convert UID to number
    const numericUid = parseInt(uid, 10);
    if (isNaN(numericUid)) {
      return res.status(400).json({ error: 'Invalid UID format' });
    }

    // Set token expiration (24 hours)
    const expirationInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationInSeconds;

    // Generate token based on role
    const role = isPublisher ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      numericUid,
      role,
      privilegeExpiredTs
    );

    console.log(`✅ Token generated: Channel=${channelName}, UID=${numericUid}, Role=${isPublisher ? 'PUBLISHER' : 'SUBSCRIBER'}`);
    
    res.json({ 
      token,
      uid: numericUid,
      expiresAt: privilegeExpiredTs,
      role: isPublisher ? 'publisher' : 'subscriber'
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message
    });
  }
};

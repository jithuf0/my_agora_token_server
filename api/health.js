
// api/health.js

module.exports = async (req, res) => {

  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://jithufrancis.app'
  );

  res.setHeader('Vary', 'Origin');

  return res.status(200).json({
    status: 'ok',
    timestamp: Date.now()
  });
};

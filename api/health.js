module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'ok',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  });
};

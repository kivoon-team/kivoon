const { getGreenhouseJobs } = require('../greenhouse.cjs');

module.exports = async function handler(_request, response) {
  const sources = await getGreenhouseJobs();
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.status(200).json({ sources, fetchedAt: new Date().toISOString() });
};
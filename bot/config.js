require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

module.exports = {
  DISCORD_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
  CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
  API_PORT: process.env.API_PORT || 3001,
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
};
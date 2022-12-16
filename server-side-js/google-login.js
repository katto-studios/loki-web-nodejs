const { OAuth2Client } = require('google-auth-library');
const clientId = process.env.CLIENT_ID;
const client = new OAuth2Client(clientId);

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId
  });
  return ticket.getPayload();
}

module.exports = { verify }

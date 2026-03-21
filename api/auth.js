const { AuthorizationCode } = require('simple-oauth2');
const crypto = require('crypto');

module.exports = (req, res) => {
  const client = new AuthorizationCode({
    client: { id: process.env.OAUTH_CLIENT_ID, secret: process.env.OAUTH_CLIENT_SECRET },
    auth: {
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
      authorizePath: '/login/oauth/authorize'
    }
  });

  const authorizationUri = client.authorizeURL({
    redirect_uri: `https://${req.headers.host}/api/callback`,
    scope: 'repo,user',
    state: crypto.randomBytes(16).toString('hex')
  });

  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.redirect(authorizationUri);
};
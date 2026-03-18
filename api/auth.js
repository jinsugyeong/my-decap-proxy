// auth.js
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

  // state를 쿼리에서 받아서 그대로 넘겨줌
  const state = req.query.state || crypto.randomBytes(16).toString('hex');

  const authorizationUri = client.authorizeURL({
    redirect_uri: `https://${req.headers.host}/api/callback`,
    scope: 'repo,user',
    state: state  // ← Decap이 보낸 state 그대로 사용
  });

  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.redirect(authorizationUri);
};
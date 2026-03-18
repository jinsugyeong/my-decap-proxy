const { AuthorizationCode } = require('simple-oauth2');
module.exports = (req, res) => {
  const client = new AuthorizationCode({
    client: { id: process.env.OAUTH_CLIENT_ID, secret: process.env.OAUTH_CLIENT_SECRET },
    auth: { tokenHost: 'https://github.com', tokenPath: '/login/oauth/access_token', authorizePath: '/login/oauth/authorize' }
  });
  const authorizationUri = client.authorizeURL({
    redirect_uri: `https://${req.headers.host}/api/callback`,
    scope: 'repo,user',
    state: 'random_string'
  });
  res.redirect(authorizationUri);
};

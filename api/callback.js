const { AuthorizationCode } = require('simple-oauth2');
module.exports = async (req, res) => {
  const client = new AuthorizationCode({
    client: { id: process.env.OAUTH_CLIENT_ID, secret: process.env.OAUTH_CLIENT_SECRET },
    auth: { tokenHost: 'https://github.com', tokenPath: '/login/oauth/access_token', authorizePath: '/login/oauth/authorize' }
  });
  try {
    const accessToken = await client.getToken({
      code: req.query.code,
      redirect_uri: `https://${req.headers.host}/api/callback`
    });
    const token = accessToken.token.access_token;
    res.send(`
      <script>
        const receiveMessage = (message) => {
          window.opener.postMessage('authorization:github:success:{"token":"${token}","provider":"github"}', message.origin);
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      </script>
    `);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

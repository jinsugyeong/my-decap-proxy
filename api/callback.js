const { AuthorizationCode } = require('simple-oauth2');

module.exports = async (req, res) => {
  const client = new AuthorizationCode({
    client: { id: process.env.OAUTH_CLIENT_ID, secret: process.env.OAUTH_CLIENT_SECRET },
    auth: {
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
      authorizePath: '/login/oauth/authorize'
    }
  });

  try {
    const accessToken = await client.getToken({
      code: req.query.code,
      redirect_uri: `https://${req.headers.host}/api/callback`
    });

    const token = accessToken.token.access_token || accessToken.token.token?.access_token;
    const message = `authorization:github:success:{"token":"${token}","provider":"github"}`;

    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.send(`
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage(${JSON.stringify(message)}, '*');
          }
          setTimeout(function() { window.close(); }, 300);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Authentication Error: " + error.message);
  }
};
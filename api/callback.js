// callback.js
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
    console.log('token object:', JSON.stringify(accessToken.token));

    const token = accessToken.token.access_token || accessToken.token.token?.access_token;
    const message = `authorization:github:success:{"token":"${token}","provider":"github"}`;

    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.send(`
      <!DOCTYPE html>
      <html>
      <body>
        <script>
          (function() {
            var message = ${JSON.stringify(message)};
            console.log('opener:', window.opener);
            console.log('message:', message);
            
            function receiveMessage(e) {
              console.log('부모로부터 받음:', e.data, e.origin);
              window.opener.postMessage(message, e.origin);
              window.removeEventListener('message', receiveMessage);
              setTimeout(function() { window.close(); }, 500);
            }
            
            window.addEventListener('message', receiveMessage);
            window.opener.postMessage('authorizing:github', '*');
            //authorizing:github를 부모에게 보내고, 부모가 응답하면 origin으로 토큰 보내기
          })();
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Authentication Error: " + error.message);
  }
};
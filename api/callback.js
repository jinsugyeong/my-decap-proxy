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
            if (window.opener) {
              var sent = false;
              function receiveMessage(e) {
                if (sent) return;
                sent = true;
                window.opener.postMessage(message, e.origin);
                window.removeEventListener('message', receiveMessage);
                setTimeout(function() { window.close(); }, 500);
              }
              window.addEventListener('message', receiveMessage);
              window.opener.postMessage('authorizing:github', '*');
              
              // 1.5초 후에도 응답 없으면 커스텀 웹앱용으로 전송
              setTimeout(function() {
                if (!sent) {
                  sent = true;
                  window.opener.postMessage(message, '*');
                  setTimeout(function() { window.close(); }, 500);
                }
              }, 1500);
            }
          })();
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send("Authentication Error: " + error.message);
  }
};
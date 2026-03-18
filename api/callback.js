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
            function sendMessage() {
              if (window.opener) {
                window.opener.postMessage(message, '*');
                setTimeout(function() { window.close(); }, 5000); // 5초 후에 창 닫기
              }else {
                console.log('opener 없음');
              }
            }
            if (document.readyState === 'complete') {
              sendMessage();
            } else {
              window.addEventListener('load', sendMessage);
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
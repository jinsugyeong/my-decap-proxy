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
        var message = 'authorization:github:success:{"token":"${token}","provider":"github"}';
        
        function receiveMessage(e) {
          window.opener.postMessage(message, e.origin);
          window.removeEventListener("message", receiveMessage, false);
          // 부모 창에 인증 정보를 넘겨주고 0.1초 뒤에 창 닫기
          setTimeout(function() { window.close(); }, 100); 
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");

        // 플랜 B: 혹시라도 통신이 지연되면 1초 뒤에 강제로 넘기고 무조건 창 닫기
        setTimeout(function() {
          window.opener.postMessage(message, "https://jinsugyeong.github.io");
          window.close(); 
        }, 1000);
      </script>
    `);
  } catch (error) {
    res.status(500).send("Authentication Error: " + error.message);
  }
};

const nodemailer = require("nodemailer");
const googleApis = require("googleapis");
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = ``;
const CLIENT_SECRET = ``;
const REFRESH_TOKEN = ``;
const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 
REDIRECT_URI);
authClient.setCredentials({refresh_token: REFRESH_TOKEN});

async function mailer(email, userid, token){
 try{
 const ACCESS_TOKEN = await authClient.getAccessToken();
 const transport = nodemailer.createTransport({
 service: "gmail",
 auth: {
 type: "OAuth2",
 user: "jkbarman75@gmail.com",
 clientId: CLIENT_ID,
 clientSecret: CLIENT_SECRET,
 refreshToken: REFRESH_TOKEN,
 accessToken: ACCESS_TOKEN
 }
 })
 const details = {
 from: "jkbarman75@gmail.com",
 to: email,
 subject: "Reset password",
 text: "Click the link to reset the password",
//  html: "<h2>hello</h2>"
 html: `<a href="http://localhost:3000/reset/${userid}/${token}">Reset Link</a>`
 }
 const result = await transport.sendMail(details);
 return result;
 }
 catch(err){
 return err;
 }
}
// mailer().then(res => {
//  console.log("sent mail !", res);
// })

module.exports = mailer;
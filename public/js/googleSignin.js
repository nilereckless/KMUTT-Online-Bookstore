
function onSignIn(googleUser) {
  console.log(googleUser);
}

function login() {
  var myParams = {
    'clientid': '315716910345-28jpa507rrqnitgj7a5jd2dolrdqcpun.apps.googleusercontent.com',
    'cookiepolicy': 'single_host_origin',
    'callback': 'onSignIn',
    'approvalprompt': 'force',
    'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read'
  };

  gapi.auth.signIn(myParams);
}

 $("#googlelogin").on("click", function (e) {
   e.preventDefault();
   login();
 })

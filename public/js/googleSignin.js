
function onSignIn(googleUser) {
  var id_token = googleUser.id_token;
  var url = '/auth/google/callback';
  var request = $.post(url, {
    id_token: id_token,
  });
  request.done(function (e) {
    console.log(e);
    alert("loginSuccess");
  })
  request.fail(function (e) {
    console.log(e)
    alert("error");
  })
}

function login() {
  var myParams = {
    'clientid': '315716910345-28jpa507rrqnitgj7a5jd2dolrdqcpun.apps.googleusercontent.com',
    'cookiepolicy': 'single_host_origin',
    'callback': 'onSignIn',
    'approvalprompt': 'force',
    'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read https://www.googleapis.com/auth/userinfo.profile'
  };

  gapi.auth.signIn(myParams);
}

 $("#googlelogin").on("click", function (e) {
   e.preventDefault();
   login();
 })

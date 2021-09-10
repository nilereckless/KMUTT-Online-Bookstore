
function onSignIn(googleUser) {
  console.log(googleUser);
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
    auth2 = gapi.auth2.init({
    client_id: '315716910345-28jpa507rrqnitgj7a5jd2dolrdqcpun.apps.googleusercontent.com',
    cookiepolicy: 'single_host_origin', /** Default value **/
    scope: 'profile' });                /** Base scope **/

  gapi.auth.signIn(auth2);
}

 $("#googlelogin").on("click", function (e) {
   e.preventDefault();
   login();
 })

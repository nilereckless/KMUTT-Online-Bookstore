
function onSignIn(googleUser) {
  console.log(googleUser);
  var id_token = googleUser.$s.id_token;
  var url = '/auth/google/callback';
  var request = $.post(url, {
    id_token: id_token,
  });
  request.done(function (e) {
  if (e === 'success') {
    window.location.reload();
  } else {
      alert(e);
  }
    console.log(e);
    
  })
  request.fail(function (e) {
    console.log(e)
    alert("error");
  })
}


//  $("#googlelogin").on("click", function (e) {
//    e.preventDefault();
//    login();
//  })

  var googleUser = {};
  var startApp = function() {
    gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '315716910345-28jpa507rrqnitgj7a5jd2dolrdqcpun.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        scope: 'profile email'
      });
      attachSignin(document.getElementById('google-signin'));
      attachSignin(document.getElementById('google-signin-modal'));
    });
  };

  function attachSignin(element) {
    auth2.attachClickHandler(element, {},
        function(googleUser) {
          onSignIn(googleUser)
        }, function(error) {
        });
  }

startApp();
  

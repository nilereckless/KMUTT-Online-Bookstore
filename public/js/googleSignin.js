
function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    var url = '/auth/google/callback';
       var request = $.post(url, {
        data: id_token,
       }) ;
        request.done(function(e) {
          console.log(e);
          alert("loginSuccess");
        })
        request.fail(function() {
          alert( "error" );
        })
  }
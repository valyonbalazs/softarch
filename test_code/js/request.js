var CLIENT_ID = '268864776090-ltnggc4pcsd411f9ngbi3008ogkdbb34.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    authorizeDiv.style.display = 'none';
    loadDriveApi();
  } else {
    authorizeDiv.style.display = 'inline';
  }
}

function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

function loadDriveApi() {
  gapi.client.load('drive', 'v2', listFiles);
}

function listFiles() {
  var request = gapi.client.drive.files.list({
      'maxResults': 100
    });

    request.execute(function(resp) {
      appendPre('Last 100 files from your google drive:');
      var files = resp.items;
      if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          console.log(file);
          appendPre('NAME: ' + file.title + '  CREATED ON: ' + file.createdDate + ' BY ' + file.lastModifyingUserName);
        }
      } else {
        appendPre('No files found.');
      }
    });
}

function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}
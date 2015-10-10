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
    //authorizeDiv.style.display = 'inline';
    //console.log(authResult);
    loadDriveApi();
  } else {
    //authorizeDiv.style.display = 'inline';
  }
}

function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

function loadDriveApi() {
  gapi.client.load('drive', 'v2', null);
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
          appendPre('ID: ' + file.id + ' NAME: ' + file.title + '  CREATED ON: ' + file.createdDate + ' BY ' + file.lastModifyingUserName);
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

var readableFileId;
function createNewFile () {

  gapi.client.load('drive', 'v2', function () {
    var insertableData = {
      taskId: 1,
      taskName: 'taskName data',
      taskDescription: 'description of the task',
      date: new Date().toJSON().slice(0,15)
    };

    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";
    var metadata = {
      'title': 'testdata.json',
      'mimeType': 'application/json'
    };
    var requestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + 'application/json' + '\r\n' +
        '\r\n' +
        JSON.stringify(insertableData) +
        close_delim;

    var request = gapi.client.request({
      'path': 'upload/drive/v2/files',
      'method': 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': requestBody
    });

    request.execute(function(resp) {
      var h3 = document.getElementById('insertMessage');
      var textContent = document.createTextNode('File added to google drive with id: ' + resp.id + '\n');
      h3.appendChild(textContent);
      readableFileId = resp.id;
      console.log(resp);
    });
  });
}

function readFileWithSpecificId() {
  var file = {
    downloadUrl: 'https://www.googleapis.com/drive/v2/files/' + readableFileId
  };

  if (file.downloadUrl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText);

      var xhr2 = new XMLHttpRequest();
      xhr2.onreadystatechange = function (){
        var contentData = JSON.parse(xhr2.responseText);
        console.log(contentData);
        var h3Container = document.getElementById('contentOfJson');
        h3Container.innerHTML = "Content of the testdata.json file: ";
        for(var key in contentData) {
          var node = document.createElement('h5');
          h3Container.appendChild(node);
          node.innerHTML = key + ': ' + contentData[key];
        }
      };
      xhr2.open('GET', data.downloadUrl, true);
      xhr2.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr2.send();

    };
    xhr.onerror = function() {

    };
    xhr.send();

  } else {

  }
}

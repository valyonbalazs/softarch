//var CLIENT_ID = '7699282553-qq2be7q08obmtl0d2897guvmepd9cnv2.apps.googleusercontent.com'; //uj
var CLIENT_ID = '268864776090-ltnggc4pcsd411f9ngbi3008ogkdbb34.apps.googleusercontent.com'; //regi
var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly',
              'https://www.googleapis.com/auth/drive.metadata',
              'https://www.googleapis.com/auth/drive'
];

function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

function handleAuthResult(authResult) {
  //var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    //authorizeDiv.style.display = 'inline';
    console.log(authResult);
    loadDriveApi();
    readFileWithSpecificId();
  } else {
    //authorizeDiv.style.display = 'inline';
  }
}

$(document).ready(function(){
  console.log( "ready!" );
  console.log("google authentication");
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
});

/*$( document ).ready(function() {

});*/

function handleAuthClick(event) {
  console.log("google authentication");
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
};

function loadDriveApi() {
  gapi.client.load('drive', 'v2', null);
}

function listFiles() {
  var request = gapi.client.drive.files.list({
      'maxResults': 100
    });

    request.execute(function(resp) {
      //appendPre('Last 100 files from your google drive:');
      var files = resp.items;
      if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          console.log('ID: ' + file.id + ' NAME: ' + file.title + '  CREATED ON: ' + file.createdDate + ' BY ' + file.lastModifyingUserName);
        }
      } else {
        //appendPre('No files found.');
      }
    });
}

function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

var readableFileId;
function createNewFile (insertData) {

  gapi.client.load('drive', 'v2', function () {
    /*var insertableData = {
      taskId: 1,
      taskName: 'taskName data',
      taskDescription: 'description of the task',
      date: new Date().toJSON().slice(0,15)
    };*/
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDay();
    var hour = d.getHours();
    var min = d.getMinutes();
    var nowDate = year + '_' + month + '_' + day + '_' + hour + ':' + min;
    var projectSaveName = insertData.project.name + ' ' + nowDate + '.json'

    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";
    var metadata = {
      'title': projectSaveName,
      'mimeType': 'application/json'
    };
    var requestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + 'application/json' + '\r\n' +
        '\r\n' +
        JSON.stringify(insertData) +
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
      console.log(resp);
      console.log("File was saved successfully to Google Drive!");
      $('#saveAlertDiv').show();
    });
  });
}

var contentFromDrive = undefined;
var proj = {};
var risk = [];
var task = [];
function readFileWithSpecificId() {
  var id = parse('id');
  console.log(id);
  var file = {
    downloadUrl: 'https://www.googleapis.com/drive/v2/files/' + id
    //downloadUrl: 'https://www.googleapis.com/drive/v2/files/' + id + '?key=AIzaSyAO_VzgwT5zOItqaP8_iW9QCX9sG4pICFI&alt=media'
	//downloadUrl: 'https://www.googleapis.com/drive/v2/files/' + id + '?key=AIzaSyAJbel1_R7JkRVo6eGq7AcwFEOJJlqbJ44'
  };
	console.log(file.downloadUrl);
  if (file.downloadUrl) {
    var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText);
	  console.log(data); console.log(data.downloadUrl);

      var xhr2 = new XMLHttpRequest();
      xhr2.onreadystatechange = function (){
        if (xhr2.readyState == 4 && xhr2.status == 200)
        {
          if (xhr2.responseText)
           {
             var contentData = JSON.parse(xhr2.responseText);
             contentFromDrive = contentData;
             proj = contentData.project;
             risk = contentData.risks;
             task = contentData.tasks;
             console.log("project data: ");console.log(proj);
             console.log("risk data: ");console.log(risk);
             console.log("task data: ");console.log(task);
             dataLoader();
            }
         }

      };
      xhr2.open('GET', data.downloadUrl);
      xhr2.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr2.send();

    };
    xhr.onerror = function() {

    };
    xhr.send();

  } else {

  }
}

function getProjData() {
  return proj;
}

function getRiskData() {
  return risk;
}

function getTaskData() {
  return task;
}

function parse(val) {
    var result = "Not found",
        tmp = [];
    location.search
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
    });
    return result;
}

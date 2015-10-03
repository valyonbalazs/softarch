


function getDriveFileList () {
    function retrieveAllFiles(callback) {
    var retrievePageOfFiles = function(request, result) {
      request.execute(function(resp) {
        result = result.concat(resp.items);
        console.log(result);
        var nextPageToken = resp.nextPageToken;
        if (nextPageToken) {
          request = gapi.client.drive.files.list({
            'pageToken': nextPageToken
          });
          retrievePageOfFiles(request, result);
        } else {
          callback(result);
        }
      });
    }
    var initialRequest = gapi.client.drive.files.list();
    retrievePageOfFiles(initialRequest, []);
  }
}

function retrieveAllFiles (callback) {

  var retrievePageOfFiles = function (request, result) {

    request.execute( function (resp) {
      result = result.concat(resp.items);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.drive.files.list({
          'pageToken': nextPageToken
        });
        retrievePageOfFiles(request, result);
      } else {
        callback(result);
      }
    });
  }
  var initialRequest = gapi.client.drive.files.list();
  retrievePageOfFiles(initialRequest, []);
}

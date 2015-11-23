var express = require('express');
var app = express();

// NODEJS EXPRESS CONFIGURATION
app.get('/', function (req, res) {
  res.redirect('/index.html');
});
app.listen(process.env.PORT || 3000, function () {
  console.log('listening on: ', app.get('port'))
});

app.use('/', express.static(__dirname + '/'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/datepicker', express.static(__dirname + '/datepicker'));
app.use('/dist', express.static(__dirname + '/dist'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/resources', express.static(__dirname + '/resources'));
app.use('/select', express.static(__dirname + '/select'));
app.use('/src', express.static(__dirname + '/src'));
app.use('/models', express.static(__dirname + '/models'));

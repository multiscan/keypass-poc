var browserify = require('browserify-middleware');
var express = require('express');
var app = express();

app.get('/app.js', browserify('./app.js'));
app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.render('index.ejs');
});

app.listen(3000);
console.log('Listening on port 3000');
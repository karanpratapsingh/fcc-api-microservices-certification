let express = require('express');
let mongo = require('mongodb');
let mongoose = require('mongoose');

let cors = require('cors');

let app = express();

let bodyParser = require('body-parser');

let urlHandler = require('./routeHandlers.js');

// Basic Configuration 
let port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);


/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.use(bodyParser.urlencoded({'extended': false}));

app.post('/api/shorturl/new', urlHandler.saveUrl);
  
app.get('/api/shorturl/:shorturl', urlHandler.processUrl);

app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
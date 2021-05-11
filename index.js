var express = require('express');
var cors = require('cors');
var fs = require('fs');
var http = require('http');
var https = require('https');
var multiparty = require('multiparty');
var path = require('path');

var app = module.exports = express();

app.use(cors());

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/attachment-fetcher', function(req, res) {
  res.send(`
    <h2>Attachment Fetcher</h2>
    <script>
      fetch('/get-attachment/pdf')
        .then(r => {
          const x = r;
        })
    </script>
  `);
});

app.get('/get-attachment/:extension', function(req, res){
  switch (req.params.extension) {
    case 'jpeg':
      res.download(`${__dirname}/static-files/file-sample.jpeg`);
      break;
    case 'png':
      res.download(`${__dirname}/static-files/file-sample.png`);
      break;
    case 'pdf':
      res.download(`${__dirname}/static-files/file-sample.pdf`);
      break;
    case 'doc':
      res.download(`${__dirname}/static-files/file-sample.doc`);
      break;
    case 'docx':
      res.download(`${__dirname}/static-files/file-sample.docx`);
      break;
    default:
      res.download(`${__dirname}/static-files/file-sample.pdf`);
      break;
  }
});

app.post('/', function(req, res, next){
  // create a form to begin parsing
  var form = new multiparty.Form();
  const uploads = [];

  form.on('error', next);
  form.on('close', function(){
    var ret = uploads.map(upload => ({
      filename: upload.filename,
      size: (upload.size / 1024 | 0) + 'Kb'
    }));
    res.json(ret);
  });

  // listen on part event for each image file
  form.on('part', function(part){
    if (!part.filename) return;
    const upload = {};
    upload.filename = part.filename;
    upload.size = 0;
    part.on('data', function(buf){
      upload.size += buf.length;
    });
    uploads.push(upload);
  });


  // parse the form
  form.parse(req);
});

/* istanbul ignore next */
if (!module.parent) {
  
  // app.listen(8090);

  http
    .createServer(app)
    // .listen(8090);
    .listen(8888);

  /*
  const options = {
    key: fs.readFileSync(`${__dirname}/localhost.key`),
    cert: fs.readFileSync(`${__dirname}/localhost.crt`)
  };
  https
    .createServer(options, app)
    .listen(8090);
  */

  // console.log('Express started on port 8090');
  console.log('Express started on port 8888');
}

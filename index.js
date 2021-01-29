var express = require('express');
var cors = require('cors');
var fs = require('fs');
var http = require('http');
var https = require('https');
var multiparty = require('multiparty');

var app = module.exports = express();

app.use(cors());

app.get('/', function(req, res){
  res.send('<form method="post" enctype="multipart/form-data">'
    + '<p>Image: <input type="file" name="image" multiple /></p>'
    + '<p><input type="submit" value="Upload" /></p>'
    + '</form>');
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

app.get('/get-attachment/:attachmentType', function(req, res){
  switch (req.params.attachmentType) {
    case 'image':
      res.download(`${__dirname}/static-files/dummy.png`);
      break;
    case 'pdf':
      res.download(`${__dirname}/static-files/dummy.pdf`);
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
    .listen(8090);

  /*
  const options = {
    key: fs.readFileSync(`${__dirname}/localhost.key`),
    cert: fs.readFileSync(`${__dirname}/localhost.crt`)
  };
  https
    .createServer(options, app)
    .listen(8090);
  */

  console.log('Express started on port 8090');
}

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5002;

app.use(bodyParser());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//app.use(express.static(util.getOutputFolderPath()));
//app.use('/thumbnails', express.static(util.getThumbnailFolderPath()));

app.get('/hello', (req, res) => {
  res.status(200).send({msg: 'hello to you too'})
})

const server = http.createServer(app);

server.listen(port, () => console.log(`Listening on port ${port}`));

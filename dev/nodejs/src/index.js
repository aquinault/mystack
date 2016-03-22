var express = require('express');
var os = require("os");

var app = express();
var hostname = os.hostname();
var elasticsearch = require('elasticsearch');
var shortid = require('shortid');
var multer = require('multer');
var fs = require('fs');
var path = __dirname + '/views/';
var _ = require('lodash');
var bodyParser = require('body-parser');
var config = require('./config');


//app.use(multer({dest:'./uploads/'}).single('singleInputFileName'));

var client = new elasticsearch.Client({
//  host: '192.168.99.100:9200',
  host: config.url,
  log: 'info',
  requestTimeout : 2000
});


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname+ '-' + Date.now()+'.jpg')
    }
});
var upload = multer({ storage: storage });

//app.post('/multer', upload.single('file'));

app.use(express.static('js'));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

function formatDate() {
  var d = new Date(),
    month = '' + (d.getMonth() + 1 ),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

app.get('/annonces', function (req, res) {  
  client.search({
    index: 'annonces',
  }).then(function (body) {

    var hits = body.hits.hits;
    
    if(!body.hits.max_score) {
      //res.send('<html><body>no data!</body></html>');
      res.status(404).send('Sorry, we cannot find that!');
      return;
    }
   
    res.send(hits);

  }, function (error) {
    //console.trace(error.message);
    //res.send('<html><body>elasticsearch cluster is down!</body></html>');
    res.status(404).send('Sorry, we cannot find that!');
  });    
});

app.post('/annonces', function (req, res) {  
  console.log(req.body);

  // Write to elastic search
  client.index({
    index: 'annonces',
    type: 'annonces',
    body: {
      name: req.body.name,
      description: req.body.description,
      picture: req.body.picture,
      email: req.body.email,
      url: req.body.url,
      telephone: req.body.telephone,
      positionx: req.body.positionx,
      positiony: req.body.positiony,
      created_at: formatDate(),
      id_qrcode: req.body.id_qrcode,
      start_at: req.body.start_at,
      end_at: req.body.end_at
    }
  }, function (error, response) {
    if(error) {
      console.log( error );
      res.status(404).send('Sorry, we cannot find that!');
    } else {
      var myObj = {
        "_index": "annonces",
        "_type": "annonces",
        "_id": req.body._id,
        "name": req.body.name,
        "description": req.body.description,
        "picture": req.body.picture,
        "email": req.body.email,
        "url": req.body.url,
        "telephone": req.body.telephone,
        "positionx": req.body.positionx,
        "positiony": req.body.positiony,
        "id_qrcode": req.body.id_qrcode,
        "start_at": req.body.start_at,
        "end_at": req.body.end_at
      };
      res.send(myObj);
    }
  });
    
});


app.delete('/annonces/:id', function (req, res) {
  client.delete({
    index: 'annonces',
    type: "annonces",
    id: req.params.id
  }, function (error, response) {
    if(error) {
      console.log('annonces post deleted error');
      //res.send('annonces post deleted error');        
      res.status(404).send('Sorry, we cannot find that!');
  
    } else {
      console.log('annonces post deleted');

      var myObj = {
        "_index": "annonces",
        "_type": "annonces",
        "_id": req.params.id,
      };
      res.send(myObj);
    }
  });
});


app.post('/multer', upload.single('file'), function (req, res) {
  /*
 post '/sell/pictures' do
    #adsimagesindex/images
    image_id = SecureRandom.hex
    file = params[:file][:tempfile] #get the post from body
    fileContent = file.read
    fileContent =  Base64.encode64(fileContent)
    @es_client.index index: 'adsimages', type: 'images', id: image_id, body: {id: image_id, image: fileContent}
    redirect '/ads/sell/pictures' 
  end   
  */

  var myId = shortid.generate();
  console.log('myId: ' + myId);
  console.log(req.file);
  console.log(req.body);

  // Read in Base64
  fs.readFile(req.file.path, "base64", function(err, data) {
    if(err){
      console.log( err );
      //res.send('<html><body>OK</body></html>');
      res.status(404).send('Sorry, we cannot find that!');
    } else {
      var D = new Date();
      // Write to elastic search
      client.index({
        index: 'adimages',
        type: 'images',
        id_image: myId, //'1',
        body: {
          image: data, //'Test 1'
          name: req.body.picturename,
          created_at: formatDate()
        }
      }, function (error, response) {
        if(err) {
          console.log( err );
          res.status(404).send('Sorry, we cannot find that!');
        } else {
          var myObj = {
            "_index": "adimages",
            "_type": "images",
            "_id": myId,
            "name": req.body.picturename
          };
          res.send(myObj);
        }      
      });
    }
  });
});



app.use(function (req, res, next) {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log( fullUrl );
  next();
});

app.get('/', function (req, res) {
  //res.send('<html><body>Hello from Node.js container1 ' + hostname + '</body></html>');
  res.redirect('/annonce');
});

app.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

app.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});

app.get('/upload', function (req, res) {
  res.sendFile(path + "upload.html");
});

app.get('/annonce', function (req, res) {
  res.sendFile(path + "annonce.html");
});

/*
app.post('/upload', function (req, res) {
  

  var myId = shortid.generate();
  console.log('myId: ' + myId);
//  console.log(req.file);
  console.log('req.picturename: ' + req.picturename);
  console.log(req);
  console.log('@@@@@@@@@@@@@@@@@@@@');
  console.log('@@@@@@@@@@@@@@@@@@@@');
  console.log('@@@@@@@@@@@@@@@@@@@@');
  // Read in Base64
  fs.readFile(req.file.path, "base64", function(err, data) {
    if( err ){
      console.log( err );
    } else {
      // Write to elastic search
      client.index({
        index: 'adimages',
        type: 'images',
        id: myId, //'1',
        body: {
          image: data, //'Test 1'
          name: req.name
        }
      }, function (error, response) {
        if(error) {
          console.log( error );
        }        
      });
    }
  });
  res.send('<html><body>OK</body></html>');
});
*/

app.get('/pictures/:id', function (req, res) {
  client.search({
    index: 'adimages',
    q: '_id:' + req.params.id
  }).then(function (body) {
    var hits = body.hits.hits;
    
    if(!body.hits.max_score) {
      res.send('<html><body>no data!</body></html>');
      return;
    }

    var b64string = hits[0]._source.image;
    var buf = new Buffer(b64string, 'base64');
  
    //res.header('Access-Control-Allow-Origin', '*');
    //res.writeHead(200, {'Content-Type': 'image/png'});
    res.type('png');
    res.send(buf);
  }, function (error) {
    //console.trace(error.message);
    //res.send('<html><body>elasticsearch cluster is down!</body></html>');
    res.status(404).send('Sorry, we cannot find that!');

  });  
});

app.delete('/pictures/:id', function (req, res) {
  client.delete({
    index: 'adimages',
    type: "images",
    id: req.params.id
  }, function (error, response) {
    if(error) {
      console.log('post deleted error');
      //res.send('post deleted error');         
      res.status(404).send('Sorry, we cannot find that!'); 
    } else {
      console.log('post deleted');

      var myObj = {
        "_index": "adimages",
        "_type": "images",
        "_id": req.params.id,
      };
      res.send(myObj);

      //res.send('post deleted');
    }
  });
});


app.get('/pictures', function (req, res) {
  client.search({
    index: 'adimages',
  }).then(function (body) {

    var hits = body.hits.hits;
    
    if(!body.hits.max_score) {
      //res.send('<html><body>no data!</body></html>');
      res.status(404).send('Sorry, we cannot find that!');
      return;
    }
   
    var objA = [];
    for(var i = 0; i < hits.length; i++) {
        var objB = _.omit(hits[i], ['_source']); 
        objB.name = hits[i]._source.name;
        objA.push(objB);
    }    

    res.send(objA);

  }, function (error) {
    //console.trace(error.message);
    res.status(404).send('Sorry, we cannot find that!');
  });  
});
/*

POST http://localhost:9200/adimages/
{
    "mappings" : {
    "images" : {
        "properties" : {
            "image" : { "type" : "binary"},
            "id" : {"type" : "string"}
        }
    }
}

get '/pictures/:name' do |name|                                                                                                                                                    
    @image = @es_client.search index: 'adsimages', body: { query: { match: { id: name } } }   
    @image = AdHelpers.get_hashie_list(@image)
    content_type 'image/png' #hardcoded content type for now
    fileContent = Base64.decode64(@image[0].image);
  end 

  post '/sell/pictures' do
    #adsimagesindex/images
    image_id = SecureRandom.hex
    file = params[:file][:tempfile] #get the post from body
    fileContent = file.read
    fileContent =  Base64.encode64(fileContent)
    @es_client.index index: 'adsimages', type: 'images', id: image_id, body: {id: image_id, image: fileContent}
    redirect '/ads/sell/pictures' 
  end 


<form class="form-horizontal" action="/ads/sell/pictures" method="post">
    <div class="container"> 
      <div class="form-group">
        <label for="upload-pictures">Upload Pictures</label>
        <input type="file" id="file" name="upload-pictures[]" multiple>
      </div>

      <button type="submit" class="btn btn-default">Next</button>
    </div>
</form>

  to retrieve the image do 'GET /ads/sell/pictures/7a911a0355ad1cc3cfc78bbf6038699b' 
*/

app.listen(80);
console.log('Running on http://localhost');
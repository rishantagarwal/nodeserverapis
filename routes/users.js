// API's for data transactions
var express = require('express'),
    session = require('express-session'),
    cors = require('cors'),
    jwt = require('jsonwebtoken'),
    configFile = require('./../config/config.js');

var router = express.Router();

var pool = configFile.pool,
    logger = configFile.logger,
    config = configFile.config;

var sess = null;

router.use(session(config.sessionConfig));
router.use(cors());

router.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token,config.token, function(err, decoded) {
      if (err) {
        logger.log(err);
        return res.json({ status: 404,
          success: false,
          message: 'Failed to authenticate token.'});
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          //console.log(decoded);
          next();
        }
      });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });

    }
  });


// Data handling API's
router.post('/setLocation', function (req, res) {
    //sess = req.session;
    //console.debug(req.body);
    if(req.session.email){
      var count=0;
      for (key in req.body) {
        if (req.body.hasOwnProperty(key)) {
          count++;
        }
      }
      //    console.log(count);

      if(count ==3 && req.body.user!= "" && req.body.location.coords.latitude!="" && req.body.location.coords.longitude!="" && req.decoded.user==req.body.user) {
        var postData = {
          id:  req.body.user,
          lat: req.body.location.coords.latitude,
          lng: req.body.location.coords.longitude,
          timestamp: req.body.location.timestamp,
          battery: req.body.location.battery.level
        };

        //console.info("setLocation -- " + JSON.stringify(postData));
        pool.query('INSERT into logs SET ?', postData, function (err, rows, fields) {
          if (err) {
            logger.error('Error executing query: ' + err.stack);
            return;
          }
        });
        res.json({"200": "OK"});
      }
    }
    else res.json({"404":"Check input data"});
  });

  //connection.end();
  router.post('/updateStatus', function (req, res) {

    //console.log(req.body);
    var count=0;
    for (key in req.body) {

      if (req.body.hasOwnProperty(key)) {
        count++;
      }
    }
    //console.log(count);
    if(count == 3 && req.body.user != "" && req.body.status!="" && req.decoded.user.toString().trim()==req.body.user.toString().trim()) {
      var postData = {
        id: req.body.user,
        status:req.body.status
      };
      //console.log(postData);
      // console.info("setLocation -- " + JSON.stringify(postData));
      pool.query('INSERT into status SET ?', postData, function (err, rows, fields) {
        if (err) {
          logger.log('Error executing query: ' + err.stack);
          //  console.error('Error executing query: ' + err.stack);
          res.setStatus(404).end();
        }
      });
      //    res.header("Access-Control-Allow-Origin", "*");
      //    res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.json({"200": "OK"});
    }
    //else res.json({"404":"Check input data"});
    else res.sendStatus(404);
  });


  router.get('/getLastLocation/:id',function(req,res){
    connection.query('SELECT lat,lng,timestamp from logs where id = ? order by timestamp desc limit 1',req.params.id, function(err, rows, fields) {
      if (err) {
        logger.error('Error executing query: ' + err.stack);
        //      console.error('Error executing query: ' + err.stack);
        return;
      }
      //console.info("getLastLocation -- "+req.params.id);
      if (rows.length < 1) {
        res.json({"404": "Does not exists"});
      }
      else res.json(rows);
      //console.log('The solution is: ', rows);

    });
  });

  router.get('/getLocationHistory/:id',function(req,res) {
    //console.info("getLocationHistory -- " + req.params.id);
    connection.query('SELECT lat,lng,timestamp from logs where id = ? order by timestamp desc', req.params.id, function (err, rows, fields) {
      if (err) {
        logger.error('Error executing query: ' + err.stack);
        //    console.error('Error executing query: ' + err.stack);
        return;
      }
      if (rows.length < 1) {
        res.json({"404": "Does not exists"});
      }
      else res.json({"id": req.params.id, "history": rows});
      //console.log('The solution is: ', rows);

    });
  });


  router.get('/getSellerList',function(req,res) {
    //  console.info("getSellerList -- ");
    connection.query('SELECT DISTINCT(id) from logs order by timestamp desc', function (err, rows, fields) {
      if (err) {
        logger.error('Error executing query: ' + err.stack);
        //    console.error('Error executing query: ' + err.stack);
        return;
      }
      if (rows.length < 1) {
        res.json({"404": "Does not exists"});
      }
      else res.json(rows);
      //console.log('The solution is: ', rows);

    });
  });

  router.get('/getStatus/:id',function(req,res) {
    connection.query('SELECT status from logs where id = ? and date(timestamp) = date(CURDATE()) order by timestamp desc limit 1 ',req.params.id, function (err, rows, fields) {
      if (err) {
        logger.error('Error executing query: ' + err.stack);
        //    console.error('Error executing query: ' + err.stack);
        return;
      }

      if (rows.length < 1) {
        res.json({"404": "Does not exists"});
      }
      else res.json(rows);
      //console.log('The solution is: ', rows);

    });
  });

  //select status from logs where date("timestamp") = CURDATE() order by timestamp desc limit 1
  router.get('/getTodayStatus/:id',function(req,res) {
    connection.query('select status from logs where date(timestamp) = CURDATE() and id = ? order by timestamp desc limit 1',req.params.id, function (err, rows, fields) {
      if (err) {
        logger.error('Error executing query: ' + err.stack);
        //    console.error('Error executing query: ' + err.stack);
        return;
      }
      if (rows.length < 1) {
        res.json({"404": "Does not exists"});
      }
      else res.json(rows);
      //console.log('The solution is: ', rows);

    });
  });

  module.exports = router;

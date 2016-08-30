// API's for session management
var express = require('express'),
  session = require('express-session'),
  cors = require('cors'),
  jwt = require('jsonwebtoken'),
  configFile = require('./../config/config.js');

var router = express.Router();
var pool = configFile.pool,
    logger = configFile.logger,
    config = configFile.config;

router.use(cors());
router.use(session(config.sessionConfig));

var sess = null;

router.post('/login',function(req, res) {
  if(req.body.username!= '' && req.body.password!=''){
      pool.query('SELECT username,password from users where username = ? and password = ?',
      [req.body.username,req.body.password],
      function(err,rows,fields){
              if (err) {
                logger.info('Error executing query: ' + err.stack);
                res.status(400).end();
              }

              if (!(rows.length ==1) ){
                res.status(400).end();
              }
              else {
                var token = jwt.sign({
                    user:rows[0].username,
                    time: Math.floor(Date.now())
                  }, config.token, {
                    expiresIn: 21600
                  });
                  logger.info("Token "+token);
                  sess=req.session;
                  sess.email = rows[0].username;
                  res.json({
                    success:true,
                    id:req.sessionID,
                    token:token
                  }).end();
                }
              });
            }
            else {
              res.json({success:false});
            }
          })

router.get('/logout',function(req,res){
    req.session.destroy(function(err){
    if(err) {
      logger.error('Session can\'t be destroyed !!');
      res.status(400).end();
    }
    else{
      res.status(200).end();
    }
  });
})

router.get('/check',function(req, res) {
  logger.log(req.session.email);
  if(req.session.email){
    res.json({success:true}).end();
  }
  else
  {
    res.json({success:false}).end();
  }
})

module.exports = router;

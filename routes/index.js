var express = require('express');
var mysql = require('mysql');
var session = require('express-session');
var router = express.Router();
var cors = require('cors');
var jwt = require('jsonwebtoken');

router.use(cors());


//sesssion settings
router.use(session({ 
    /*genid : function(req){
        return genuuid()
    },*/
    secret: 'rish1313!&%agar.',
    saveUninitialized: true,
    resave: true,
    cookie: {secure : true}
}));

/*if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}*/

var sess = null;

var pool = mysql.createPool({
    connectionLimit : 200, 
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'c9',
    debug    :  false
});

router.use(function(req,res,next){
  //    console.log(req.body);
//      console.log(req.session);
//      console.log(req.session.email);
      next();
 })


pool.getConnection(function(err, connection) {
    if(err){
        connection.release();
        console.log("Error in connection !!"+err.stacktrace);
        return;
    }
 console.log('connected as id ' + connection.threadId);
// return connection;
})


router.post('/login',function(req, res) {
    console.log(req.body);
    if(req.body.username!= '' && req.body.password!=''){
    pool.query('SELECT username,password from users where username = ? and password = ?',[req.body.username,req.body.password],function(err,rows,fields){
    
         if (err) {
            console.error('Error executing query: ' + err.stack);
            res.status(400).end();
         }
      
        if (!(rows.length ==1) ){
            res.status(400).end();
        }
        else {
               var token = jwt.sign({
                   user:rows[0].username,
                   time: Math.floor(Date.now())
               }, "R1s4@&'--.<script", {
                 expiresIn: 21600
               });
               console.log(token);
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
           console.error('Session can\'t be destroyed !!');
           res.status(400).end();
       }
       else{
           res.status(200).end();
       }
    });
})

router.get('/check',function(req, res) {
    console.log(req.session.email);
    if(req.session.email){
        res.json({success:true}).end();
    }
    else
    {
        res.json({success:false}).end();
    }
})

module.exports = router;

var express = require('express');
var mysql = require('mysql');
var session = require('express-session');
var router = express.Router();
var cors = require('cors');

router.use(cors());


//sesssion settings
router.use(session({ 
    /*genid : function(req){
        return genuuid()
    },*/
    secret: 'rish1313!&%agar',
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
     console.log(req.body);
     console.log(req.session);
     console.log(req.session.email);
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


/*var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'c9'
});*/
/*var connection ;


pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          console.log('{"code" : 100, "status" : "Error in connection database"}');
          return;
        }
});        

console.log('connected as id ' + connection.threadId);


connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err);
        //console.error('error connecting: ' + err.stack);
        //console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
    //console.log('connected as id ' + connection.threadId);
});

connection.on('error', function(err) {      
  console.log('{"code" : 100, "status" : "Error in connection database"}');
  return;     
});*/

/*router.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
  next();
})*/

/*function handle_database(req,res) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        /*connection.query("select * from user",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });*/

       /* connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
        
        return connection;
  });
}*/
/*
router.use(function(req,res,next){
    console.log(req.body);
    next();
})*/


/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

router.post('/login',function(req, res) {
    console.log(req.body);
    if(req.body.username!= '' && req.body.password!=''){
  //  res.header("Access-Control-Allow-Origin","*");
    //var connection = handle_database(req,res);
    pool.query('SELECT username,password from users where username = ? and password = ?',[req.body.username,req.body.password],function(err,rows,fields){
    
         if (err) {
            console.error('Error executing query: ' + err.stack);
      //    console.error('Error executing query: ' + err.stack);
            res.status(400).end();
        }
      
        if (!(rows.length ==1) ){
            res.status(400).end();
        }
        else {
            //if(req.body.password.toString().trim() === rows[0].password.toString().trim()){
                sess=req.session;
                sess.email = rows[0].username;
                res.json({success:true,id:req.sessionID}).end();
            //}
            //else {
            //   res.json({success:false});
                
            //}
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

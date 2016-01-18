var express = require('express');
var mysql = require("mysql");
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


pool.getConnection(function(err, connection) {
    if(err){
        connection.release();
        console.log("Error in connection !!"+err.stacktrace);
        return;
    }
 console.log('connected as id ' + connection.threadId);
// return connection;
})




 router.use(function(req,res,next){
     console.log("ccccc");
     console.log(req.body);
     console.log(req.session);
     console.log(req.session.email);
     next();
 })


// Data handling API's
// -------------------------------------------------------



router.post('/setLocation', function (req, res) {
    //console.debug(req.body);
    if(req.session.email){
    var count=0;
    for (key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            count++;
        }
    }
//    console.log(count);

    if(count ==2 && req.body.user!= "" && req.body.location.coords.latitude!="" && req.body.location.coords.longitude!="" ) {
        var postData = {
            id:  req.body.user,
            lat: req.body.location.coords.latitude,
            lng: req.body.location.coords.longitude,
            timestamp: req.body.location.timestamp,
            battery: req.body.location.battery.level
        };

        console.info("setLocation -- " + JSON.stringify(postData));
        pool.query('INSERT into logs SET ?', postData, function (err, rows, fields) {
            if (err) {
                console.error('Error executing query: ' + err.stack);
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
     if(req.session.email){
    //console.log(req.body);
    var count=0;
    for (key in req.body) {
       
        if (req.body.hasOwnProperty(key)) {
            count++;
        }
    }
    console.log(count);
        if(count == 2 && req.body.id != "" && req.body.status!="") {
        var postData = {
            id: req.body.id,
            status:req.body.status
        };
        //console.log(postData);
       // console.info("setLocation -- " + JSON.stringify(postData));
        pool.query('INSERT into status SET ?', postData, function (err, rows, fields) {
            if (err) {
                console.log('Error executing query: ' + err.stack);
                //  console.error('Error executing query: ' + err.stack);
                res.sendStatus(404).end();
            }
        });
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.json({"200": "OK"});
    }
    //else res.json({"404":"Check input data"});
    else res.sendStatus(404);}
    else { res.sendStatus(404).end();}
});


router.get('/getLastLocation/:id',function(req,res){
    connection.query('SELECT lat,lng,timestamp from logs where id = ? order by timestamp desc limit 1',req.params.id, function(err, rows, fields) {
        if (err) {
            console.error('Error executing query: ' + err.stack);
      //      console.error('Error executing query: ' + err.stack);
            return;
        }
        console.info("getLastLocation -- "+req.params.id);
        if (rows.length < 1) {
            res.json({"404": "Does not exists"});
        }
        else res.json(rows);
        //console.log('The solution is: ', rows);

    });
});

router.get('/getLocationHistory/:id',function(req,res) {
    console.info("getLocationHistory -- " + req.params.id);
    connection.query('SELECT lat,lng,timestamp from logs where id = ? order by timestamp desc', req.params.id, function (err, rows, fields) {
        if (err) {
            console.error('Error executing query: ' + err.stack);
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
    console.info("getSellerList -- ");
    connection.query('SELECT DISTINCT(id) from logs order by timestamp desc', function (err, rows, fields) {
        if (err) {
            console.error('Error executing query: ' + err.stack);
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
    console.info("getStatus -- ");
    connection.query('SELECT status from logs where id = ? and date(timestamp) = date(CURDATE()) order by timestamp desc limit 1 ',req.params.id, function (err, rows, fields) {
        if (err) {
            console.error('Error executing query: ' + err.stack);
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
    console.info("getStatus -- ");
    connection.query('select status from logs where date(timestamp) = CURDATE() and id = ? order by timestamp desc limit 1',req.params.id, function (err, rows, fields) {
        if (err) {
            console.error('Error executing query: ' + err.stack);
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

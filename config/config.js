var mysql = require("mysql"),
    log4js = require('log4js');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/api.log'), 'apiLog');
var logger = log4js.getLogger('apiLog');


var config = {
  // DB Settings
  dbConfig : {
      connectionLimit : 200,
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'c9',
      debug    :  false
  },
  // Session Settings
  sessionConfig: {
      secret: "rish1313!&%agar",
      saveUninitialized: true,
      resave: true,
      cookie: {secure : true}
  },
  // JWT token
  token : "R1s4@&'--.<script"
}

// Creating connection
var pool = mysql.createPool(config.dbConfig);
pool.getConnection(function(err, connection) {
  if(err){
    logger.log("Error in connection !!"+err.stacktrace);
    return;
  }
 logger.log('connected as id ' + connection.threadId);
})

module.exports = {config,pool,logger};

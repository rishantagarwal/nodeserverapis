var mysql = require("mysql");

var config = {
  dbConfig : {
      connectionLimit : 200,
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'c9',
      debug    :  false
  },
  sessionConfig: { // Session Settings
      secret: 'rish1313!&%agar',
      saveUninitialized: true,
      resave: true,
      cookie: {secure : true}
  },
  token : "R1s4@&'--.<script"
}

var pool = mysql.createPool(config.dbConfig);
pool.getConnection(function(err, connection) {
    if(err){
        console.log("Error in connection !!"+err.stacktrace);
        return;
    }
 console.log('connected as id ' + connection.threadId);
})

module.exports = {config,pool};

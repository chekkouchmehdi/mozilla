const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('/home/mehdi/.mozilla-iot/config/db.sqlite3', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });


let dbUI = {

            clearApps : async function(){
              db.serialize(() => {
                      db.all(`DELETE FROM jsonwebtokens`, (err, row) => {
                          console.log("formatage done");
                          if (err) {
                          console.error(err.message);
                          }
                      }).all(`DELETE FROM jsonwebtokens_old`, (err, row) => {
                        console.log("formatage done");
                          if (err) {
                          console.error(err.message);
                          }
                      }).all(`DELETE FROM tokens`, (err, row) => {
                        console.log("formatage done");
                          if (err) {
                          console.error(err.message);
                          }
                      }).all(`DELETE FROM tokens_old`, (err, row) => {
                        console.log("formatage done");
                          if (err) {
                          console.error(err.message);
                          }
                      });
                  });
            },

            sensRead : async function(success){
                db.serialize(() => {
                        db.all(`SELECT * FROM things`, (err, row) => {
                            if (err) {
                            console.error(err.message);
                            }
                            console.log(row);
                            success(row);
                        });
                    });
            },

            readSettings : async function(key_, success2){
              db.serialize(() => {
                      db.each(`SELECT * FROM settings WHERE key=?`, key_, (err, row) => {
                          if (err) {
                          console.error(err.message);
                          }
                          success2(row);
                      });
                  });
            },

            readEnableApps : async function(success){
              db.serialize(() => {
                      db.all(`SELECT * FROM tokens`, (err, row) => {
                          if (err) {
                          console.error(err.message);
                          }
                            db.all(`SELECT * FROM jsonwebtokens`, (err, row_) => {
                              if (err) {
                              console.error(err.message);
                              }
                              var enableAppsF;
                              var jsons = new Array();
                              for(let p = 0; p<Object.keys(row).length; p++){ 
                                for(let i = 0; i<Object.keys(row_).length; i++){
                                  if (row[p].keyId == row_[i].keyId){
                                    console.log("done")
                                    console.log(row_[i].keyId);
                                    console.log(row[p].keyId);
                                    var enableApps = Object.assign(row[p], row_[i])
                                    jsons.push(enableApps);
                                    enableAppsF = jsons;
                                  }
                                }
                              };
                              success(enableAppsF);
                            });
                          
                        });
                      });
              },

              readDisableApps : async function(success){
                db.serialize(() => {
                  db.all(`SELECT * FROM tokens_old`, (err, row) => {
                      if (err) {
                      console.error(err.message);
                      }
                        db.all(`SELECT * FROM jsonwebtokens_old`, (err, row_) => {
                          if (err) {
                          console.error(err.message);
                          }
                          var enableAppsF;
                          var jsons = new Array();
                          for(let p = 0; p<Object.keys(row).length; p++){ 
                            for(let i = 0; i<Object.keys(row_).length; i++){
                              if (row[p].keyId == row_[i].keyId){
                                console.log("done")
                                console.log(row_[i].keyId);
                                console.log(row[p].keyId);
                                var enableApps = Object.assign(row[p], row_[i])
                                jsons.push(enableApps);
                                enableAppsF = jsons;
                              }
                            }
                          };
                          success(enableAppsF);
                        });
                      
                    });
                  });
                },

            

            disableToken : async function(key){
                let token_ = 0;
                //let tokens = 0;
                db.each(`SELECT * FROM tokens WHERE keyId=?`, key, (err, row2) => {
                  if (err){
                    throw err;
                  }
                  const {keyId_, tokens} = row2;
                  //console.log("tokens : " + tokens);
                      db.each(`SELECT * FROM jsonwebtokens WHERE keyId=?`, key, (err, row) => {
                          if (err){
                            throw err;
                          }
                          token_ = row;
                          const {keyId, user, publicKey, issuedAt, payload} = token_;
                          //console.log({keyId, user, publicKey, issuedAt, payload});

                          db.run('CREATE TABLE IF NOT EXISTS jsonwebtokens_old (' +
                          'id INTEGER PRIMARY KEY ASC,' +
                          'keyId TEXT UNIQUE,' + // public id (kid in JWT terms).
                          'user INTEGER,' +
                          'issuedAt DATE,' +
                          'publicKey TEXT,' +
                          'payload TEXT' +
                          ');'
                          ).run('CREATE TABLE IF NOT EXISTS tokens_old (' +
                          'id INTEGER PRIMARY KEY ASC,' +
                          'keyId TEXT UNIQUE,' + // public id (kid in JWT terms).
                          'tokens TEXT UNIQUE' +
                          ');'
                          ).run('INSERT INTO jsonwebtokens_old (keyId, user, issuedAt, publicKey, payload) ' +
                          'VALUES (?, ?, ?, ?, ?)',
                          [keyId, user, issuedAt, publicKey, payload]
                          ).run(`DELETE FROM jsonwebtokens WHERE keyId=?`, keyId, function(err) {
                            if (err) {
                            return console.error(err.message);
                            }
                            console.log(`Row(s) deleted ${this.changes}`);
                          }).run('INSERT INTO tokens_old (keyId, tokens) ' +
                          'VALUES (?, ?)',
                          [keyId, tokens]
                          ).run(`DELETE FROM tokens WHERE keyId=?`, keyId, function(err) {
                            if (err) {
                            return console.error(err.message);
                            }
                            console.log(`Row(s) deleted ${this.changes}`);
                          });
                        });
                      });
            },

            enableToken : async function(key){
                let token_ = 0;
                
                db.each(`SELECT * FROM tokens_old WHERE keyId=?`, key, (err, row2) => {
                  if (err){
                    throw err;
                  }
                  const {keyId_, tokens} = row2;
                  db.each(`SELECT * FROM jsonwebtokens_old WHERE keyId=?`, key, (err, row) => {
                      if (err){
                        throw err;
                      }
                      token_ = row;
                      const {keyId, user, publicKey, issuedAt, payload} = token_;
                      console.log({keyId, user, publicKey, issuedAt, payload});

                      db.run('INSERT INTO jsonwebtokens (keyId, user, issuedAt, publicKey, payload) ' +
                            'VALUES (?, ?, ?, ?, ?)',
                            [keyId, user, issuedAt, publicKey, payload]
                      ).run(`DELETE FROM jsonwebtokens_old WHERE keyId=?`, keyId, function(err) {
                          if (err) {
                          return console.error(err.message);
                          }
                          console.log(`Row(s) deleted ${this.changes}`);
                      });

                      db.run('INSERT INTO tokens (keyId, tokens) ' +
                            'VALUES (?, ?)',
                            [keyId, tokens]
                      ).run(`DELETE FROM tokens_old WHERE keyId=?`, keyId, function(err) {
                          if (err) {
                          return console.error(err.message);
                          }
                          console.log(`Row(s) deleted ${this.changes}`);
                      });
                    }); 
                  });   
            },

            getTunnelEndpoint : async function(result){
              db.serialize(() => {
                let key_ = 'tunneltoken';
                db.each(`SELECT key, value FROM settings WHERE key=?`, key_, (err, row) => {
                    if (err) {
                    console.error(err.message);
                    }
                      let data = extract_string(row.value);
                      let myResult;
                      //console.log(data[3]);
                        myResult = data[3];
                      
                        let tunnelEndpoint;
                        if (myResult !== 'undefined') {
                          tunnelEndpoint = `https://${myResult}.mozilla-iot.org`; //${config.get('ssltunnel.domain')
                          //console.log(tunnelEndpoint);
                          result(tunnelEndpoint);
                          return tunnelEndpoint;
                        } else {
                          tunnelEndpoint = 'Not set.';
                          //console.log(tunnelEndpoint);
                          result(tunnelEndpoint);
                          return tunnelEndpoint;
                        }
                        
                });
              });
            },
              
            dataStorage_SQLite : async function(token_, tokens){
                const {keyId, user, publicKey, issuedAt, payload} = token_;
                
                 db.serialize(() => {
                    db.run('CREATE TABLE IF NOT EXISTS tokens (' +
                    'id INTEGER PRIMARY KEY ASC,' +
                    'keyId TEXT UNIQUE,' + // public id (kid in JWT terms).
                    'tokens TEXT UNIQUE' +
                    ');'
                    ).run(
                    'INSERT INTO tokens (keyId, tokens) ' +
                    'VALUES (?, ?)',
                    [keyId, tokens]
                    );
                    db.run(
                    'INSERT INTO jsonwebtokens (keyId, user, issuedAt, publicKey, payload) ' +
                    'VALUES (?, ?, ?, ?, ?)',
                    [keyId, user, issuedAt, publicKey, JSON.stringify(payload)]
                    );

                    db.run('CREATE TABLE IF NOT EXISTS jsonwebtokens_old (' +
                    'id INTEGER PRIMARY KEY ASC,' +
                    'keyId TEXT UNIQUE,' + // public id (kid in JWT terms).
                    'user INTEGER,' +
                    'issuedAt DATE,' +
                    'publicKey TEXT,' +
                    'payload TEXT' +
                    ');'
                    );
                    db.run('CREATE TABLE IF NOT EXISTS tokens_old (' +
                    'id INTEGER PRIMARY KEY ASC,' +
                    'keyId TEXT UNIQUE,' + // public id (kid in JWT terms).
                    'tokens TEXT UNIQUE' +
                    ');'
                    );

                });
              },

              dataRemove : async function(id){
                db.run(`DELETE FROM jsonwebtokens WHERE id=?`, id, function(err) {
                    if (err) {
                    return console.error(err.message);
                    }
                    console.log(`Row(s) deleted ${this.changes}`);
                });
              }

};


module.exports = dbUI;

function extract_string(message_str) {
  let reg=new RegExp(/"/, "g");
  let tableau=message_str.split(reg);
  return tableau;
};

function extend(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
      for (var prop in source) {
          target[prop] = source[prop];
      }
  });
  return target;
}

/*db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});*/
const asn1 = require('asn1.js');
const crypto = require('crypto');
const {v4: uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
let myDb = require('./Database.js');
//let myDB2 = require('/home/pi/mozilla-iot/gateway/src/models/jsonwebtoken.js')

///home/pi/.mozilla-iot/config/db.sqlite3
/**
 * Code below is taken from Mozilla IoT gateway implementation:
 * https://github.com/mozilla-iot/gateway/blob/c0d902829a410a5ec4feb5379ac04de0161552f1/src/ec-crypto.ts#L29
 */

/**
 * This curve goes by different names in different standards.
 *
 * These are all equivilent for our uses:
 *
 * prime256v1 = ES256 (JWT) = secp256r1 (rfc5480) = P256 (NIST).
 */
const CURVE = 'prime256v1';
const ROLE_USER_TOKEN = 'user_token';
let tunnelEndpoint;


// https://tools.ietf.org/html/rfc5915#section-3
const ECPrivateKeyASN = asn1.define('ECPrivateKey', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('privateKey').octstr(),
    this.key('parameters').explicit(0).objid().optional(),
    this.key('publicKey').explicit(1).bitstr().optional()
  );
});

// https://tools.ietf.org/html/rfc3280#section-4.1
const SubjectPublicKeyInfoASN = asn1.define('SubjectPublicKeyInfo', function() {
  this.seq().obj(
    this.key('algorithm').seq().obj(
      this.key('id').objid(),
      this.key('namedCurve').objid()
    ),
    this.key('pub').bitstr()
  );
});

// Chosen because it is _must_ implement.
// https://tools.ietf.org/html/rfc5480#section-2.1.1
const UNRESTRICTED_ALGORITHM_ID = [1, 2, 840, 10045, 2, 1];
// https://tools.ietf.org/html/rfc5480#section-2.1.1.1 (secp256r1)
const SECP256R1_CURVE = [1, 2, 840, 10045, 3, 1, 7];

/**
 * Generate a public/private key pair.
 *
 * The returned keys are formatted in PEM for use with openssl (crypto).
 *
 * @return {Object} .public in PEM. .prviate in PEM.
 */
function generateKeyPair() {
  const key = crypto.createECDH(CURVE);
  key.generateKeys();

  const priv = ECPrivateKeyASN.encode({
    version: 1,
    privateKey: key.getPrivateKey(),
    parameters: SECP256R1_CURVE
  }, 'pem', {
    // https://tools.ietf.org/html/rfc5915#section-4
    label: 'EC PRIVATE KEY'
  });

  const pub = SubjectPublicKeyInfoASN.encode({
    pub: {
      unused: 0,
      data: key.getPublicKey()
    },
    algorithm: {
      id: UNRESTRICTED_ALGORITHM_ID,
      namedCurve: SECP256R1_CURVE
    }
  }, 'pem', {
    label: 'PUBLIC KEY'
  });
  return { public: pub, private: priv };
}

function issueOAuthToken(client, user, payload) {
    const {sig, token} = create(user, Object.assign({
      client_id: client,
    }, payload));
    //console.log({sig, token});//await Database.createJSONWebToken(token);
    myDb.dataStorage_SQLite(token, sig);
    return sig;
  }


function create(user, payload = {role: ROLE_USER_TOKEN}) {
    const pair = generateKeyPair();
    const JWT_ALGORITHM = 'ES256';
    const keyId = uuidv4();
    //const tunnelInfo = await Settings.getTunnelInfo();
    const issuer = tunnelEndpoint;//tunnelInfo.tunnelDomain;
    const options = {
      algorithm: JWT_ALGORITHM,
      keyid: keyId,
    };
    if (issuer) {
      options.issuer = issuer;
    }

    const sig = jwt.sign(payload, pair.private, options);

    const token = {
      user,
      issuedAt: new Date(),
      publicKey: pair.public,
      keyId,
      payload,
    };

    return {sig, token};
  }


  function _tunnelEndPoint() {
    return new Promise(resolve => {  
        myDb.getTunnelEndpoint(function(reponse){
                //console.log(reponse);
                tunnelEndpoint = reponse;
                resolve(tunnelEndpoint);
        });
    });
  }

  function _dataRemove(id) {
    return new Promise(resolve => {
        myDb.dataRemove(id);
        resolve('done');
    });
  }

  function enableToken_(keyid) {
    return new Promise(resolve => {
        myDb.enableToken(keyid);
        resolve('done');
    });
  }

  function disableToken_(keyid) {
    return new Promise(resolve => {
        myDb.disableToken(keyid);
        resolve('done');
    });
  }

  function getSensors_() {
    return new Promise(resolve => {
        let mydata = myDb.sensRead(function(reponse){
            //console.log(reponse);
            resolve(reponse);
        }) 
    });
  }

  function getEnabledApps_() {
    return new Promise(resolve => {
        let mydata_ = myDb.readEnableApps(function(reponse){
          //console.log(reponse);
          resolve(reponse);
        })});
  }

  function getDisabledApps_() {
    return new Promise(resolve => {
        let mydata__ = myDb.readDisableApps(function(reponse){
          //console.log(reponse);
          resolve(reponse);
        })});
  }

  function clearDatabase_() {
    return new Promise(resolve => {
        let mydata__ = myDb.clearApps()
          resolve("done");
        });
  }



  
let application = {

    getSensors : async function(){
        let sensorTab = [];
        let sensor = await getSensors_();
        //return sensor[0].id;
        for(let i = 0; i<sensor.length; i++){
            //let data = JSON.parse(sensor[i].id)
            sensorTab.unshift(sensor[i].id);
            //console.log(sensorTab);
        }
        let data_ = sensorTab;
        //console.log(`${ data } `);
        return data_;
    },

    getToken : async function(name, user, payload){
      console.log(`i am !!`);
        tunnelEndpoint = await _tunnelEndPoint();
        
        let data = await issueOAuthToken(name, user, payload);
        console.log(`${ data }`);
        
        return data;
    },

    getEnabledApps : async function(){
      let enableApps = await getEnabledApps_();
      //console.log(enableApps);
      return enableApps;
    },

    getDisabledApps : async function(){
      let disableApps = await getDisabledApps_();
      //console.log(enableApps);
      return disableApps;
    },

    update : async function(enable, disable){
      for(let j = 0; j<enable.length; j++){
          console.log(enable[j]);
          disableToken_(enable[j]);
      };
      for(let h = 0; h<disable.length; h++){
        console.log(disable[h]);
        enableToken_(disable[h]);
      };
    },

    updateEnableToDisable : async function(enable){
        for(let j = 0; j<enable.length; j++){
            console.log(enable[j]);
            disableToken_(enable[j]);
        }
    },

    updateDisableToEnable : async function(disable){
        for(let h = 0; h<disable.length; h++){
            console.log(disable[h]);
            enableToken_(disable[h]);
        }
    },

    clearDatabase : async function(){
      clearDatabase_();
    }
};

module.exports = application;
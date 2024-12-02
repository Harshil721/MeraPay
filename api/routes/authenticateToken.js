const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    try {
        //console.log("YO MAN");
        var token = req.headers['authorization'];
        //console.log(token);
        var decoded = jwt.verify(token, 'key@merape.Merape');
        //console.log("CORRECT TOKEN : " + JSON.stringify(decoded));
        req.tokenUid = decoded["id"];
        next()

      } catch(err) {
        //console.log("WRONG TOKEN");
        res.status(500).json({
            message : "Not Auth"
        });
      }
  }

exports.authenticateToken = authenticateToken;
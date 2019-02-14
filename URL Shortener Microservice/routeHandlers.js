let { Counters, UrlTypes } = require('./models.js');

let dns = require('dns');

function updateCounter (req, res, callback) {
  
  Counters
    .findOneAndUpdate({}, {$inc:{'count': 1}},function(err, data) {
      if (err) return;
      if (data) {
        callback(data.count);
      } else {
        let newCounter = new Counters();
        newCounter
          .save(function(err) {
            if (err) return;
            Counters
              .findOneAndUpdate({}, {$inc:{'count': 1}},function(err, data) {
                if (err) return;
                callback(data.count);
              });
          });
      }
    });
}


let protocolRegExp = /^https?:\/\/(.*)/i;
let hostnameRegExp = /^([a-z0-9\-_]+\.)+[a-z0-9\-_]+/i;

exports.saveUrl = function (req, res) {
  
    let url = req.body.url;
    if ( url.match(/\/$/i))
      url = url.slice(0,-1);
    
    let protocolMatch = url.match(protocolRegExp);
    if (!protocolMatch) {
      return res.json({"error": "invalid URL"});
    }
    
    let hostAndQuery = protocolMatch[1];
    let hostnameMatch = hostAndQuery.match(hostnameRegExp);
  
    if (hostnameMatch) {
    
      dns.lookup(hostnameMatch[0], function(err) {
        if(err) {
          
          res.json({"error": "invalid Hostname"});
        } else {
          
          UrlTypes
            .findOne({"url": url}, function(err, storedUrl) {
              if (err) return;
              if (storedUrl) {
                
                res.json({"original_url": url, "short_url": storedUrl.index});
              } else {
                
                updateCounter(req, res, function(cnt) {
                  let newUrlEntry = new UrlTypes({
                    'url': url,
                    'index': cnt
                  });
                  
                  newUrlEntry
                  .save(function(err) {
                    if (err) return;
                    res.json({"original_url": url, "short_url": cnt});
                  });
                });
              }
            });
          }
        });
      } else {
        
        res.json({"error": "invalid URL"});
      }
    };

exports.processUrl = function (req, res) {
    let shorturl = req.params.shorturl;
    if (!parseInt(shorturl,10)) {
      
      res.json({"error":"Wrong Format"});
      return;
    }
    UrlTypes
      .findOne({"index": shorturl}, function (err, data) {
        if (err) return;
        if (data){
          
          res.redirect(data.url);
        } else {
          res.json({"error":"No short url found for given input"});
        }
      });
  };

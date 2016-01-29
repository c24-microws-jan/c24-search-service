const cdCache = require('../cdCache');
var cds;

var getCd = function (id, cb) {
  cds = cdCache.getCDs();
  response = cds.filter(function (cd) {
    return id === cd.id;
  })
  cb(null, response);
};

var getCds = function (query, cb) {
  cds = cdCache.getCDs();
  if (query.query) {
    response = cds.filter(function (cd) {
      return containsString(cd.title || '', query.query) || containsString(cd.name || '', query.query);
    });
    cb(null, response || cds)
  } else {
    cb(null, cds);
  }
};

var getMostRecentCds = function (params, cb) {
  cds = cdCache.getCDs();
  if (cds.length > 50)
    cb(null, cdMostRecentDataArray);
};

function containsString(a, b) {
  a = '' + a.toLowerCase();
  b = '' + b.toLowerCase();
  return b !== '' && a.indexOf(b) > -1;
}
module.exports = {
  getCd: getCd,
  getCds: getCds,
  getMostRecentCds: getMostRecentCds
}


var cds = require('../cdCache').getCDs();

var getCd = function (id, cb) {
  response = cds.filter(function (cd) {
    return id === cd.id;
  })
  cb(null, response);
};

var getCds = function (query, cb) {
  if (query.query) {
    response = cds.filter(function (cd) {
      return containsString(cd.title || '', query.query) || containsString(cd.artist || '', query.query);
    });
    cb(null, response || cds)
  }else if (query.limit || query.offset) {
    response = cds
    cb(null, response || cds)
  } else {
    cb(null, cds);
  }
};

var getMostRecentCds = function (params, cb) {
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


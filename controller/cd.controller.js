var cds = ['1', '2'] //require('../cdCache');

var getCd = function (id, cb) {
  response = cds.filter(function (cd) {
    console.log(id, cd)
    return id === cd;
  })
  cb(null, response);
};

var getCds = function (params, cb) {
  cb(null, cds);
};

var getMostRecentCds = function (params, cb) {
  cb(null, cdMostRecentDataArray);
};


module.exports = {
  getCd: getCd,
  getCds: getCds,
  getMostRecentCds: getMostRecentCds
}


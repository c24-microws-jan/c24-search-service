const http = require('http');
const CONSUL_IP = '46.101.193.82';
const CONSUL_PORT = 8500;
const CONSUL_CATALOG_SERVICE_HEALTH_QUERY_PATH = '/v1/health/service/c24-catalog-service';

var cds;
var syncInterval;

function getCatalogEndpoint(callback) {
  http.get({
    hostname: CONSUL_IP,
    port: CONSUL_PORT,
    path: CONSUL_CATALOG_SERVICE_HEALTH_QUERY_PATH
  }, (res) => {
    var data = '';

    res.on('error', function(err) {
      callback(err);
    });

    //another chunk of data has been recieved, so append it to `str`
    res.on('data', function(chunk) {
      data += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    res.on('end', function() {
      var json = JSON.parse(data);
      callback(null, {
        ip: json[0].Service.Address,
        port: json[0].Service.Port
      });
    });
  });
}

function syncCDs() {
  getCatalogEndpoint(function(err, endpoint) {
    if (err) {
      console.error('Failed to retrieve catalog endpoint: ' + err);
      return;
    }

    http.get({
      hostname: endpoint.ip,
      port: endpoint.port
    }, function(res) {
      var data = '';

      res.on('error', function(err) {
        console.error('Failed to retrieve catalog data: ' + err);
        return;
      });

      //another chunk of data has been recieved, so append it to `str`
      res.on('data', function(chunk) {
        data += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      res.on('end', function() {
        cds = JSON.parse(data);
      });
    });
  });
}

function getCDs() {
  if (!(cds && syncInterval)) {
    syncInterval = setInterval(syncCDs, 10000);
  }

  return cds || [];
}

function destroy() {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
}

module.exports = {
  syncCDs: syncCDs,
  getCDs: getCDs,
  destroy: destroy
};

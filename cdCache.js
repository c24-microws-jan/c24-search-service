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
        cds = JSON.parse(data) || mockData;
      });
    });
  });
}

function getCDs() {
  if (!(cds && syncInterval)) {
    syncInterval = setInterval(syncCDs, 10000);
  }

  return cds || mockData;
}

function destroy() {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
}

var mockData = [
  {
    artist: 'Rammstein',
    name: 'Mutter',
    trackCount: 16,
    id: 'fb3-14',
    images: {
      small: '',
      large: ''
    },
    date: '2004-02-02',
    label: 'Bla Records'
  },
  {
    artist: 'Metallica',
    name: 'Master of Puppets',
    trackCount: 8,
    id: 'fed37cfc-2a6d-4569-9ac0-501a7c7598eb',
    images: {
      small: '',
      large: ''
    },
    date: '1986-03-03',
    label: 'Elektra'
  },
  {
    artist: 'Metallica',
    name: 'Ride the Lightning',
    trackCount: 8,
    id: '456efd39-f0dc-4b4d-87c7-82bbc562d8f3',
    images: {
      small: '',
      large: ''
    },
    date: '1989',
    label: 'Vertigo'
  },
  {
    artist: 'f9be3361-c1e1-48e1-8167-f19a54f719f2',
    name: 'Americana',
    trackCount: 13,
    id: 'f9be3361-c1e1-48e1-8167-f19a54f719f2',
    images: {
      small: '',
      large: ''
    },
    date: '1998-11',
    label: 'Columbia'
  }
];

module.exports = {
  syncCDs: syncCDs,
  getCDs: getCDs,
  destroy: destroy
};

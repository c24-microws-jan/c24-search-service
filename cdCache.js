const http = require('http');
const md5 = require('crypto').createHash('md5');
const CONSUL_IP = '46.101.193.82';
const CONSUL_PORT = 8500;
const CONSUL_CATALOG_SERVICE_HEALTH_QUERY_PATH = '/v1/health/service/c24-catalog-service';

var cds;
var syncInterval;
var cdHash;

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
        const hash = md5.update(data);
        if (hash !== cdHash) {
          cds = mapCatalogData(JSON.parse(data));
          cdHash = hash;
        }
      });
    });
  });
}

function mapCatalogData(catalog) {
  return catalog.map(function(catalogItem) {
    var cd = {
      id: catalogItem.release.id || ''
    };
    if ('artist-credit' in catalogItem.release && catalogItem.release['artist-credit'].length > 0) {
      cd.artist = catalogItem.release['artist-credit'][0].name || '';
    }

    if ('title' in catalogItem.release) {
      cd.name = catalogItem.release.title || '';
    }

    if ('media' in catalogItem.release && catalogItem.release.media.length > 0 && 'track-count' in catalogItem.release.media[0]) {
      cd.trackCount = catalogItem.release.media[0]['track-count'] || '';
    }

    if ('images' in catalogItem && catalogItem.images.length > 0 &&
       'images' in catalogItem.images[0] && catalogItem.images[0].images.length > 0 &&
       'thumbnails' in catalogItem.images[0].images[0]) {
      cd.images = {
        small: catalogItem.images[0].images[0].thumbnails.small || '',
        large: catalogItem.images[0].images[0].thumbnails.large || ''
      };
    }

    if ('date' in catalogItem.release) {
      cd.date = catalogItem.release.date || '';
    }

    if ('label-info' in catalogItem.release && catalogItem.release['label-info'].length > 0 &&
        'label' in catalogItem.release['label-info'][0] &&
        'name' in catalogItem.release['label-info'][0].label) {
      cd.label = catalogItem.release['label-info'][0].label.name || '';
    }

    return cd;
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
    artist: 'The Offspring',
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

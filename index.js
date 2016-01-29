const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const cdCache = require('./cdCache');
//cdCache.syncCDs();

var cdController = require('./controller/cd.controller');
// Define some default values if not set in environment
const PORT = process.env.PORT || 3000;
const SHUTDOWN_TIMEOUT = process.env.SHUTDOWN_TIMEOUT || 10000;
const SERVICE_CHECK_HTTP = process.env.SERVICE_CHECK_HTTP || '/healthcheck';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Add health check endpoint
app.get(SERVICE_CHECK_HTTP, function (req, res) {
  res.json({message: 'OK'});
});

// Add all other service routes
app.get('/', function (req, res) {
  console.log('GET /');
  res.send('Hello Search Service');
});

app.get('/cd/:id', function (req, res, next) {
  cdController.getCd(req.params.id, function (err, data) {
    if (err) {
      return next(err)
    }
    if (!data.length) {
      return res.sendStatus(404);
    }
    res.json(data);
  });

});

app.get('/cd', function (req, res) {
  cdController.getCds(req.params, function (err, data) {
    if (err) {
      return next(err)
    }
    res.json(data);
  });
});

app.get('/cd/most_recent', function (req, res) {
  cdController.getMostRecentCds(req.params, function (err, data) {
    if (err) {
      return next(err)
    }
    res.json(data);
  });
});

// Start the server
const server = app.listen(PORT);

console.log(`Service listening on port ${PORT} ...`);

////////////// GRACEFUL SHUTDOWN CODE ////

const gracefulShutdown = function () {
  cdCache.destroy();
  console.log('Received kill signal, shutting down gracefully.');

  // First we try to stop the server smoothly
  server.close(function () {
    console.log('Closed out remaining connections.');
    process.exit();
  });

  // After SHUTDOWN_TIMEOUT we will forcefully kill the process in case it's still running
  setTimeout(function () {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit();
  }, SHUTDOWN_TIMEOUT);
};

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);

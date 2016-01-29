const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

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

app.post('/', function (req, res) {
  console.log('POST /', JSON.stringify(req.body));
  res.status(201).end();
});

app.get('/cd/:id', function (req, res) {
  var data = {
    id: req.params.id,
    title: 'Mock Title',
    artist: 'Mock Artist',
    cover: {
      small: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-250.jpg',
      large: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-500.jpg'
    }
  };
  res.json(data);
});

app.get('/cd', function (req, res) {
  var data = [
    {
      id: 1,
      title: 'Mock Title1',
      artist: 'Mock Artist',
      cover: {
        small: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-250.jpg',
        large: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-500.jpg'
      }
    },{
      id: 2,
      title: 'Mock Title2',
      artist: 'Mock Artist',
      cover: {
        small: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-250.jpg',
        large: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-500.jpg'
      }
    },{
      id: 3,
      title: 'Mock Title3',
      artist: 'Mock Artist',
      cover: {
        small: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-250.jpg',
        large: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-500.jpg'
      }
    },{
      id: 4,
      title: 'Mock Title4',
      artist: 'Mock Artist',
      cover: {
        small: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-250.jpg',
        large: 'http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/829521842-500.jpg'
      }
    }
  ];
  res.json(data);
});


// Start the server
const server = app.listen(PORT);

console.log(`Service listening on port ${PORT} ...`);


////////////// GRACEFUL SHUTDOWN CODE ////

const gracefulShutdown = function () {
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

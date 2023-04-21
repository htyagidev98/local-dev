const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

/**
 * [Application Route]
 */

var VERSIONS = {'Pre-Production': '/v0', 'Version 1': '/v1'};

// route to display versions
app.get('/', function(req, res) {
    res.json(VERSIONS);
})

app.listen(4000, function() {
  console.log('Listening on port 4000...')
});


// versioned routes go in the routes/ directory
// import the routes
/*for (var k in VERSIONS) {
    app.use(VERSIONS[k], require('./routes' + VERSIONS[k]));
}*/
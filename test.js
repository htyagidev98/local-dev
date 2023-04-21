const mongoose = require('mongoose');
const Schema = mongoose.Schema
mongoose.connect("mongodb://localhost/test");

const AutomakerSchema = new Schema({
    maker: {
        type:String,
    },
    logo: {
        type:String,
    },
});

AutomakerSchema.set('toObject', { virtuals: true });
AutomakerSchema.set('toJSON', { virtuals: true });


const Automaker = mongoose.model('Automaker', AutomakerSchema, 'Automaker');

// http server 
var express    = require('express');        
var app        = express();                 

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// endpoints
var router = express.Router();   

router.get('/', function(req, res) {
    var entity = new Automaker();
    entity.maker = "Figured out what the problem was. By default, the virtual fields are not included in the output. After adding this in circle schema:";
    entity.logo = '5a602e62af387f02df95a730';
    entity.save(function(error) {
        if (error)
            res.send(error);

        res.json({ message: 'created' });
    });
});

app.use('/', router);

// starting http server...
const port = 4000; 
app.listen(port);
console.log('listening port: ' + port);
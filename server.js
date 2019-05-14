const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('express-flash');
var session = require('express-session');

mongoose.connect('mongodb://localhost/basic_mongoose');
var MySchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2},
    food: { type: String, required: true, minlength: 2}
    }, {timestamps: true}
)

mongoose.model('Animal', MySchema); 
var Animal = mongoose.model('Animal') 

app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash());

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    Animal.find({}).sort({createdAt: -1}).exec(function(err, mongooses) {
        if (err) return handleError(err);
        res.render('index', {mongoo: mongooses});
    })
})

app.get('/mongooses/new', function(req, res) {
    res.render('new');
})

app.post('/mongooses', function(req, res) {
    console.log("POST DATA", req.body);
    var mongoo = new Animal({name: req.body.name, food: req.body.food});
    mongoo.save(function(err) {
        if(err) {
            console.log('something went wrong');
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
        } else { 
            console.log('successfully added a mongoo!');
        }
        res.redirect('/');
    })
})

app.get('/mongooses/:id', function(req, res) {
    Animal.findOne({_id: req.params.id}, function(err, mongooses) {
        if (err) return handleError(err);
        res.render('view', {mongoo: mongooses});
    })
})

app.get('/mongooses/update/:id', function(req, res) {
    Animal.findOne({_id: req.params.id}, function(err, mongooses) {
        if (err) return handleError(err);
        res.render('update', {mongoo: mongooses});
      })
})

app.post('/mongooses/:id', function(req, res) {
    console.log("POST DATA", req.body);
    Animal.findOne({_id: req.params.id}, function(err, mangoose){
        mangoose.name = req.body.name;
        mangoose.food = req.body.food;
        mangoose.save(function(err){
            if(err) {
                console.log('something went wrong');
                for(var key in err.errors){
                    req.flash('update', err.errors[key].message);
                }
            } else { 
                console.log('successfully updated a mongoo!');
            }
            res.redirect('/mongooses/'+req.params.id);
        })
    })
})

app.get('/mongooses/delete/:id', function(req, res) {
    Animal.remove({_id: req.params.id}, function(err){
        if(err) {
            console.log('something went wrong');
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
        } else { 
            console.log('successfully deleted!');
        }
        res.redirect('/');
    })
})

app.listen(8000, function() {
    console.log("listening on port 8000");
});
const express  = require('express');
const path     = require('path');
const ejsMate  = require('ejs-mate');

const app = express();

// mongoose.connect("mongodb://localhost/floraview");

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/company', (req, res) => {
    res.render('company');
});

app.get('/pricing', (req, res) => {
    res.render('pricing');
});

app.get('/product', (req, res) => {
    res.render('product');
});

app.get('/useCases', (req, res) => {
    res.render('useCases');
});

app.get('/signIn', (req, res) => {
    res.render('signIn');
});

app.listen(3000, () => {
    console.log('Floraview server started on port 3000');
});

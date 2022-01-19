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

app.get('/mainPage/company', (req, res) => {
    res.render('mainPage/company');
})

app.get('/mainPage/pricing', (req, res) => {
    res.render('mainPage/pricing');
})

app.get('/mainPage/product', (req, res) => {
    res.render('mainPage/product');
})

app.get('/mainPage/useCases', (req, res) => {
    res.render('mainPage/useCases');
})

app.get('/dashboard/dashHome', (req, res) => {
    res.render('dashboard/dashHome');
})

app.get('/dashboard/guide', (req, res) => {
    res.render('dashboard/guide');
})

app.get('/dashboard/support', (req, res) => {
    res.render('dashboard/support');
})

app.listen(3000, () => {
    console.log('Floraview server started on port 3000');
});

const express    = require('express')
const path       = require('path')
const ejsMate    = require('ejs-mate')
const mongoose   = require('mongoose')
const bodyParser = require("body-parser")

const app = express()

const Classroom = require('./models/classroom')

mongoose.connect("mongodb://localhost:27017/classrooms")
    .then(() => {
        console.log("MONGODB CONNECTION OPEN")
    })
    .catch(err => {
        console.log("MONGODB CONNECTION REFUSED");
        console.log(err)
    })

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'views')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

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

app.get('/classrooms', async (req, res) => {
    const classrooms = await Classroom.find({})
    console.log(classrooms)
    res.send(classrooms)
})

app.post('/classrooms', async (req, res) => {
    const newClassroom = new Classroom(req.body)
    await newClassroom.save()
    .then(() => {
        console.log(newClassroom)
    })
    .catch(err => {
        console.log("error adding to DB")
        console.log(err)
    })
    res.send(newClassroom)
})

app.listen(3000, () => {
    console.log('Floraview server started on port 3000');
})

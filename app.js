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
    res.render('home')
})

app.get('/company', (req, res) => {
    res.render('company')
})

app.get('/pricing', (req, res) => {
    res.render('pricing')
})

app.get('/product', (req, res) => {
    res.render('product')
})

app.get('/useCases', (req, res) => {
    res.render('useCases')
})

app.get('/signIn', (req, res) => {
    res.render('signIn')
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
    console.log('Floraview server started on port 3000')
})

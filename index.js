const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const Routes = require('./routes')
const cors = require('cors')
const http = require('http')

let server = null


require('dotenv').config()

mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err))

const port = process.env.PORT
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/user', Routes)

server = http.createServer(app)

server.listen(port, host, () => console.log(`Server started on port ${port} host ${host}`))


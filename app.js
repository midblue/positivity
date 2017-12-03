const express = require('express')
const app = express()
const api = require('./routes/api.js')

app.use(express.static('public'))
app.use('/api', api)

const server = app.listen(8080, '127.0.0.1', function () {
    const host = server.address().address
    const port = server.address().port
    console.log('running at http://' + host + ':' + port)
})
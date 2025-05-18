const express = require('express')
const employee_routes = require('./routes/routes')
var cors = require('cors')
const app = express()
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3001
app.use('/',employee_routes)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})  
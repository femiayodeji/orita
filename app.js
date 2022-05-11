const express = require('express');
const { env } = require('process');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');

const port = process.env.PORT || 3000;
server.listen(port);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

console.log("connected and listening at http://localhost:%s", port);
// app.js 수정
const http = require('http');
const mongojs = require('mongojs');
const db = mongojs('vehicle', ['car']);
const express = require('express');
const app = express();
const path = require('path');

app.set('port', 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/car', (req, res) => {
    db.car.find(function (err, data) {
        req.app.render('CarList', { carList: data }, (err, html) => {
            if (err) throw err;
            res.end(html);
        });
    });
})

const server = http.createServer(app);

server.listen(app.get('port'), () => {
    console.log(`서버 실행 중 http://localhost:${app.get('port')}`);
});
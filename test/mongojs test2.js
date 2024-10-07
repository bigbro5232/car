// app.js 수정
const http = require('http');
const mongojs = require('mongojs');
const db = mongojs('vehicle', ['car']);

const server = http.createServer((req, res) => {
    db.car.find(function (err, data) {
        let html = "<table border='1'>";
        data.forEach((car, idx) => {
            html += `<tr><td>${car.name}</td>
                <td>${car.price}</td>
                <td>${car.company}</td>
                <td>${car.year}</td></tr>`;
        });
        html += "</table>";
        res.end(html);
    });
});

server.listen(3000, () => {
    console.log('서버 실행 중 http://localhost:' + 3000);
});
const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(path.join(__dirname, "public")));

app.set('port', 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

// db 준비 및 연동
const dbClient = new MongoClient("mongodb://localhost:27017");
const dbName = "vehicle";
const collectionName = "car";

// 목록 출력
app.get('/car', async (req, res) => {
    try {
        await dbClient.connect();
        const db = dbClient.db(dbName);
        const cars = db.collection(collectionName);
        const cursor = cars.find({}, { sort: { name: 1 }, projection: {} });

        const carList = await cursor.toArray();
        req.app.render('CarList', { carList: carList }, (err, html) => {
            if (err) throw err;
            res.end(html);
        });
    } finally {
        await dbClient.close();
    }
});

// DB에 데이터 저장
app.post('/car', async (req, res) => {
    try {
        await dbClient.connect();
        const db = dbClient.db(dbName);
        const cars = db.collection(collectionName);
        const { name, price, company, year } = req.body;
        await cars.insertOne(req.body);
        res.redirect('/car');
    } finally {
        dbClient.close();
    }
});

app.post('/car/modify', async (req, res) => {
    try {
        await dbClient.connect();
        const { id, name, price, company, year } = req.body;
        const db = dbClient.db(dbName);
        const cars = db.collection(collectionName);
        await cars.updateOne({ _id: new ObjectId(id) }, { $set: { name, price, company, year } }, { upsert: true });
        res.redirect('/car');
    } finally {
        dbClient.close();
    }
});

app.post('/car/detail', async (req, res) => {
    try {
        await dbClient.connect();
        const { carRewards } = req.body;
        const { rewardId, detail } = carRewards[0];
        const db = dbClient.db(dbName);
        const cars = db.collection(collectionName);
        await cars.insertOne(req.body);
    } finally {
        dbClient.close();
    }
});
// 단순 forward 처리 함수
const forward = (req, res, target, obj) => {
    req.app.render(target, obj, (err, html) => {
        if (err) throw err;
        res.end(html);
    });
}

// 새 데이터 입력 페이지로 forward
app.get('/car/input', (req, res) => {
    forward(req, res, 'CarInput', {});
});

// 상세보기 페이지로 forward
app.get('/car/detail', async (req, res) => {
    // 파라미터로 id를 받고 
    // id와 같은 car를 db에서 검색
    try {
        await dbClient.connect();
        const db = dbClient.db(dbName);
        const cars = db.collection(collectionName);
        const car = await cars.findOne({ _id: new ObjectId(req.query.id) }, {});
        const cursor = cars.find(
            { "carRewards._id": { $exists: true } },
            { projection: { "carRewards._id": 1, "carRewards.detail": 1, _id: 0 } }
        );
        const results = await cursor.toArray();
        // 사용자 정의 forward 함수 사용.
        forward(req, res, 'CarDetail', { car, carRewards: results });
    } finally {
        await dbClient.close();
    }
});


// 수정 페이지로 forward
app.get('/car/modify', async (req, res) => {
    try {
        await dbClient.connect();
        const db = dbClient.db(dbName);
        const cars = db.collection(collectionName);
        const car = await cars.findOne({ _id: new ObjectId(req.query.id) }, {});
        forward(req, res, 'CarModify', { car });
    } finally {
        await dbClient.close();
    }
});

// car 삭제 후 list로 redirection
app.get('/car/delete', async (req, res) => {
    try {
        await dbClient.connect();
        const db = dbClient.db(dbName);
        const cars = db.collection(collectionName);
        await cars.deleteOne({ _id: new ObjectId(req.query.id) });
        res.redirect("/car");
    } finally {
        await dbClient.close();
    }
});

const server = http.createServer(app);
server.listen(app.get('port'), () => {
    console.log(`서버 실행 중 http://localhost:${app.get('port')}`);
});
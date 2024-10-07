const mongojs = require('mongojs');
const db = mongojs('vehicle', ['car']);

db.car.find(function(err, data) {
  console.log(data);
});

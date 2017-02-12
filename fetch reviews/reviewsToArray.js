var fs = require("fs");

var reviews = fs.readFileSync(__dirname + "/output_reviews.txt").toString();
var reviewsArray = reviews.split("\r\n");
var reviewsArrayString = JSON.stringify(reviewsArray);

fs.writeFileSync(__dirname + "/output_reviews-array.js", "var reviews = " + reviewsArrayString);
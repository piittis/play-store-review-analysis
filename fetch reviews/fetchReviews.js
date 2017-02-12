var request = require("request");
var fs = require("fs");
var cheerio = require("cheerio");
var outputStream = fs.createWriteStream("./output_reviews.txt");

var appId = process.argv[2];
var reviewCount = 0;
var reviewPage = 0;


function getNextPageOfReviews() {
    console.log("PAGE " + reviewPage);
    getReviews(reviewPage);
    reviewPage++;
}

function getReviews(pageNum) {

    var options = {
        method: "POST",
        url: "https://play.google.com/store/getreviews?authuser=0",
        form: {
            reviewType: 0,
            pageNum: pageNum,
            id: appId,
            reviewSortOrder: 0,
            hl: 'en',
            xhr: 1
        }
    };
    request(options, reviewsFetchCallback);
}

function reviewsFetchCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
		
        //json content starts at index 6
        var reviewsHtml = JSON.parse(body.slice(6))[0][2];

        if (reviewsHtml.length === 0) {
            console.log("no reviews found, check parameters");
        } else {
            //save it and try to fetch more
            parseAndWriteToFile(reviewsHtml);
            process.nextTick(getNextPageOfReviews);
        }

    } else {
        console.log("error", error);
        console.log("error", response);
    }
}

/**
 * parses the reviews from a result and writes them to the output
 */
function parseAndWriteToFile(reviewsHtml) {

    var $ = cheerio.load(reviewsHtml);

    var reviewTexts = $(".review-body");
    reviewTexts.each(function(index, element) {

        var text = processReviewText($(element).text());
        outputStream.write("\r\n" + text);
        reviewCount++;
        console.log(reviewCount);
    });
}

/**
* removes any unnecessary content from the review text
*/
function processReviewText(text) {
    return text.replace("Full Review", "").trim();
}


// start fetching reviews, will continue untill all are fetched or there is some error
console.log("fetching reviews for app with id: " + appId);
getNextPageOfReviews();
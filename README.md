# play-store-review-analysis

Simple app made mainly to test Vue.js. It's purpose is to fetch mobile 
app reviews from Google Play Store and give you a nice UI where you can
search for things that might be interesting to you as an app developer.

### Functionality is seperated into two folders:
* /fetch_reviews:
    * Contains a few NodeJS scripts. One to fetch reviews for a given appId (you can find the appId in the url for the store page).
      Another script to make a JavaScript array out of the fetched reviews.
* /explore_reviews:
    * A small Vue.js app that gives you a simple search UI for the reviews. Search functionality utilizes [Elasticlunr.js](https://github.com/weixsong/elasticlunr.js).
      You can search for whatever you like, or use predefined keywords. Keywords are chosen based on 
      [research](https://www.google.com "On the automatic classification of app reviews") that suggest they will indicate different review categories pretty decently. Should work fine upto hundreds of thousands of review texts.
      
      
UI:

![](https://raw.githubusercontent.com/piittis/play-store-review-analysis/master/ui-pic.PNG)

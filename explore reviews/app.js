/* global Vue, _, reviews, elasticlunr */

(function () {
    "use strict";

    var searchIndex;

    var app = new Vue({
        el: "#app",
        data: {
            query: "",
            indexConfig: {
                removeStopWords: false
            },
            searchConfig: {
                bool: "AND",
                expand: true
            },
            searchResults: []
        },
        watch: {
            query: _.debounce(function() {
                this.doSearch();
            }, 300),
            searchConfig: {
                handler: function() {
                    this.doSearch();
                },
                deep: true
            },
            indexConfig: {
                //reinitialize index and do search when config changes
                handler: function() {
                    var self = this;
                    _.defer(function() {
                        initializeSearchIndex();
                        self.doSearch();
                    });
                },
                deep: true
            }
        },
        methods: {
            doSearch: function () {

                console.time("query time");

                var tokens = this.query.trim().split(" ");
                var processedTokens = searchIndex.pipeline.run(tokens);//get stemmed tokens
                var addHighlight = getHighlighter(tokens, processedTokens)

                this.searchResults = searchIndex.search(this.query, this.searchConfig).map(function(result) {
                    return {
                        score: result.score,
                        text: addHighlight(reviews[parseInt(result.ref)])
                    };
                });

                console.timeEnd("query time");
            },
            setQuery: function(newQuery) {
                console.log("doQuery", arguments);
                this.query = newQuery;
            }
        }
    });
    
    /////

    initializeSearchIndex();

    function initializeSearchIndex() {

        console.time("index creation time");
        
        searchIndex = elasticlunr(function () {
            this.addField("text");
            this.setRef("id");
        });

        if (app.indexConfig.removeStopWords === false) {
            elasticlunr.clearStopWords()
        } else {
            elasticlunr.resetStopWords()
        }

        //reviews array defined in reviews-array.js
        _.forEach(reviews, function(reviewText, index) {
            searchIndex.addDoc({
                id: index,
                text: reviewText
            });
        });

        console.timeEnd("index creation time");
    }

    /**
     * returns a function that can be used to highlight relevant parts of the text
     */
    function getHighlighter(tokens, processedTokens) {

        var tokenMatchers = tokens.map(getTokenRegex);
        var processedTokenMatchers = _(processedTokens)
                                     .difference(tokens)//don't make duplicate matchers
                                     .map(getProcessedTokenRegex).value();
        return function (text) {
            var retVal = text;
            //first try to highlight the whole token that user entered
            _.forEach(tokenMatchers, function(matcher) {
                matcher.lastIndex = 0;
                //wrap the matched word in a highlight span
                retVal = retVal.replace(matcher, "<span class='highlight'>$1</span>");
            });
            //try to highlight a preprocessed token
            _.forEach(processedTokenMatchers, function(matcher) {
                matcher.lastIndex = 0;
                retVal = retVal.replace(matcher, "<span class='highlight'>$1</span>");
            });
            return retVal;
        }
    }

    /**
    * gets a regex that matches a given user given token
    */
    function getTokenRegex(token) {
        var token = token.replace(/\.|,|!|\?/,"")
        return new RegExp("\\b("+_.escapeRegExp(token)+")[!?.,]*\\b|\\b("+_.escapeRegExp(token)+")[!?.,]*$", "gi");
    }

    /**
    * gets a regex that matches a given processed (stemmed) token
    */
    function getProcessedTokenRegex(token) {
        return new RegExp("\\b("+_.escapeRegExp(token)+")", "gi");
    }

})();
console.log("The bot is starting");

var Twit = require('twit');
var config = require('./config');
var rita = require('rita');

var T = new Twit(config);

var allTweets;
var tweetArr = [];

var count = 10;

var mostRecentQuery = {
	screen_name: 'treeverb',
	count: 1,
	include_rts: false
};

var archiveQuery = {
	screen_name: 'treeverb',
	count: 200,
	include_rts: false,
	max_id: -1
};

setInterval(runEvanderBot, 1000 * 60);

function runEvanderBot() {
	T.get('statuses/user_timeline', mostRecentQuery, getMostRecentID);
}

function getMostRecentID(err, data, response) {
	if (err) {
		console.log(err);
	}
	// heldTweets.push(data[0].text);
	archiveQuery.max_id = data[0].id;
	T.get('statuses/user_timeline', archiveQuery, combine);
}

function combine(err, data, response) {
	if (err) {
		console.log(err);
	}

	//hold tweets from this GET
	var heldTweets = [];

	//add all except the last one - because we'll use it in the next search
	for (var i = 0; i < data.length-1; i++) {
		heldTweets.push(data[i].text);
		tweetArr.push(data[i].text);
	}

	// check to see if there is already an end of sentence punctuation, if not, add it
	// var regexEnd = /[.!?]/g;
	// for (i = 0; i < heldTweets.length; i++) {
		// if (regexEnd.test(heldTweets[i].charAt(heldTweets[i].length-1)) === false) {
			// heldTweets[i] += (".");
		// }
		// console.log(data[i].id + ":   " + heldTweets[i]);
	// }

	// add this GET's tweets to a single string, remove replies and urls
	// later add this to the total global one.
	var combinedTweets = heldTweets.join(" ");
	combinedTweets = combinedTweets.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
	combinedTweets = combinedTweets.replace(/@\w+\b/g, '');

	// add combined tweets to the total tweets string
	allTweets += combinedTweets;

	// save the last query to the next callback
	archiveQuery.max_id = data[data.length-1].id;
	// console.log(archiveQuery.max_id);

	

	if (count > 0) {
		count--;
		T.get('statuses/user_timeline', archiveQuery, combine);
	} else {
		//call the actual markov chain generation on the aggregated tweets
		// console.log(allTweets);

		
		var rm = new rita.RiMarkov(3, false, false);

		rm.loadText(allTweets);
	
		var tokens = rm.generateTokens(Math.floor(Math.random() * 20 + 1));
		var sentence = tokens.join(" ");

		for (i = 0; i < sentence.length - 1; i++) {
			if (sentence.charAt(i) === '.') {
				sentence = sentence.slice(0, i);
			}
		}
		// if (sentence.charAt(sentence.length-1) === '.') { //take out periods
		//	sentence = sentence.slice(0, sentence.length-1);
		// }

		var hashRegex = /(#)\s(\S+)/g;
		sentence = sentence.replace(hashRegex,'$1$2');

		var punctRegex = /["$&%-]/g;
		sentence = sentence.replace(punctRegex, '');

		var punctRegex2 = /\s(\W)/g;
		sentence = sentence.replace(punctRegex2, '$1');

		sentence = sentence.toLowerCase();

		console.log(sentence);
		postTweet(sentence);

		// var rm = new rita.RiMarkov(2);
		// var sentences = rm.generateSentences(5);
		

		// for (i = 0; i < sentences.length; i++) {
			
			// if (sentences[i].charAt(sentences[i].length-1) === '.') { //take out periods
			//	sentences[i] = sentences[i].slice(0, sentences[i].length-1);
			// }

			// var hashRegex = /(#)\s(\S+)/g;
			// sentences[i] = sentences[i].replace(hashRegex,'$1$2');

			// var punctRegex = /["$&%]/g;
			// sentences[i] = sentences[i].replace(punctRegex, '');

			// console.log(sentences[i]);
		// }

		// postTweet(sentences[0]);

		// console.log(tweetArr.length);
		// for (i = 0; i < tweetArr.length; i++) {
			// console.log(tweetArr[i]);
		// }
	}
}

function postTweet(content) {

	var tweet = {
		status: content
	};

	T.post('statuses/update', tweet, tweeted);

	function tweeted(err, data, response) {
		if (err) {
			console.log("Error: ");
			console.log(err);
		} else {
			console.log("Success");
		}
	}
}
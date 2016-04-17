console.log("The bot is starting");

var Twit = require('twit');
var config = require('./config');

var T = new Twit(config);

var arr = [0, 0, 0, 0];
var done = false;

// setInterval(runEvanderBot, 1000 * 60 * 60);
setInterval(run, 1000 * 60 * 10);

function run() {
  if (done === false) {
    // console.log(complete(arr));
    postTweet(complete(arr));
    recurse(0);
  }
}

function recurse(currentDigit) {
  // console.log(currentDigit);
  if (currentDigit >= arr.length) {
    done = true;
    console.log("DONE");
    return;
  }

  if (arr[currentDigit] < 255) {
    arr[currentDigit]++;
  } else {
    arr[currentDigit] = 0;
    var nextDig = currentDigit + 1;
    recurse(currentDigit + 1);
  }
}

function complete(a) {
  var s = a[3] + "." + a[2] + "." + a[1] + "." + a[0];
  return s;
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
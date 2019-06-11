function pad(n){ return n<10 ? '0'+n : n }

Parse.Cloud.afterSave("videos",function(request){

    request.log.info("after save videos");

    var saveNeeded = false;

    if(request.object.get("youtubeId")) {
      	request.log.info("youtubeId: " + request.object.get("youtubeId"));

      	var youtubeId = request.object.get("youtubeId");
        
        if(!request.object.get("image")) {
       		request.object.set("image", "http://i3.ytimg.com/vi/"+ youtubeId +"/maxresdefault.jpg");
       		saveNeeded = true;
        }
      	
      	if(!request.object.get("url")) {
 			request.object.set("url", "https://www.youtube.com/embed/"+ youtubeId +"");
 			saveNeeded = true;
   		}
      }

      if(request.object.get("title") && !request.object.get("shortUrl")) {

      	var users = request.object.get("users");
      	if(users) {
      		var userId = users[0];

    		var video = request.object;

    		request.log.info("user id: " + userId);

    		var title = video.get("title").toLowerCase();
      		var replacedTitle = title.split(' ').join('-');
      
            request.log.info("shortUrl: " + replacedTitle);

        	video.set("shortUrl", replacedTitle);
        	video.save();
	    } else {
	    	request.log.info("video has no users");
	    }
	  }
});


Parse.Cloud.afterSave("users",function(request){

    request.log.info("after save users");

    if(request.object.get("fullname") && !request.object.get("shortname")) {
        var username = request.object.get("fullname").toLowerCase();
      	var shortname = username.split(' ').join('');
        request.object.set("shortname", shortname);
        request.object.save();
      }
});

Parse.Cloud.job("addTodaysVideo", async (request) =>  {
    const Videos = Parse.Object.extend("videos");
    var TodaysVideo = Parse.Object.extend("todaysVideo");


    const query = new Parse.Query(Videos);
    var random = Math.floor((Math.random() * 200) + 1);
    console.log("random : " + random);
    query.skip(random);
    query.limit(1);
    const results = await query.find();

    if(results == null) {
      console.log("videoResults is nil");
    }

    var video = results[0];
    console.log(video);
    var videoId = video.id;
    console.log(videoId);

    const lastQuery = new Parse.Query(TodaysVideo);
    lastQuery.limit(1);
    lastQuery.descending("createdAt");
    const lastResults = await lastQuery.find();

    var lastVideo = lastResults[0];
    console.log(lastVideo);
    var lastVideoId = lastVideo.id;

    var getQuery = new Parse.Query(TodaysVideo);
    getQuery.get(lastVideoId)
    .then((last) => {
      
      console.log(last);
      var lastVideoDate = last.get("currentDate");
      lastVideoDate.setDate(lastVideoDate.getDate() + 1);
      console.log(lastVideoDate);

      var today = new TodaysVideo();
      today.set('videoId', videoId);
      today.set('currentDate', lastVideoDate);
      today.save(null, { useMasterKey: true });
      message("Successfully retrieved " + results);
    }, (error) => {
    });
});

Parse.Cloud.job("tubeTweet", async (request) =>  {
    // params: passed in the job call
    // headers: from the request that triggered the job
    // log: the ParseServer logger passed in the request
    // message: a function to update the status message of the job object
    const { params, headers, log, message } = request;
    message("I just started");
    message("post tweet function start");
    var now = new Date();
    message(now);
    message("post tweet function end");

    const Videos = Parse.Object.extend("videos");
    const query = new Parse.Query(Videos);
    query.limit(1);
    const results = await query.find();
    message("Successfully retrieved " + results);
});

Parse.Cloud.job("sendTodaysTweet", async (request) =>  {
    const { params, headers, log, message } = request;

    var now = new Date();
    y = now.getUTCFullYear();
    m = now.getUTCMonth() + 1;
    d = now.getUTCDate();
    var firstDay = new Date(y, m, d).getDate();
    var lastDay = new Date(y, m, d+1).getDate();
    var querydate = '"currentDate" : {""'+ y+'-'+pad(m)+'-'+firstDay+'T00:00:00Z' + "$lt : "+ y+'-'+pad(m)+'-'+lastDay+'T00:00:00Z';

    const TodaysVideo = Parse.Object.extend("todaysVideo");
    const query = new Parse.Query(TodaysVideo);
    query.limit(1);

    var firstDate = new Date(y+'-'+pad(m)+'-'+firstDay+'T00:00:00Z');
    var lastDate = new Date(y+'-'+pad(m)+'-'+lastDay+'T00:00:00Z');
    query.greaterThanOrEqualTo("currentDate", firstDate);
    query.lessThan("currentDate", lastDate);

    const results = await query.find()
      
    if(results == null) {
      status.error("todaysVideo is nil");
    }

    var video = results[0];
    console.log(video);
    var videoId = video.get("videoId");

    const Videos = Parse.Object.extend("videos");
    const videoQuery = new Parse.Query(Videos);
    videoQuery.limit(1);
    videoQuery.equalTo("objectId", videoId);

    const videoResults = await videoQuery.find()

    if(videoResults == null) {
      status.error("videoResults is nil");
    }

    var currentVideo = videoResults[0];

    // find conference
    var conferenceId = currentVideo.get("conferences");
    const Conferences = Parse.Object.extend("conferences");
    const conferenceQuery = new Parse.Query(Conferences);
    conferenceQuery.limit(1);
    conferenceQuery.equalTo("objectId", conferenceId);

    const conferenceResults = await conferenceQuery.find();
    var conference = conferenceResults[0];

    var shortUrl = 'http://www.swifttube.co/video/' + currentVideo.get("shortUrl");

    var meetupName = conference.get("fullname");

    if(conference.get("twitter") != null) {
      meetupName = "@" + conference.get("twitter");
    }

    // find users
    var users = currentVideo.get("users");
    const UsersTable = Parse.Object.extend("users");
    const usersQuery = new Parse.Query(UsersTable);
    usersQuery.containedIn("objectId", users);

    const userResults = await usersQuery.find();

    var username = "";
    for (let i = 0; i < userResults.length; i++) {
      var user = userResults[i];

      if(user.get("twitter") != null) {
        username += "@" + user.get("twitter");
      } else {
        username += user.get("fullname");
      }
      username += " ";
    }

    var tweet = "Today's video is 🥁🥁🥁\n";
    tweet += currentVideo.get("title");
    tweet += " by " + username + "at " + meetupName + " 🔥🔥🔥\n";
    tweet += "#iOSDev #swiftlang #swifttube\n";
    tweet += shortUrl;

    Parse.Cloud.httpRequest({
      method: 'POST',
      url: 'https://api.bufferapp.com/1/updates/create.json',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: {
        access_token: '1/03a22b23f2f87319d7dfdc1015284cf8',
        text: tweet,
        now: true,
        profile_ids: '5cda1e0160c00824bf4eb582'
      }
    });
        
    status.success();
});


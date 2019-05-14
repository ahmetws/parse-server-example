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

Parse.Cloud.job("sendTodaysTweet", (request) =>  {
    const { params, headers, log, message } = request;

    var statusText = ""
    statusText += "I just started sendTodaysTweet \n";

    statusText += "sendTodaysTweet - post tweet function start \n";
    var now = new Date();
    y = now.getUTCFullYear();
    m = now.getUTCMonth();
    d = now.getUTCDate();
    var firstDay = new Date(y, m, d).getDate();
    var lastDay = new Date(y, m, d+1).getDate();
    var querydate = '"currentDate" : {"$gt" : "'+y+'-'+m+'-'+firstDay+'T00:00:00Z" , "$lt" : "'+y+'-'+m+'-'+lastDay+' 00:00:00.000"}';
    statusText += querydate;
    statusText += "sendTodaysTweet - post tweet function end \n";

    const TodaysVideo = Parse.Object.extend("todaysVideo");
    const query = new Parse.Query(TodaysVideo);
    query.limit(1);
    query.greaterThan("currentDate", y+'-'+pad(m)+'-'+firstDay+'T00:00:00Z');
    query.lessThan("currentDate", y+'-'+pad(m)+'-'+lastDay+'T00:00:00Z');

    query.find().then(function (results) {

      statusText += results;
      statusText += "Successfully retrieved \n";
      
      if(results == nil) {
        status.error("todaysVideo is nil")
      }
      var videoId = results.get("videoId");

      const Videos = Parse.Object.extend("videos");
      const videoQuery = new Parse.Query(Videos);
      videoQuery.limit(1);
      videoQuery.equalTo("objectId", videoId);
      videoQuery.find().then(function (videoResults) {

        if(videoResults == nil) {
          status.error("videoResults is nil")
        }
        statusText += "Successfully retrieved video Result " + videoResults.length;
        var shortUrl = videoResults.get("shortUrl");
        var tweet = "Today's video is 🥁🥁🥁\n";
        tweet += videoResults.get("title");
        tweet += "by " + "@qdoug" + "at" + "@nslondonmeetup" + "🔥🔥🔥\n";
        tweet += "#iOSDev #swiftlang #swifttube";
    
        message(statusText);
  
        Parse.Cloud.httpRequest({
          method: 'POST',
          url: 'https://api.bufferapp.com/1/updates/create.json',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: {
            access_token: '1/03a22b23f2f87319d7dfdc1015284cf8',
            text: tweet,
            media: { 'link' : 'http://www.swifttube.co/video/'+ shortUrl},
            profile_ids: '5cda1e0160c00824bf4eb582'
          }
        });
        status.success();
      });
    });
});


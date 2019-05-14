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

Parse.Cloud.job("sendTodaysTweet", async (request) =>  {
    const { params, headers, log, message } = request;

    var status = ""
    status += "I just started sendTodaysTweet \n";

    status += "sendTodaysTweet - post tweet function start \n";
    var now = new Date();
    y = now.getFullYear(),
    m = now.getMonth()  
    d = now.getDay()
    var firstDay = new Date(y, m, d).getDate() ;
    var lastDay = new Date(y, m, d+1).getDate();
    var querydate = '"currentDate" : {"$gt" : "'+y+'-'+m+'-'+firstDay+' 00:00:00.000" , "$lt" : "'+y+'-'+m+'-'+lastDay+' 00:00:00.000"}';
    status += querydate;
    status += "sendTodaysTweet - post tweet function end \n";

    const TodaysVideo = Parse.Object.extend("todaysVideo");
    const query = new Parse.Query(TodaysVideo);
    query.limit(1);
    query.greaterThan("currentDate", "" + firstDay +' 00:00:00.000');
    query.lessThan("currentDate", "" + lastDay +' 00:00:00.000');

    const results = await query.find();
    status += "Successfully retrieved \n";

    var videoId = results.get("videoId");

    const Videos = Parse.Object.extend("videos");
    const videoQuery = new Parse.Query(Videos);
    videoQuery.limit(1);
    videoQuery.equalTo("objectId", videoId);
    const videoResult = await videoQuery.find();
    status += "Successfully retrieved video Result " + videoResult;

    var tweet = "Today's video is 🥁🥁🥁\n";
    tweet += "Full keyboard control in iOS apps";
    tweet += "by " + "@qdoug" + "at" + "@nslondonmeetup" + "🔥🔥🔥\n";
    tweet += "#iOSDev #swiftlang #swifttube";

    var xhr = new XMLHttpRequest();
    const url='https://api.bufferapp.com/1/updates/create.json';
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.open("POST", url, true);
    var data = new FormData();
    data.append('text', tweet);
    data.append('media', { 'link' : 'http://www.swifttube.co/video/full-keyboard-control-in-ios-apps'});
    data.append('profile_ids', '5cda1e0160c00824bf4eb582');
    data.append('access_token', '1/03a22b23f2f87319d7dfdc1015284cf8');

    xhr.send(data);
    xhr.onload = function () {
      status += this.responseText;
    };

    message(status);
});


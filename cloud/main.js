function postTweet(request) {

    request.log.info("post tweet function start");
    var now = new Date();
    request.log.info(now);
    request.log.info("post tweet function end");
}

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

Parse.Cloud.job("tubeTweet", (request) =>  {
      // params: passed in the job call
      // headers: from the request that triggered the job
      // log: the ParseServer logger passed in the request
      // message: a function to update the status message of the job object
      const { params, headers, log, message } = request;
      request.log.info("I just started");
      return postTweet(request);
});


Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.afterSave("videos",function(request){

    request.log.info("after save videos");

    if(request.object.get("youtubeId")) {
      	request.log.info("youtubeId: " + request.object.get("youtubeId"));

      	var youtubeId = request.object.get("youtubeId");
      	var saveNeeded = false;
        
        if(!request.object.get("image")) {
       		request.object.set("image", "http://i3.ytimg.com/vi/"+ youtubeId +"/maxresdefault.jpg");
       		saveNeeded = true;
        }
      	
      	if(!request.object.get("url")) {
 			request.object.set("url", "https://www.youtube.com/embed/"+ youtubeId +"");
 			saveNeeded = true;
   		}

   		if(saveNeeded) {
   			request.object.save();
   		}
      }

      if(request.object.get("title") && !request.object.get("shortUrl")) {

      	var users = request.object.get("users");
      	if(users) {
      		var userId = users[0];

      		var userQuery = new Parse.Query('users');
            userQuery.equalTo('objectId', userId);
            userQuery.find({
                success: function (results) {

                    var user = results[0];

                    var title = request.object.get("title").toLowerCase();
                    var username = user.get("fullname").toLowerCase();

                    var newTitle = title + "-" + username;
      				var replacedTitle = newTitle.split(' ').join('-');
      
        			request.object.set("shortUrl", replacedTitle);
        			request.object.save();
				},
                error: function (error) {
                    request.log.info("error setting video " + userId);

                }
            });
	    }
	  }

});
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

    		request.log.info("user id: " + userId);

    		var Users = Parse.Object.extend("users");
    		var query = new Parse.Query(Users);
            userQuery.get(userId{
                success: function (user) {

                	request.log.info("successfully find video user");

                    var title = request.object.get("title").toLowerCase();
                    var username = user.get("fullname").toLowerCase();

                    var newTitle = title + "-" + username;
      				var replacedTitle = newTitle.split(' ').join('-');
      
                    request.log.info("shortUrl: " + shortUrl);

        			request.object.set("shortUrl", replacedTitle);
        			request.object.save();
				},
                error: function (error) {
                    request.log.info("error setting video " + userId);
                    if(saveNeeded) {
   						request.object.save();
   					}
                }
            });
	    } else {
	    	request.log.info("video has no users");
	    }
	  }
});


Parse.Cloud.afterSave("users",function(request){

    request.log.info("after save users");

    if(request.object.get("fullname") && !request.object.get("shortname")) {
        var username = user.get("fullname").toLowerCase();
      	var shortname = username.split(' ').join('');
        request.object.set("shortname", shortname);
        request.object.save();
      }
});
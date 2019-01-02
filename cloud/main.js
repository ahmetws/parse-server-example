Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.afterSave("videos",function(request){

    console.log("after videos");
    console.log("request: " + JSON.stringify(request, undefined, 2));

        if (request.object.isNew()){
            console.log("aftersave videos, object IsNew==true: " + request.object);

            if(request.object.get("youtubeId")) {
            	console.log("youtubeId: " + request.object.get("youtubeId"));

            	var youtubeId = request.object.get("youtubeId");

            	request.object.set("image", "http://i3.ytimg.com/vi/"+ youtubeId +"/maxresdefault.jpg");
    			request.object.set("url", "https://www.youtube.com/embed/"+ youtubeId +"");
        	}

        	if(request.object.get("title")) {
        		var title = request.object.get("title").toLowerCase();
        		var replacedTitle = title.split(' ').join('+');
            	request.object.set("shortUrl", replacedTitle);
        	}
        }
});
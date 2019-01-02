Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.afterSave("videos",function(request){

    request.log.info("after videos");
    request.log.info("request: " + JSON.stringify(request, undefined, 2));

    request.log.info("aftersave videos, object IsNew==true: " + request.object);

    if(request.object.get("youtubeId")) {
      	request.log.info("youtubeId: " + request.object.get("youtubeId"));

      	var youtubeId = request.object.get("youtubeId");
        
        if(!request.object.get("image")) {
       		request.object.set("image", "http://i3.ytimg.com/vi/"+ youtubeId +"/maxresdefault.jpg");
         }
      	
      	if(!request.object.get("url")) {
 			request.object.set("url", "https://www.youtube.com/embed/"+ youtubeId +"");
   		}
 
      }

      if(request.object.get("title") && !request.object.get("shortUrl")) {
      	var title = request.object.get("title").toLowerCase();
      	var replacedTitle = title.split(' ').join('+');
      
        request.object.set("shortUrl", replacedTitle);
      }

      request.object.save();
});
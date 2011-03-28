$(function(){
    if(!localStorage['api-root']){ return; }

    function api(path){
	return localStorage['api-root']+path;
    }
    function notify(message){
	if(message.screen_name != "#{current_user.screen_name}") {
	    $.fn.desktopNotify({
		picture: message.profile_image_url,
		title: message.name,
		text : (message.attachment != null ? message.attachment.filename : message.body)
	    });
	}
    }

    function getPrevMessage(){
	console.log(localStorage['last-id']);
	if(localStorage['last-id']){
	    $.getJSON(api("/api/v1/user/rooms"),
		      { 'api_key' : localStorage['api-key'] },
		      function(json){
			  $(json.rooms).each(function(_, room){
			      $.getJSON(api("/api/v1/room/"+room.id+".json"),
					{ 'api_key' : localStorage['api-key'],
					  'since_id' : localStorage['last-id'] },
					function(json){
					    $(json).each(function(_, m){
						localStorage['last-id'] = m.id;
						notify(m);
					    });
					});
			  });
		      });
	}
	$(".message-list").bind('websocket::create', function(_, message){
	    localStorage['last-id'] = message.id;
	});
    }

    function waitForNewMessage(){
	var elem = $(".message-list")
	elem.webSocket({
	    entry : localStorage['ws-root'] + "/user?api_key="+localStorage['api-key']
	});

	elem.bind('websocket::create', function(_, message){
	    notify(message);
	});
    };

    $.fn.desktopNotify({
	title:"AsakusaSatellite",
	text : "Background start"
    });
    getPrevMessage();
    waitForNewMessage();
});
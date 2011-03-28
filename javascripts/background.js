$(function(){
    if(!localStorage['api-root']){ return; }

    function api(path){
        var apiRoot = localStorage['api-root'];
        if (apiRoot.substr(-1) == "/") {
            apiRoot = apiRoot.substring(0, apiRoot.length - 1);
        }
        return apiRoot + path;
    }
    function websocketApi(id){
        var apiRoot = localStorage['ws-root'];
        if (apiRoot.substr(-1) == "/") {
            apiRoot = apiRoot.substring(0, apiRoot.length - 1);
        }
        return apiRoot + "/room?id=" + id
    }
    function notify(message){
        //if(message.screen_name != "#{current_user.screen_name}") {
            $.fn.desktopNotify({
                picture: message.profile_image_url,
                title: message.room.name,
                text : (message.attachment != null ? message.attachment.filename : message.body)
            });
        //}
    }

/*
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
    }*/

    /** connect to all rooms */
    function connectToAllRooms() {
       $.getJSON(api("/api/v1/room/list.json"),
       function(json) {
          var i = 0;
          $(json).each(function (_, m) {
              connectToRoom(m.id);
              i++;
          });
          setBadgeNumber(i);
       })
    }
    /** connect to a room */
    function connectToRoom(id){
        var elem = $(".message-list")
        elem.webSocket({
            entry : websocketApi(id)
        });

        elem.bind('websocket::create', function(_, message){
            notify(message);
        });
    };
    /** set a number to badge */
    function setBadgeNumber(i) {
        chrome.browserAction.setBadgeText({text: String(i)});
    }

    connectToAllRooms();

    $.fn.desktopNotify({
        picture: "images/icon48.png",
        title: "AsakusaSatellite",
        text : "Background page started."
    });
});

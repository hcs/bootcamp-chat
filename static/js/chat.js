$(document).ready(function() {

    // message types
    var MESSAGE_TYPES = {
        NEW_USER : 0,
        MESSAGE : 1,
        LEAVE_USER : 2,
        ONLINE_USERS : 3,
    };

    // username for this client
    var USERNAME = "";

    // useful constants
    var ENTER_KEY = 13;

    var usernamebox = $("#username");
    var usernamebutton = $("#username-start");
    var usernameactions = $("#username-actions");
    var usernamespan = $("#username-prepend");
    var userslist = $("#users-online");

    var inputbox = $("#input");
    var actionsbox = $("#actions");
    var sendbutton = $("#send");
    var messages = $("#messages");
    var messagescontainer = $("#messages-container");

    // Create a web socket to receive chat updates
    var WS_URL = "ws://" + ChatApp.HOST + ":" + ChatApp.PORT
                 + "/" + ChatApp.CHAT_URL
    var ws = new WebSocket(WS_URL);
    ws.onopen = function() {
        console.log("opened web socket: " + WS_URL);
    };
    ws.onclose = function(msg) {
        var message = {
            type : MESSAGE_TYPES.LEAVE_USER,
            username : USERNAME,
        };
        ws.send(JSON.stringify(message));
        console.log("closed web socket: " + WS_URL + ", message: " + msg);
    }
    ws.onmessage = function(msg) {
        console.log(msg);
        var messagebox = $("<div></div>");
        var msg_time = new Date(msg.timeStamp);
        var message = JSON.parse(msg.data);
        switch (message.type) {
            case MESSAGE_TYPES.NEW_USER:
                // new user has joined--add user name to currently online list
                messagebox.html("<h4>[" + msg_time + "] " + message.username
                                + " entered!</h4>");
                userslist.append($("<li></li>")
                    .attr("id", "user-" + message.username)
                    .text(message.username));
                break;
            case MESSAGE_TYPES.LEAVE_USER:
                // user has left--remove user name from currently online list
                messagebox.html("<h4>[" + msg_time + "] " + message.username
                                + " left!</h4>");
                $("#user-" + message.username).remove();
                break;
            case MESSAGE_TYPES.MESSAGE:
                // received plain old IM
                messagebox.html("<h4>[" + msg_time + "] " + message.username
                                + "</h4><p>" + message.text + "</p>");
                break;
            case MESSAGE_TYPES.ONLINE_USERS:
                // update list with current users
                userslist.html("");
                userslist.append($("<li></li>")
                    .addClass("nav-header")
                    .text("Online Now"));
                for (var i in message.users) {
                    userslist.append($("<li></li>")
                        .attr("id", "user-" + message.users[i])
                        .text(message.users[i]));
                }
                break;
            default:
                console.log("unrecognized type: " + msg);
        }
        listitem = $("<li></li>").append(messagebox);
        horizontal = $("<li></li>").addClass("divider");
        messages.prepend(listitem);
        messages.prepend(horizontal);
    }

    $(window).unload(function() {
        ws.onclose();
    });

    // Request username
    usernamebutton.click(function() {
        var username = usernamebox.val();
        console.log(username);
        var message = {
            type : MESSAGE_TYPES.NEW_USER,
            username : username,
        };
        USERNAME = username;
        ws.send(JSON.stringify(message));
        usernameactions.hide();
        usernamespan.text(USERNAME);
        actionsbox.show("fast");
        messagescontainer.show("fast");
        inputbox.focus();
        return false;
    });

    // Hide boxes on default, focus on username
    usernamebox.focus();
    actionsbox.hide();
    messagescontainer.hide();

    // Add a click handler for send
    sendbutton.click(function() {
        var text = inputbox.val();
        inputbox.val(""); // clear the input box
        console.log(text);
        var message = {
            type : MESSAGE_TYPES.MESSAGE,
            username : USERNAME,
            text : text,
        };
        ws.send(JSON.stringify(message));
        return false;
    });

    // Add a handler for when the enter key is pressed
    inputbox.keypress(function(e) {
        if (e.which == ENTER_KEY) {
            sendbutton.click();
            e.preventDefault();
        }
    });
    
});
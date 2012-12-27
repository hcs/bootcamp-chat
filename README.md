Chat App
========

Written by Kenny Yu

## About

This is a simple chat application built in Python using [Web Sockets](http://www.websocket.org/), [Tornado](http://www.tornadoweb.org/), and [Bootstrap](http://twitter.github.com/bootstrap/).

## Dependencies

* [Web Sockets](http://www.websocket.org/)
* [Tornado 2.4.1](http://www.tornadoweb.org/)
* [Bootstrap](http://twitter.github.com/bootstrap/)
* [jQuery](http://jquery.com/)


## Running the Application

To start the server locally, you must specify the port (default is 8888):

    python server.py --port=8888

To see more options, run `server.py` with the `-h` flag:

    python server.py -h

Next, make sure the values defined in `static/js/settings.js` match your desired settings:

    ChatApp = {
        HOST : "localhost",
        PORT : "8888",
        CHAT_URL : "chat",
    };

The `PORT` value must match the port specified on the server, `HOST` must match the host name of the server (if running locally, leave it as `localhost`), and `CHAT_URL` must match the url pattern mapped to `ChatWebSocketHandler` in `server.py`.

Now in a web browser, visit `localhost:8888` (or your specified `HOST:PORT` combination). Specify a username and start chatting! Using web sockets, you will be able to send and receive messages in real time, as well as see the list of users currently online in real time.

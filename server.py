import argparse
import json
import os
import threading
import tornado.ioloop
import tornado.web
import tornado.websocket

# Dictionary mapping id -> handler
clients = {}

MESSAGE_TYPES = {
    "NEW_USER" : 0,
    "MESSAGE" : 1,
    "LEAVE_USER" : 2,
    "ONLINE_USERS" : 3,
}

class ChatWebSocketHandler(tornado.websocket.WebSocketHandler):
    """
    Handles chat websockets.
    """

    # Create a unique id per web socket
    id = 0
    lock = threading.Lock()

    def open(self):
        with self.__class__.lock:
            self.id = self.__class__.id;
            self.__class__.id += 1
        clients[self.id] = self
        usernames = []
        for cid in clients:
            if hasattr(clients[cid], "username"):
                usernames.append(clients[cid].username)
        message = {
            "type" : MESSAGE_TYPES["ONLINE_USERS"],
            "users" : usernames,
        }
        self.write_message(json.dumps(message))
        print "Websocket %d opened" % self.id

    def on_message(self, message):
        print "received message: " + message
        data = json.loads(message);
        if data["type"] == MESSAGE_TYPES["NEW_USER"]:
            clients[self.id].username = data["username"]
        for cid in clients:
            clients[cid].write_message(message)

    def on_close(self):
        del clients[self.id]
        print "Websocket %d closed" % self.id

class MainHandler(tornado.web.RequestHandler):
    """
    Handles request for the default index.html web page.
    """
    def get(self):
        self.render("static/index.html")

settings = {
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
}

# URL Mapper
application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/chat", ChatWebSocketHandler),
    (r"/static", tornado.web.StaticFileHandler, dict(path=settings['static_path'])),
], **settings)

# Command line arguments for our server
argparser = argparse.ArgumentParser(description="Chat Server")
argparser.add_argument("-p", "--port", type=int, default=8888, dest="port",
                       help="port for server to listen")

if __name__ == '__main__':
    args = vars(argparser.parse_args())
    application.listen(args["port"])
    tornado.ioloop.IOLoop.instance().start()

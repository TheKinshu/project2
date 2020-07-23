import os

from collections import deque


from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Store the current users
users = []

# Store channel that has been created
channel = ["General"]

channelMessages = dict()

currentChannel = 'General'

@app.route("/")
def index():
    channelMessages[currentChannel] = deque()
    return render_template("index.html")


@app.route("/create", methods=['GET','POST'])
def create():
    return ''

@socketio.on("messages")
def mes(data):
    
    message = data["message"]
    username = data["user"]
    time = data["time"]

    channelMessages[currentChannel].append([time, username, message])

    emit("message sent", {"time": time,"message": message, "user": username}, broadcast=True)

@socketio.on("userDisplay")
def user(data):
    users.append(data["user"])
    emit("connectedU", {"user": users}, broadcast=True)

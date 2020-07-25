import os

from collections import deque
from flask import Flask, render_template, redirect, session, request
from flask_socketio import SocketIO, emit

import logging

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Store the current users
users = []

# Store channel that has been created
channel = ["General"]
# Store message from channel
channelMessages = dict()
# Shows current channel, default channel is "General"
currentChannel = 'General'

# Converts dict into empty collection
# Should only run once when the server starts
# to create the "General" chat room
channelMessages[currentChannel] = deque()


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/logout")
def logout():
    return render_template("Logout.html")

@socketio.on("addchannel")
def create(data):

    newChannel = data["room"]

    # Check channel name to see if it exist
    if newChannel in channel:
        # Send error message when an existing channel is already created
        emit("error", {"error": "channel already exist"}, broadcast=True)
    elif newChannel == "":
        emit("channel display", {"channels": channel}, broadcast=True)
    else:
        # Add Channel to list
        channel.append(newChannel)
        # Create a collection for the messages
        channelMessages[newChannel] = deque()

        emit("channel display", {"channels": channel}, broadcast=True)

@socketio.on("messages")
def mes(data):
    if session.get("currentR") == "":
        session["currentR"] = "General" 

    # Storing temp data of users
    message = data["message"]
    username = data["user"]
    time = data["time"]

    # Store user message in channelMessages
    channelMessages[session.get("currentR")].append([time, username, message])

    emit("message sent", {"time": time,"message": message, "user": username}, broadcast=True)

@socketio.on("loadMessage")
def loadM(data):

    currentChannel =  data["room"]
    session["currentR"] = currentChannel
    timex = []
    messagex = []
    userx = []

    for x in range(len(channelMessages[currentChannel])):
        timex.append(channelMessages[currentChannel][x][0])
        userx.append(channelMessages[currentChannel][x][1])
        messagex.append(channelMessages[currentChannel][x][2])

    emit("updateRoom", {"time": timex, "user": userx,  "message": messagex}, broadcast=True)

# This displays new user that joins into the server lobby
@socketio.on("userDisplay")
def user(data):
    # Add new user to the users list
    if data['user'] not in users:
        users.append(data["user"])
    session["user"] = data["user"]
    emit("connectedU", {"user": users}, broadcast=True)

@socketio.on("logout")
def log(data):
    if data['user'] in users:
        users.remove(data['user'])
    emit("connectedU", {"user": users}, broadcast=True)

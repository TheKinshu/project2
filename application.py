import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("messages")
def mes(data):
    message = data["message"]
    username = data["user"]
    time = data["time"]
    emit("message sent", {"time": time,"message": message, "user": username}, broadcast=True)

@socketio.on("userDisplay")
def user(data):
    user = data["user"]
    emit("connectedU", {"user": user}, broadcast=True);

var user = "";

document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', () => {

        // Remembering user's name
        user = localStorage.getItem('user');

        // Check if user is new to server
        if(user == null || user == ""){
            // Making sure user is entering a valid string
            while(user == "" || user == null){
                user = prompt("Please Enter a Username");
                if(user == "" || user == null)
                    alert("Please enter a valid username")
            }
            localStorage.setItem('user', user);
        }

        socket.emit('userDisplay',{"user": user});
        socket.emit('addchannel', {"room": ""});
        socket.emit('loadMessage', {"room": "General"});   

        // end of checking

        // When the message sent button is clicked
        document.querySelector('button#sendMessage').onclick = ()=>{
            // Get user message
            const message = document.getElementById("uText").value;

            // Get current timestamp
            let today = new Date();
            let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

            // Check if messages is empty
            if(message != ""){
                socket.emit('messages', {"time": time ,"message": message, "user": user});
                document.getElementById("uText").value = "";
            }
        };// End of Message Button
        //
        document.querySelector('button#newChannel').onclick = ()=>{
            let nChannel = prompt("Please Enter a new channel name");

            if(nChannel == "" || nChannel == null){
                alert("Invalid Channel name");
            }
            else{
                socket.emit('addchannel', {"room": nChannel});
            }
        };
        
        document.querySelector('button#logout').onclick = ()=>{
            let log = confirm("Do you want to log off?")

            if(log){
                socket.emit("logout", {"user": user});
                localStorage.clear();
                location.replace("/logout")
            }
        };

    });// The End of Connect

    socket.on('channel display', data =>{
        var channelList = document.querySelector('#channelB');
        while(channelList.firstChild){
            channelList.removeChild(channelList.firstChild);
        }

        for(i = 0; i < data.channels.length; i++){
            const li = document.createElement('li');
            li.innerHTML = `<a id="channel-change" data-channel="` + `${data.channels[i]}` + `">` + `${data.channels[i]}` + `</a>`;
            document.querySelector('#channelB').append(li);
        }

        document.querySelectorAll('#channel-change').forEach(function(button) {
            button.onclick = function() {
                socket.emit('loadMessage', {"room": button.dataset.channel});
            };
        });
    });

    socket.on('connectedU', data =>{
        var userList = document.querySelector('#userID');
        while(userList.firstChild){
            userList.removeChild(userList.firstChild);
        }

        for(i = 0; i < data.user.length; i++){
            const li = document.createElement('li');
            li.innerHTML = `${data.user[i]}`;
            document.querySelector('#userID').append(li);
        }

    });

    // Sending message to display
    socket.on('message sent', data => {
        const li = document.createElement('li');
        li.innerHTML = `${data.user}` + ` <${data.time}>` +  ` :<br> ${data.message}`;
        document.querySelector('#mBoard').append(li);
    });

    socket.on('error', data => {
        alert("Error: " + data.error);
    });

    socket.on('updateRoom', data => {

        var messageBoard = document.querySelector('#mBoard');
        while(messageBoard.firstChild){
            messageBoard.removeChild(messageBoard.firstChild);
        }

        for(i = 0; i < data.message.length; i++){
            const li = document.createElement('li');
            li.innerHTML = `${data.user[i]}` + ` <${data.time[i]}>` +  ` :<br> ${data.message[i]}`;
            document.querySelector('#mBoard').append(li);
        }
        
    });
});
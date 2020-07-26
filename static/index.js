var user = "";
var last_channel = "";


document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', () => {

        // Remembering user's name
        user = localStorage.getItem('user');
        last_channel = localStorage.getItem('last_channel');
        
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

        //Update current users
        socket.emit('userDisplay',{"user": user});
        //Update channels created
        socket.emit('addchannel', {"room": ""});
        
        if(last_channel == null || last_channel == "General" || last_channel == ""){
            socket.emit('loadMessage', {"room": "General"});   
        }
        else{
            socket.emit('loadMessage', {"room": last_channel});   
        }

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

        // Create a new Channel
        document.querySelector('button#newChannel').onclick = ()=>{
            let nChannel = prompt("Please Enter a new channel name");

            // Check if user enter something
            if(nChannel == "" || nChannel == null){
                alert("Invalid Channel name");
            }
            else{
                socket.emit('addchannel', {"room": nChannel});
            }
        };

        const module = {
            loadDocument: (url) => {
                socket.emit('uploadImage', {"url": url});
            }
        };
        
        // Upload image to local "Client side only"
        document.querySelector('input[type=file]').addEventListener('input', function (evt) {
            let today = new Date();
            let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            let file = this.files[0];
            let url = URL.createObjectURL(file);
            module.loadDocument(url);
            socket.emit('messages', {"time": time ,"message": url, "user": user});
        });

        // Allow user to logout
        document.querySelector('button#logout').onclick = ()=>{
            let log = confirm("Do you want to log off?")

            // Checks if user clicked okay
            if(log){
                socket.emit("logout", {"user": user});
                localStorage.clear();
                location.replace("/logout")
            }
        };

    });// The End of Connect

    // Update Channel
    socket.on('channel display', data =>{
        var channelList = document.querySelector('#channelB');

        // Remove all current channel
        while(channelList.firstChild){
            channelList.removeChild(channelList.firstChild);
        }

        // Loops through a list and re-enter any new channels that has been created
        for(i = 0; i < data.channels.length; i++){
            const li = document.createElement('li');
            let cName = data.channels[i];

            li.innerHTML = `<a href="/channels/` + `${cName}` + `" id="channel-change" data-channel="` + `${cName}` + `">` + `${cName}` + `</a>`;
            document.querySelector('#channelB').append(li);
        }

        // Gives the channels function
        // Allowing user to change to different text channels
        document.querySelectorAll('#channel-change').forEach(function(button) {
            button.onclick = function() {
                localStorage.setItem('last_channel', button.dataset.channel)
                
            };
        });
    });

    // Check who is currently connected to the server
    socket.on('connectedU', data =>{
        //
        var userList = document.querySelector('#userID');
        // Remove all users
        while(userList.firstChild){
            userList.removeChild(userList.firstChild);
        }

        // Update all new users
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
        socket.emit('loadMessage', {"room": last_channel});   
    });

    // Send image to display
    socket.on('image sent', data => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="` + data.image + `">`;
        document.querySelector('#mBoard').append(li);
        socket.emit('loadMessage', {"room": last_channel});  
    });

    // Error function if an error occurs
    socket.on('error', data => {
        alert("Error: " + data.error);
    });

    // Update all images and messages when reloading channel
    socket.on('updateRoom', data => {

        var messageBoard = document.querySelector('#mBoard');
        while(messageBoard.firstChild){
            messageBoard.removeChild(messageBoard.firstChild);
        }

        for(i = 0; i < data.message.length; i++){
            const li = document.createElement('li');
            if(data.message[i].search("blob:") == -1){
                li.innerHTML = `${data.user[i]}` + ` <${data.time[i]}>` +  ` :<br> ${data.message[i]}`;
            }
            else{
                li.innerHTML = `<img src="` + `${data.message[i]}` + `" width="200">`;
            }
            document.querySelector('#mBoard').append(li);
        }
        
    });
});
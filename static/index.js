document.addEventListener('DOMContentLoaded', () => {
    user = prompt("Please Enter a Username");

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', () => {

        socket.emit('userDisplay',{"user": user});
        console.log("username is " + user);
        // When the message sent button is clicked
        document.querySelector('button').onclick = ()=>{
            // Get user message
            const message = document.getElementById("uText").value;

            // Get current timestamp
            let today = new Date();
            let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            let dateTime = time;

            // Check if messages is empty
            if(message != ""){
                socket.emit('messages', {"time": dateTime ,"message": message, "user": user});
                document.getElementById("uText").value = "";
            }
        }// End of Message Button

    });// The End of Connect

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
    socket.on('message sent', data =>{
        const li = document.createElement('li');
        li.innerHTML = `${data.user} ${data.time}:<br> ${data.message}`;
        document.querySelector('#mBoard').append(li);
    });
});
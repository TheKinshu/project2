var user = "654654";

document.addEventListener('DOMContentLoaded', () => {
    
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {
        document.querySelector('button').onclick = ()=>{
            const message = document.getElementById("uText").value;
            socket.emit('messages', {"message": message, "user": user});
        }
    });

    socket.on('message sent', data =>{
        const li = document.createElement('li');
        li.innerHTML = `${data.user}: ${data.message}`;

        document.querySelector('#mBoard').append(li);
        document.getElementById("uText").value = "";
    });
});
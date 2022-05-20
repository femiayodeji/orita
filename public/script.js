const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const videoDOM = document.createElement('video');
videoDOM.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
});
const ROOM_ID = "<%= roomId %>";
let localVideoStream;
let userId;
const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    // audio: true
}).then(stream => {
    localVideoStream = stream;
    addVideoStream(videoDOM, stream);

    const rtc = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '3000'
    });

    rtc.on('open', id => {
        userId = id;
        console.log("opening...", id);
        socket.emit('join-room', ROOM_ID, id);
    });

    rtc.on('call', call => {
        console.log("answering...");
        call.answer(localVideoStream);
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            console.log("remote streaming....");
            addVideoStream(video, userVideoStream)
        });
        // socket.emit("ready")
    });

    socket.on('user-connected', (id) => {
        if (userId === id) return;
        console.log("user connected:", id);
        connectNewUser2(id, localVideoStream, rtc);
    });

}).catch((e) => {
    console.log("Error", e);
})

// socket.on('user-connected', (id) => {
//     if (userId === id) return;
//     console.log("user connected:", id);
//     connectNewUser(id, localVideoStream);
// });

// peer.on('open', id => {
//     userId = id;
//     console.log("opening...", id);
//     socket.emit('join-room', ROOM_ID, id);
// })

// peer.on('call', call => {
//     console.log("answering...");
//     call.answer(localVideoStream);
//     const video = document.createElement('video')
//     call.on('stream', userVideoStream => {
//         console.log("remote streaming....");
//         addVideoStream(video, userVideoStream)
//     });
//     socket.emit("ready")
// });

// peer.on('disconnected', function() {
//     peers[userId].close();
//     console.log("Disconnected", userId);
//     delete peers[userId];
// });

const connectNewUser2 = (userId, stream, rtc) => {
    console.log("calling...");
    const call = rtc.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        console.log("local streaming....");
        addVideoStream(video, userVideoStream)
    });
    peers[userId] = call;
}

// const connectNewUser = (userId, stream) => {
//     console.log("calling...");
//     const call = peer.call(userId, stream);
//     const video = document.createElement('video');
//     call.on('stream', userVideoStream => {
//         console.log("local streaming....");
//         addVideoStream(video, userVideoStream)
//     });
//     peers[userId] = call;
// }

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
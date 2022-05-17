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
let videoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    // audio: true
}).then(stream => {
    videoStream = stream;
    addVideoStream(videoDOM, stream);

    // peer.on('call', call => {
    //     console.log("answering...");
    //     call.answer(stream);
    //     const video = document.createElement('video')
    //     call.on('stream', userVideoStream => {
    //         addVideoStream(video, userVideoStream)
    //     });
    // });

    socket.on('user-connected', (userId) => {
        connectNewUser(userId, stream);
    });
}).catch((e) => {
    console.log("Error", e);
})

peer.on('open', id => {
    console.log("opening...");
    socket.emit('join-room', ROOM_ID, id);
})

peer.on('call', call => {
    console.log("answering...");
    call.answer(videoStream);
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    });
});

const connectNewUser = (userId, stream) => {
    console.log("calling...");
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    });
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
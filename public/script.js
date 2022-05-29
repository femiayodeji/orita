const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const videoDOM = document.createElement('video');
videoDOM.classList.add("full");
videoDOM.muted = true;

const ROOM_ID = "<%= roomId %>";
let localVideoStream;
let userId;
const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    localVideoStream = stream;
    addVideoStream(videoDOM, stream);

    const rtc = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '443' //'3000'
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
        connectNewUser(id, localVideoStream, rtc);
    });

}).catch((e) => {
    console.log("Error", e);
})


const connectNewUser = (userId, stream, rtc) => {
    console.log("calling...");
    const call = rtc.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        console.log("local streaming....");
        addVideoStream(video, userVideoStream)
    });
    peers[userId] = call;
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    video.addEventListener("click", (e) => {
        const allVideos = document.querySelectorAll("#video-grid video");
        for (const v of allVideos) {
            v.classList.remove("full");
        }
        video.classList.add("full");
    })
    videoGrid.append(video);
}

const audioController = document.querySelector(".audio-controller");
audioController.addEventListener("click", (e) => {
    const audioEnabled = localVideoStream.getAudioTracks()[0].enabled;
    localVideoStream.getAudioTracks()[0].enabled = !audioEnabled;
    if (audioEnabled) {
        audioController.innerHTML = `<i class="fa fa-microphone-slash"></i>`
    } else {
        audioController.innerHTML = `<i class="fa fa-microphone"></i>`
    }
});

const videoController = document.querySelector(".video-controller");
videoController.addEventListener("click", (e) => {
    const videoEnabled = localVideoStream.getVideoTracks()[0].enabled;
    localVideoStream.getVideoTracks()[0].enabled = !videoEnabled;
    if (videoEnabled) {
        videoController.innerHTML = `<i class="fa fa-eye-slash"></i>`
    } else {
        videoController.innerHTML = `<i class="fa fa-eye"></i>`
    }
});
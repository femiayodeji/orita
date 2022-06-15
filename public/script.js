const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const videoDOM = document.createElement('video');
videoDOM.classList.add("full");
videoDOM.muted = true;

const ROOM_ID = "<%= roomId %>";
let localVideoStream;
let userId;
let peer;
const peers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    stream.getAudioTracks()[0].enabled = false;
    localVideoStream = stream;

    addVideoStream(videoDOM, stream);

    peer = new Peer(undefined, {
        path: '/peerjs',
        host: '/',
        port: '3000' //'443'
    });

    handleOpen(peer)
    handleCall(peer)
}).catch((e) => {
    console.log("Error", e);
})

const handleOpen = (peer) => {
    peer.on('open', id => {
        userId = id;
        console.log("opening...", id);
        socket.emit('join-room', ROOM_ID, id);
    });
}

const handleCall = (peer) => {
    peer.on('call', call => {
        console.log("answering...");
        call.answer(localVideoStream);
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            console.log("remote streaming....");
            addVideoStream(video, userVideoStream)
        });
    });
}

socket.on('user-connected', (id) => {
    if (userId === id) return;
    connectNewUser(id, localVideoStream, peer);
});

const screenShare = (peer) => {
    const displayMediaOptions = {
        video: {
            cursor: "always"
        },
        audio: false
    };

    navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        .then(function(stream) {
            localVideoStream = stream;
            addVideoStream(videoDOM, stream);
            handleOpen(peer)
            handleCall(peer)
        }).catch((e) => {
            console.log("Error", e);
        })
}

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

const screenShareController = document.querySelector(".screen-share-controller");
screenShareController.addEventListener("click", (e) => {
    if (screenShareController.innerHTML === `<i class="fa fa-clone"></i>`) {
        screenShareController.innerHTML = `<i class="fa fa-window-restore"></i>`
    } else {
        screenShareController.innerHTML = `<i class="fa fa-clone"></i>`
    }
    console.log("Screen Share");
});
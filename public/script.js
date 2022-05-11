const videoGrid = document.getElementById('video-grid');
const videoDOM = document.createElement('video');
videoDOM.muted = true;

let videoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    videoStream = stream;
    addVideoStream(videoDOM, stream)
})

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
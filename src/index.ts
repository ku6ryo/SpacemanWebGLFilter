import { SelfieSegmentation } from "@mediapipe/selfie_segmentation"
import Stats from "stats.js"
import { ImageCropper } from "./ImageCropper/ImageCropper"
import lightspeedVideoUrl from "./lightspeed.mp4"

const stats = new Stats()
document.body.appendChild(stats.dom)

const button = document.createElement("button")
button.textContent = "start"
button.style.position = "absolute"
button.style.top = "0"
button.style.right = "0"
button.style.zIndex = "1000"
button.style.width = "100px"
button.style.height = "100px"
button.addEventListener("click", () => {
  main()
  document.body.removeChild(button)
})
document.body.appendChild(button)

function main() {

  const seg = new SelfieSegmentation({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
  }})
  seg.setOptions({
    selfieMode: true,
    modelSelection: 1,
  })
  seg.onResults(results => {
    const lightContext = lightCanvas.getContext("2d")
    lightContext?.drawImage(lightVideo, 0, 0, lightCanvas.width, lightCanvas.height)
    cropper.process(lightCanvas, results.segmentationMask as ImageBitmap)
    mainContext!.drawImage(results.image, 0, 0, mainCanvas.width, mainCanvas.height)
    mainContext!.drawImage(cropper.getCanvas(), 0, 0, mainCanvas.width, mainCanvas.height)
    stats.end()
    requestAnimationFrame(process)
  })

  const mainCanvas = document.createElement("canvas")
  const mainContext = mainCanvas.getContext("2d")
  mainCanvas.style.height = "100vh"
  mainCanvas.style.width = "100vw"
  document.querySelector(".container")!.appendChild(mainCanvas)

  const lightCanvas = document.createElement("canvas")

  const cameraVideo = document.createElement("video");
  cameraVideo.addEventListener("playing", () => {
    const vw = cameraVideo.videoWidth
    const vh = cameraVideo.videoHeight
    mainCanvas.width = vw
    mainCanvas.height = vh
    mainCanvas.style.maxHeight = `calc(100vw * ${vh / vw})`
    mainCanvas.style.maxWidth = `calc(100vh * ${vw / vh})`
    cropper.setSize(vw, vh)
    lightCanvas.width = vw;
    lightCanvas.height = vh;

    requestAnimationFrame(process)
  })
  const lightVideo = document.createElement("video")
  lightVideo.src = lightspeedVideoUrl
  lightVideo.loop = true
  lightVideo.play()
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user"
      },
    })
    .then(function (stream) {
      cameraVideo.srcObject = stream;
      cameraVideo.play();
      requestAnimationFrame(process)
    })
    .catch(function (e) {
      console.log(e)
      console.log("Something went wrong!");
    });
  } else {
    alert("getUserMedia not supported on your browser!");
  }

  const cropper = new ImageCropper()

  async function process () {
    stats.begin()
    await seg.send({ image: cameraVideo })
  }
}
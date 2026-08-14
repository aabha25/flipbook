const pages = [
  
            "https://i.postimg.cc/KjDHscZx/page1better.jpg",
            "https://i.postimg.cc/76vtHJhw/page2better.jpg",
            "https://i.postimg.cc/P592yvmK/page3better.jpg",
            "https://i.postimg.cc/WbfnpqYS/Whats-App-Image-2026-08-14-at-10-01-44-AM.jpg"
        
];

const flipbook =
    document.getElementById("flipbook");

const canvas =
    document.getElementById("pageCanvas");

const ctx =
    canvas.getContext("2d");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

let currentPage = 0;
let currentImage = null;

previousButton.addEventListener(
    "click",
    previousPage
);

nextButton.addEventListener(
    "click",
    nextPage
);
function loadPage(index) {

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.src = pages[index];

    img.onload = () => {

        currentImage = img;

        canvas.width =
            img.naturalWidth;

        canvas.height =
            img.naturalHeight;

        drawPage();
    };
}


function drawPage() {

    if (!currentImage) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    /*
     * ZoomController controls these.
     */
    const scaleX =
        canvas.width /
        canvas.getBoundingClientRect().width;

    const scaleY =
        canvas.height /
        canvas.getBoundingClientRect().height;

    ctx.translate(
        zoomController.offsetX * scaleX,
        zoomController.offsetY * scaleY
    );

    const centerX =
        canvas.width / 2;

    const centerY =
        canvas.height / 2;

    ctx.translate(centerX, centerY);

    ctx.scale(
        zoomController.zoom,
        zoomController.zoom
    );

    ctx.translate(
        -centerX,
        -centerY
    );

    ctx.drawImage(
        currentImage,
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.restore();
}


function showPage(index) {

    if (
        index < 0 ||
        index >= pages.length
    ) {
        return;
    }

    currentPage = index;

    zoomController.reset();

    loadPage(currentPage);

    updateUI();
}


function nextPage() {
    showPage(currentPage + 1);
}


function previousPage() {
    showPage(currentPage - 1);
}


/*
 * Create zoom controller
 */
const zoomController =
    new ZoomController(
        flipbook,
        canvas,
        drawPage
    );


loadPage(0);
updateUI();
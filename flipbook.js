const pages = [
   
    "https://i.postimg.cc/KjDHscZx/page1better.jpg",
    "https://i.postimg.cc/76vtHJhw/page2better.jpg",
    "https://i.postimg.cc/P592yvmK/page3better.jpg",
    "https://i.postimg.cc/WbfnpqYS/Whats-App-Image-2026-08-14-at-10-01-44-AM.jpg",
    "https://i.postimg.cc/65g6CRWS/page5.jpg",
    "https://i.postimg.cc/RVyCwfSD/page6.jpg",
    "https://i.postimg.cc/02F57mk4/page7.jpg",
    "https://i.postimg.cc/4Nq4ptfF/page8.jpg",
    "https://i.postimg.cc/0ySknQjZ/page9.jpg",
    "https://i.postimg.cc/YCFrR90b/page10.jpg",
    "https://i.postimg.cc/Qd78mtCY/page11.jpg",
    "https://i.postimg.cc/cHPgCzbb/page12.jpg"

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


/* =========================
   BUTTONS
   ========================= */

previousButton.addEventListener(
    "click",
    previousPage
);

nextButton.addEventListener(
    "click",
    nextPage
);


/* =========================
   PAGE LOADING
   ========================= */

function loadPage(index) {

    if (
        index < 0 ||
        index >= pages.length
    ) {
        return;
    }

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => {

        currentImage = img;

        canvas.width =
            img.naturalWidth;

        canvas.height =
            img.naturalHeight;

        drawPage();
    };

    img.onerror = () => {
        console.error(
            "Failed to load page:",
            pages[index]
        );
    };

    img.src = pages[index];
}


/* =========================
   DRAW PAGE
   ========================= */

function drawPage() {

    if (!currentImage) {
        return;
    }

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    /*
     * Convert screen-space pan
     * into canvas-space pan.
     */
    const rect =
        canvas.getBoundingClientRect();

    const scaleX =
        canvas.width / rect.width;

    const scaleY =
        canvas.height / rect.height;


    /*
     * Apply pan.
     */
    ctx.translate(
        zoomController.offsetX * scaleX,
        zoomController.offsetY * scaleY
    );


    /*
     * Zoom around the center
     * of the page.
     */
    const centerX =
        canvas.width / 2;

    const centerY =
        canvas.height / 2;

    ctx.translate(
        centerX,
        centerY
    );

    ctx.scale(
        zoomController.zoom,
        zoomController.zoom
    );

    ctx.translate(
        -centerX,
        -centerY
    );


    /*
     * Draw page.
     */
    ctx.drawImage(
        currentImage,
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.restore();
}


/* =========================
   PAGE NAVIGATION
   ========================= */

function showPage(index) {

    if (
        index < 0 ||
        index >= pages.length
    ) {
        return;
    }

    currentPage = index;

    /*
     * Every new page starts
     * at normal zoom.
     */
    zoomController.reset();

    currentImage = null;

    loadPage(currentPage);

    updateUI();
}


function nextPage() {

    if (currentPage < pages.length - 1) {
        showPage(currentPage + 1);
    }
}


function previousPage() {

    if (currentPage > 0) {
        showPage(currentPage - 1);
    }
}


/* =========================
   ZOOM CONTROLLER
   ========================= */

const zoomController =
    new ZoomController(
        flipbook,
        canvas,
        drawPage,
        nextPage,
        previousPage
    );


/* =========================
   INITIAL PAGE
   ========================= */

loadPage(0);

updateUI();

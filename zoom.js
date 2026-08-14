class ZoomController {

    constructor(flipbook, canvas, drawPage) {

        this.flipbook = flipbook;
        this.canvas = canvas;
        this.drawPage = drawPage;

        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.startX = 0;
        this.startY = 0;

        this.lastDistance = 0;
        this.lastMidX = 0;
        this.lastMidY = 0;

        this.isPanning = false;
        this.isPinching = false;

        this.attachEvents();
    }

    getDistance(t1, t2) {

        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;

        return Math.hypot(dx, dy);
    }

    getMidpoint(t1, t2) {

        return {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
        };
    }

    reset() {

        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.isPanning = false;
        this.isPinching = false;
    }

    clampPan() {

        const rect =
            this.canvas.getBoundingClientRect();

        const scaledWidth =
            rect.width * this.zoom;

        const scaledHeight =
            rect.height * this.zoom;

        const maxX = Math.max(
            0,
            (scaledWidth - rect.width) / 2
        );

        const maxY = Math.max(
            0,
            (scaledHeight - rect.height) / 2
        );

        this.offsetX = Math.max(
            -maxX,
            Math.min(maxX, this.offsetX)
        );

        this.offsetY = Math.max(
            -maxY,
            Math.min(maxY, this.offsetY)
        );
    }

    handleTouchStart(e) {

        if (e.touches.length === 2) {

            this.isPinching = true;
            this.isPanning = false;

            this.lastDistance =
                this.getDistance(
                    e.touches[0],
                    e.touches[1]
                );

            const midpoint =
                this.getMidpoint(
                    e.touches[0],
                    e.touches[1]
                );

            this.lastMidX = midpoint.x;
            this.lastMidY = midpoint.y;

            return;
        }

        if (e.touches.length === 1) {

            this.startX =
                e.touches[0].clientX;

            this.startY =
                e.touches[0].clientY;

            this.isPanning = this.zoom > 1;
        }
    }

    handleTouchMove(e) {

        e.preventDefault();

        /*
         * PINCH ZOOM
         */
        if (
            e.touches.length === 2 &&
            this.isPinching
        ) {

            const distance =
                this.getDistance(
                    e.touches[0],
                    e.touches[1]
                );

            const midpoint =
                this.getMidpoint(
                    e.touches[0],
                    e.touches[1]
                );

            const scaleChange =
                distance / this.lastDistance;

            const oldZoom = this.zoom;

            this.zoom *= scaleChange;

            this.zoom = Math.max(
                1,
                Math.min(4, this.zoom)
            );

            const rect =
                this.flipbook.getBoundingClientRect();

            const pinchX =
                midpoint.x - rect.left;

            const pinchY =
                midpoint.y - rect.top;

            this.offsetX =
                pinchX -
                (pinchX - this.offsetX) *
                (this.zoom / oldZoom);

            this.offsetY =
                pinchY -
                (pinchY - this.offsetY) *
                (this.zoom / oldZoom);

            this.offsetX +=
                midpoint.x - this.lastMidX;

            this.offsetY +=
                midpoint.y - this.lastMidY;

            this.clampPan();

            this.lastDistance = distance;
            this.lastMidX = midpoint.x;
            this.lastMidY = midpoint.y;

            this.drawPage();

            return;
        }

        /*
         * PAN
         */
        if (
            e.touches.length === 1 &&
            this.zoom > 1 &&
            this.isPanning
        ) {

            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;

            this.offsetX += x - this.startX;
            this.offsetY += y - this.startY;

            this.startX = x;
            this.startY = y;

            this.clampPan();

            this.drawPage();
        }
    }

    handleTouchEnd(e) {

        if (e.touches.length > 0) {

            if (e.touches.length === 1) {

                this.startX =
                    e.touches[0].clientX;

                this.startY =
                    e.touches[0].clientY;

                this.isPanning = this.zoom > 1;
            }

            return;
        }

        this.isPinching = false;

        if (this.zoom > 1) {
            this.isPanning = false;
        }
    }

    attachEvents() {

        this.flipbook.addEventListener(
            "touchstart",
            e => this.handleTouchStart(e)
        );

        this.flipbook.addEventListener(
            "touchmove",
            e => this.handleTouchMove(e)
        );

        this.flipbook.addEventListener(
            "touchend",
            e => this.handleTouchEnd(e)
        );
    }
}
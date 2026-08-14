class ZoomController {

    constructor(
        flipbook,
        canvas,
        drawPage,
        nextPage,
        previousPage
    ) {

        this.flipbook = flipbook;
        this.canvas = canvas;
        this.drawPage = drawPage;

        this.nextPage = nextPage;
        this.previousPage = previousPage;


        /* =====================
           ZOOM / PAN STATE
           ===================== */

        this.zoom = 1;

        this.minZoom = 1;
        this.maxZoom = 4;

        this.offsetX = 0;
        this.offsetY = 0;


        /* =====================
           SINGLE FINGER
           ===================== */

        this.startX = 0;
        this.startY = 0;

        this.lastX = 0;
        this.lastY = 0;


        /* =====================
           PAGE SWIPE
           ===================== */

        this.gestureStartX = 0;
        this.gestureStartY = 0;

        this.gestureStartTime = 0;


        /* =====================
           PINCH
           ===================== */

        this.lastDistance = 0;

        this.lastMidX = 0;
        this.lastMidY = 0;


        /* =====================
           STATE
           ===================== */

        this.isPanning = false;
        this.isPinching = false;

        /*
         * Becomes true when a two-finger
         * gesture was involved.
         *
         * This prevents the remaining
         * finger from accidentally
         * triggering page navigation.
         */
        this.hadPinch = false;


        this.attachEvents();
    }


    /* =========================
       UTILITY
       ========================= */

    getDistance(t1, t2) {

        const dx =
            t1.clientX - t2.clientX;

        const dy =
            t1.clientY - t2.clientY;

        return Math.hypot(dx, dy);
    }


    getMidpoint(t1, t2) {

        return {
            x:
                (t1.clientX + t2.clientX) / 2,

            y:
                (t1.clientY + t2.clientY) / 2
        };
    }


    /* =========================
       RESET
       ========================= */

    reset() {

        this.zoom = 1;

        this.offsetX = 0;
        this.offsetY = 0;

        this.startX = 0;
        this.startY = 0;

        this.lastX = 0;
        this.lastY = 0;

        this.gestureStartX = 0;
        this.gestureStartY = 0;

        this.gestureStartTime = 0;

        this.lastDistance = 0;

        this.lastMidX = 0;
        this.lastMidY = 0;

        this.isPanning = false;
        this.isPinching = false;

        this.hadPinch = false;
    }


    /* =========================
       PAN LIMIT
       ========================= */

    clampPan() {

        const rect =
            this.canvas.getBoundingClientRect();

        const scaledWidth =
            rect.width * this.zoom;

        const scaledHeight =
            rect.height * this.zoom;


        const maxX =
            Math.max(
                0,
                (scaledWidth - rect.width) / 2
            );

        const maxY =
            Math.max(
                0,
                (scaledHeight - rect.height) / 2
            );


        this.offsetX =
            Math.max(
                -maxX,
                Math.min(
                    maxX,
                    this.offsetX
                )
            );

        this.offsetY =
            Math.max(
                -maxY,
                Math.min(
                    maxY,
                    this.offsetY
                )
            );
    }


    /* =========================
       TOUCH START
       ========================= */

    handleTouchStart(e) {

        /*
         * =====================
         * TWO FINGERS
         * =====================
         */

        if (e.touches.length === 2) {

            this.isPinching = true;

            this.isPanning = false;

            this.hadPinch = true;


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


            this.lastMidX =
                midpoint.x;

            this.lastMidY =
                midpoint.y;

            return;
        }


        /*
         * =====================
         * ONE FINGER
         * =====================
         */

        if (e.touches.length === 1) {

            const x =
                e.touches[0].clientX;

            const y =
                e.touches[0].clientY;


            this.startX = x;
            this.startY = y;

            this.lastX = x;
            this.lastY = y;


            this.gestureStartX = x;
            this.gestureStartY = y;

            this.gestureStartTime =
                Date.now();


            /*
             * If zoomed in:
             *
             * one finger = PAN
             *
             * never page swipe.
             */
            this.isPanning =
                this.zoom > 1;


            /*
             * If this finger is
             * continuing from a pinch,
             * don't allow it to become
             * a page swipe.
             */
            if (this.hadPinch) {
                this.isPanning =
                    this.zoom > 1;
            }
        }
    }


    /* =========================
       TOUCH MOVE
       ========================= */

    handleTouchMove(e) {

        /*
         * We handle scrolling,
         * panning and zooming ourselves.
         */
        e.preventDefault();


        /* =====================
           PINCH ZOOM
           ===================== */

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


            if (this.lastDistance === 0) {

                this.lastDistance =
                    distance;

                this.lastMidX =
                    midpoint.x;

                this.lastMidY =
                    midpoint.y;

                return;
            }


            const oldZoom =
                this.zoom;


            const scaleChange =
                distance /
                this.lastDistance;


            this.zoom *= scaleChange;


            this.zoom =
                Math.max(
                    this.minZoom,
                    Math.min(
                        this.maxZoom,
                        this.zoom
                    )
                );


            /*
             * Zoom around pinch midpoint.
             */
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


            /*
             * Move page together with
             * the pinch midpoint.
             */
            this.offsetX +=
                midpoint.x -
                this.lastMidX;


            this.offsetY +=
                midpoint.y -
                this.lastMidY;


            this.clampPan();


            this.lastDistance =
                distance;

            this.lastMidX =
                midpoint.x;

            this.lastMidY =
                midpoint.y;


            this.drawPage();

            return;
        }


        /* =====================
           ONE FINGER PAN
           ===================== */

        if (
            e.touches.length === 1 &&
            this.zoom > 1 &&
            this.isPanning
        ) {

            const x =
                e.touches[0].clientX;

            const y =
                e.touches[0].clientY;


            const deltaX =
                x - this.lastX;

            const deltaY =
                y - this.lastY;


            this.offsetX +=
                deltaX;

            this.offsetY +=
                deltaY;


            this.lastX = x;
            this.lastY = y;


            this.clampPan();

            this.drawPage();

            return;
        }
    }


    /* =========================
       TOUCH END
       ========================= */

    handleTouchEnd(e) {

        /*
         * Another finger is still
         * touching the screen.
         */
        if (e.touches.length > 0) {

            /*
             * Pinch → one finger.
             *
             * Continue as pan if zoomed.
             */
            if (e.touches.length === 1) {

                const x =
                    e.touches[0].clientX;

                const y =
                    e.touches[0].clientY;


                this.lastX = x;
                this.lastY = y;

                this.startX = x;
                this.startY = y;


                this.isPanning =
                    this.zoom > 1;
            }

            return;
        }


        /* =====================
           PAGE SWIPE
           ===================== */

        /*
         * Page navigation is allowed
         * ONLY when:
         *
         * 1. We are not zoomed.
         * 2. There was no pinch.
         * 3. This was a one-finger gesture.
         */
        if (
            !this.isPinching &&
            !this.hadPinch &&
            this.zoom === 1
        ) {

            const endX =
                e.changedTouches[0].clientX;

            const endY =
                e.changedTouches[0].clientY;


            const deltaX =
                endX -
                this.gestureStartX;

            const deltaY =
                endY -
                this.gestureStartY;


            const absX =
                Math.abs(deltaX);

            const absY =
                Math.abs(deltaY);


            /*
             * Require clearly horizontal
             * movement.
             */
            const isHorizontal =
                absX > absY * 1.25;


            /*
             * Minimum swipe distance.
             */
            const swipeThreshold = 60;


            if (
                isHorizontal &&
                absX >= swipeThreshold
            ) {

                /*
                 * Swipe LEFT
                 * → next page
                 */
                if (deltaX < 0) {

                    this.nextPage();
                }


                /*
                 * Swipe RIGHT
                 * → previous page
                 */
                else {

                    this.previousPage();
                }
            }
        }


        /*
         * Clear gesture state.
         */
        this.isPinching = false;

        this.isPanning = false;

        this.lastDistance = 0;

        this.hadPinch = false;
    }


    /* =========================
       EVENTS
       ========================= */

    attachEvents() {

        this.flipbook.addEventListener(
            "touchstart",
            e => this.handleTouchStart(e),
            {
                passive: true
            }
        );


        this.flipbook.addEventListener(
            "touchmove",
            e => this.handleTouchMove(e),
            {
                passive: false
            }
        );


        this.flipbook.addEventListener(
            "touchend",
            e => this.handleTouchEnd(e),
            {
                passive: true
            }
        );


        /*
         * Important for mobile browsers:
         * don't let the browser interpret
         * the canvas gesture as scrolling.
         */
        this.flipbook.style.touchAction =
            "none";
    }
}

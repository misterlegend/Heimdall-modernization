// Carousel Config.

const emblaNode = document.querySelector("#main-carousel.embla");
const viewPort = emblaNode.querySelector("#main-carousel .embla__viewport");
const embla = EmblaCarousel(viewPort, { loop: true, skipSnaps: true });
const nextButtonNode = document.getElementById("embla__next");
const thumbNodes = Array.from(
    emblaNode.querySelector(".embla__thumbs").getElementsByTagName("button")
);

const PARALLAX_FACTOR = 1.25;

const calculateParallaxTransforms = () => {
    const engine = embla.dangerouslyGetEngine();
    const scrollProgress = embla.scrollProgress();
    return embla.scrollSnapList().map((scrollSnap, index) => {
        if (!embla.slidesInView().includes(index)) return 0;
        let diffToTarget = scrollSnap - scrollProgress;
        if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
                const target = loopItem.getTarget();
                if (index === loopItem.index && target !== 0) {
                    const sign = Math.sign(target);
                    if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
                    if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
                }
            });
        }
        return diffToTarget * (-1 / PARALLAX_FACTOR) * 100;
    });
};

const parallax = () => {
    const slides = embla.slideNodes();
    const layers = slides.map((s) => s.querySelector(".embla__slide__parallax"));

    const applyParallaxStyles = () => {
        const parallaxTransforms = calculateParallaxTransforms();
        parallaxTransforms.forEach((transform, index) => {
            layers[index].style.transform = `translateX(${transform}%)`;
        });
    };

    return applyParallaxStyles;
};

const autoplay = (interval) => {
    let timer = 0;

    const play = () => {
        stop();
        requestAnimationFrame(() => (timer = window.setTimeout(next, interval)));
    };

    const stop = () => {
        window.clearTimeout(timer);
        timer = 0;
    };

    const next = () => {
        if (embla.canScrollNext()) embla.scrollNext();
        else embla.scrollTo(0);
        play();
    };

    return { play, stop };
};

const applyParallaxStyles = parallax();
const autoplayer = autoplay(5000);

embla.on("init", () => {
    applyParallaxStyles();
    autoplayer.play();
});
embla.on("resize", applyParallaxStyles);
embla.on("pointerDown", autoplayer.stop);
embla.on("scroll", applyParallaxStyles);
embla.on("select", () => {
    const previous = thumbNodes[embla.previousScrollSnap()];
    const selected = thumbNodes[embla.selectedScrollSnap()];
    previous.classList.remove("is-selected");
    selected.classList.add("is-selected");
});
nextButtonNode.addEventListener("click", embla.scrollNext, false);

thumbNodes.forEach((node) => {
    node.addEventListener("click", function (event) {
        embla.scrollTo(node.getAttribute("data-embla-index"));
        autoplayer.play();
    });
}, false);

// Go Down Button.

const goDownBtn = document.getElementById("go-down");
if (goDownBtn) {
    goDownBtn.addEventListener("click", () => {
        const mainLoop = document.getElementById("main-loop");
        if (mainLoop) {
            const offset = window.innerWidth > 1024 ? 150 : 120;
            window.scrollTo({
                top: mainLoop.offsetTop - offset,
                behavior: "smooth",
            });
        }
    });
}

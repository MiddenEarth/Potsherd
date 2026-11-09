(() => {
    const slides = document.querySelectorAll('.backgrounds img');
    if (slides.length < 2) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SLIDE_MS = reduceMotion ? 8000 : 3000;

    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, SLIDE_MS);
})();

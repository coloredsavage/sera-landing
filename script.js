// Scroll-triggered line-by-line animation with Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
    // Track which lines have been revealed globally to ensure order
    let revealedLines = 0;
    const allLines = document.querySelectorAll('.line');
    const totalLines = allLines.length;

    // Configuration for the observer
    const observerOptions = {
        root: null, // viewport
        rootMargin: '-10% 0px -10% 0px', // Trigger when element is in the middle portion of viewport
        threshold: 0.3 // Trigger when 30% of element is visible
    };

    // Function to reveal a single line
    const revealLine = (line, delay = 0) => {
        setTimeout(() => {
            line.classList.add('visible');
        }, delay);
    };

    // Function to reveal lines in a block sequentially
    const revealBlockLines = (block) => {
        const lines = block.querySelectorAll('.line');
        lines.forEach((line, index) => {
            // Only reveal if this is the next line in sequence globally
            const lineGlobalIndex = Array.from(allLines).indexOf(line);

            if (lineGlobalIndex === revealedLines) {
                revealLine(line, index * 250); // 250ms delay between lines
                revealedLines++;

                // After revealing this line, check if the next line should be revealed
                setTimeout(() => {
                    checkNextLine();
                }, index * 250 + 100);
            }
        });
    };

    // Function to check and reveal the next line if its block is visible
    const checkNextLine = () => {
        if (revealedLines >= totalLines) return;

        const nextLine = allLines[revealedLines];
        const parentBlock = nextLine.closest('.story-block');

        // Check if the parent block is in viewport
        const rect = parentBlock.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;

        if (isInViewport) {
            revealLine(nextLine, 0);
            revealedLines++;
            setTimeout(checkNextLine, 250);
        }
    };

    // Create the intersection observer for story blocks
    const blockObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                revealBlockLines(entry.target);
            }
        });
    }, observerOptions);

    // Observe all story blocks
    const storyBlocks = document.querySelectorAll('.story-block');
    storyBlocks.forEach(block => {
        blockObserver.observe(block);
    });

    // Observe the App Store button separately
    const appStoreButton = document.querySelector('.app-store-button');
    if (appStoreButton) {
        const buttonObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        buttonObserver.observe(appStoreButton);
    }

    // Observe polaroid photos and photo strip for scroll-triggered animation
    const polaroidPhotos = document.querySelectorAll('.polaroid-photo');
    const photoStrip = document.querySelector('.photo-strip');

    const photoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    polaroidPhotos.forEach(photo => {
        photoObserver.observe(photo);
    });

    if (photoStrip) {
        photoObserver.observe(photoStrip);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax scrolling effects (excluding hero section)
    let ticking = false;
    const storyBlocksForParallax = document.querySelectorAll('.story-block');
    const downloadSection = document.querySelector('.download');

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Story blocks - each moves at slightly different speeds for depth
                storyBlocksForParallax.forEach((block, index) => {
                    const blockTop = block.getBoundingClientRect().top;
                    const blockScroll = window.innerHeight - blockTop;

                    if (blockScroll > 0 && blockTop < window.innerHeight) {
                        // Alternate between slower and faster speeds
                        const speed = index % 2 === 0 ? 0.03 : 0.02;
                        const offset = blockScroll * speed;
                        block.style.transform = `translateY(-${offset}px)`;
                    }
                });

                // Download section - subtle upward float
                if (downloadSection) {
                    const downloadTop = downloadSection.getBoundingClientRect().top;
                    const downloadScroll = window.innerHeight - downloadTop;

                    if (downloadScroll > 0 && downloadTop < window.innerHeight) {
                        const offset = downloadScroll * 0.06;
                        downloadSection.style.transform = `translateY(-${offset}px)`;
                    }
                }

                // Check if we should reveal the next line on scroll
                checkNextLine();

                ticking = false;
            });

            ticking = true;
        }
    });
});

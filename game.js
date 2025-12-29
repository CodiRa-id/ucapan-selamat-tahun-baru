// === GAME STATE ===
let currentScene = 0;
let scenes = [];

// === SCENE DEFINITIONS ===
function initScenes() {
    scenes = [
        // Scene 1
        {
            id: 1,
            text: "Selamat tahun baru 2026",
            tapToContinue: true,
            choices: [],
            characterImage: "scene 1.webp",
            showConfetti: true
        },
        // Scene 2 - Buttons evade cursor
        {
            id: 2,
            text: "Sepertinya target tahun 2025 berhasil ya?",
            tapToContinue: false,
            choices: [
                { text: "Tidak", nextScene: 3 },
                { text: "Ya", nextScene: 5, evading: true }
            ],
            characterImage: "scene 2.webp"
        },
        // Scene 3
        {
            id: 3,
            text: "Sayang banget, tapi pasti tahun ini berhasil.",
            tapToContinue: true,
            choices: [],
            characterImage: "scene3.webp"
        },
        // Scene 4 - Button position swap
        {
            id: 4,
            text: "Kamu yakin bisa mencapai target di tahun ini?",
            tapToContinue: false,
            choices: [
                { text: "Tidak", nextScene: 5, swapTarget: true },
                { text: "Ya", nextScene: 5, swapTrigger: true }
            ],
            characterImage: "scene 4.webp"
        },
        // Scene 5 - Character covers button
        {
            id: 5,
            text: "Astaga, kenapa?",
            tapToContinue: false,
            choices: [
                { text: "Males banget, mending nganggur", nextScene: 6 },
                { text: "Bercanda kok, aku pasti bisa dan akan sukses tahun ini", nextScene: 7, covered: true }
            ],
            characterImage: "scene 5.webp"
        },
        // Scene 6
        {
            id: 6,
            text: "Astaga, jangan seperti itu.",
            tapToContinue: true,
            choices: [],
            characterImage: "scene3.webp"
        },
        // Scene 7 - Video on "punya dong"
        {
            id: 7,
            text: "Memangnya kamu tidak punya tujuan?",
            tapToContinue: false,
            choices: [
                { text: "Memang tidak", nextScene: 8 },
                { text: "Punya dong", video: true, videoSrc: 'lie.webm' }
            ],
            characterImage: "scene3.webp"
        },
        // Scene 8 - Video then quote
        {
            id: 8,
            text: "Kalau terus seperti ini, kamu tahu risikonya kan?",
            tapToContinue: false,
            choices: [
                { text: "Tentu saja", finalVideo: true, videoSrc: '1228.webm' }
            ],
            characterImage: "scene3.webp"
        }
    ];
}

// === UTILITY FUNCTIONS ===
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function hideElement(element) {
    element.classList.add('hidden');
}

function showElement(element) {
    element.classList.remove('hidden');
}

// === SCENE RENDERING ===
async function renderScene(sceneIndex) {
    const scene = scenes[sceneIndex];
    const dialogBox = document.getElementById('dialog-box');
    const dialogText = document.getElementById('dialog-text');
    const tapToContinue = document.getElementById('tap-to-continue');
    const choicesContainer = document.getElementById('choices-container');

    // Clear previous content
    dialogBox.classList.remove('fade-out');
    choicesContainer.innerHTML = '';
    choicesContainer.className = ''; // Reset classes
    if (scene.id === 5) {
        choicesContainer.classList.add('stacked');
    }
    choicesContainer.style.opacity = '0'; // Hide choices initially
    hideElement(tapToContinue);

    // Update Character Image
    if (scene.characterImage) {
        document.getElementById('character-image').src = scene.characterImage;
    } else {
        document.getElementById('character-image').src = 'character.png';
    }

    // Trigger Confetti if needed
    if (scene.showConfetti) {
        triggerConfetti();
    }

    // Fade in animation
    await sleep(100);
    dialogBox.style.animation = 'none';
    setTimeout(() => {
        dialogBox.style.animation = 'fadeSlideIn 0.6s ease-out';
    }, 10);

    // Typewriter effect
    dialogText.textContent = '';
    await typeWriter(scene.text, dialogText);

    // Show buttons/continue after typing
    choicesContainer.style.transition = 'opacity 0.5s ease';
    choicesContainer.style.opacity = '1';

    // Handle tap to continue
    if (scene.tapToContinue) {
        showElement(tapToContinue);
        tapToContinue.onclick = () => {
            playSound('button-click.mp3');
            currentScene++;
            renderScene(currentScene);
        };
    }

    // Handle choices
    if (scene.choices && scene.choices.length > 0) {
        scene.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.dataset.index = index;

            // Assign color class based on text content
            const lowerText = choice.text.toLowerCase();
            if (lowerText.includes('ya') || lowerText.includes('tentu') || lowerText.includes('pasti') || lowerText.includes('punya')) {
                button.classList.add('btn-ya');
            } else if (lowerText.includes('tidak') || lowerText.includes('males')) {
                button.classList.add('btn-tidak');
            } else if (choice.text === "Tentu saja") {
                button.classList.add('btn-ya');
            }

            // Special behaviors
            if (choice.evading) {
                setupEvadingButton(button, choice);
            } else if (choice.swapTrigger) {
                setupSwapButton(button, choice, choicesContainer);
            } else if (choice.covered) {
                setupCoveredButton(button, choice);
            } else if (choice.video) {
                setupVideoButton(button, choice);
            } else if (choice.finalVideo) {
                setupFinalVideoButton(button, choice);
            } else {
                button.onclick = () => {
                    playSound('button-click.mp3');
                    handleChoice(choice);
                };
            }

            choicesContainer.appendChild(button);
        });
    }
}

// === TYPEWRITER HELPER ===
function typeWriter(text, element, speed = 30) {
    return new Promise(resolve => {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// === SPECIAL BUTTON BEHAVIORS ===

// Scene 2: Buttons evade cursor
function setupEvadingButton(button, choice) {
    let isEvading = false;

    const evade = (e) => {
        if (isEvading) return;
        isEvading = true;

        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < 250) { // Increased distance for faster response
            button.classList.add('evading');
            const angle = Math.atan2(deltaY, deltaX);
            const moveDistance = 200;
            const newX = -Math.cos(angle) * moveDistance;
            const newY = -Math.sin(angle) * moveDistance;

            button.style.transform = `translate(${newX}px, ${newY}px)`;

            setTimeout(() => {
                isEvading = false;
            }, 100); // Shorter cooldown for snappier movement
        }
    };

    button.addEventListener('mousemove', evade);
    button.addEventListener('click', evade);
}

// Scene 4: Button position swap
// Scene 4: Button position swap
function setupSwapButton(button, choice, container) {
    button.onclick = (e) => {
        e.preventDefault();

        // Find the other button (Tidak)
        const allButtons = container.querySelectorAll('.choice-btn');
        let targetBtn = null;

        allButtons.forEach(btn => {
            // Find the button that corresponds to the swapTarget choice
            const index = parseInt(btn.dataset.index);
            if (scenes[currentScene].choices[index].swapTarget) {
                targetBtn = btn;
            }
        });

        if (targetBtn) {
            // Swap visual properties to simulate physical swap
            const tempText = button.textContent;
            button.textContent = targetBtn.textContent;
            targetBtn.textContent = tempText;

            // Swap classes (maintain base class)
            const tempClass = button.className;
            button.className = targetBtn.className;
            targetBtn.className = tempClass;

            // Swap handlers/data indices conceptually for the game logic?
            // Actually, the request says "jadi yang di klik tidak" (so the one clicked becomes 'No')
            // So we just execute the 'Tidak' choice.

            const tidakChoice = scenes[currentScene].choices.find(c => c.swapTarget);

            // Add a small delay so user sees the swap
            setTimeout(() => {
                if (tidakChoice) {
                    handleChoice(tidakChoice);
                }
            }, 500);
        }
    };
}

// Scene 5: Character covers button
function setupCoveredButton(button, choice) {
    const characterOverlay = document.getElementById('character-overlay');

    button.addEventListener('mouseenter', () => {
        characterOverlay.classList.add('active');
        button.classList.add('covered');
    });

    button.addEventListener('mouseleave', () => {
        setTimeout(() => {
            characterOverlay.classList.remove('active');
            button.classList.remove('covered');
        }, 100);
    });

    button.onclick = (e) => {
        e.preventDefault();
        // Button should be unclickable when covered
    };
}

// Scene 7: Video trigger
function setupVideoButton(button, choice) {
    button.onclick = () => {
        const src = choice.videoSrc || 'placeholder-video.mp4';
        showVideo(src, false);
    };
}

// Scene 8: Final video and quote
function setupFinalVideoButton(button, choice) {
    button.onclick = () => {
        const src = choice.videoSrc || 'placeholder-video.mp4';
        showVideo(src, true);
    };
}

// === VIDEO HANDLING ===
function showVideo(videoSrc, showQuoteAfter) {
    const videoContainer = document.getElementById('video-container');
    const video = document.getElementById('game-video');

    // Set video source (you can replace with actual video URL)
    video.src = videoSrc;

    showElement(videoContainer);

    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Video play failed:", error);
            // If video fails (e.g. missing file), simulate end after delay
            setTimeout(() => {
                if (video.onended) video.onended();
            }, 2000);
        });
    }

    // Add error listener for source issues
    video.onerror = () => {
        console.log("Video loading error");
        setTimeout(() => {
            if (video.onended) video.onended();
        }, 2000);
    };

    if (showQuoteAfter) {
        video.onended = () => {
            hideElement(videoContainer);
            showFinalQuote();
        };
    } else {
        // For scene 7, allow user to close video
        video.onended = () => {
            hideElement(videoContainer);
        };

        videoContainer.onclick = (e) => {
            if (e.target === videoContainer) {
                hideElement(videoContainer);
                video.pause();
            }
        };
    }
}

// === FINAL QUOTE ===
function showFinalQuote() {
    const finalQuote = document.getElementById('final-quote');
    showElement(finalQuote);
}

// === CHOICE HANDLING ===
function handleChoice(choice) {
    if (choice.nextScene !== undefined) {
        currentScene = choice.nextScene - 1; // Convert to 0-indexed
        setTimeout(() => {
            renderScene(currentScene);
        }, 300);
    }
}

// === CONFETTI ANIMATION ===
function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;

    container.innerHTML = '';

    // Play SFX
    playSound('Sound effect terompet lucu.mp3');

    const colors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#ecf0f1', '#e67e22', '#1abc9c'];

    // 1. Falling Ribbons (CSS Animation) - From Top
    const ribbonCount = 40;
    for (let i = 0; i < ribbonCount; i++) {
        const ribbon = document.createElement('div');
        ribbon.className = 'confetti-ribbon';
        ribbon.style.left = Math.random() * 100 + '%';
        ribbon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Randomize animation properties
        const duration = Math.random() * 3 + 3; // 3-6s
        const delay = Math.random() * 2; // 0-2s delay
        const drift = (Math.random() - 0.5) * 200 + 'px'; // Random drift left/right

        ribbon.style.setProperty('--drift', drift);
        ribbon.style.animationDuration = duration + 's';
        ribbon.style.animationDelay = delay + 's';

        container.appendChild(ribbon);
    }

    // 2. Burst Sprays (JS Physics) - From Bottom Left & Right
    const particles = [];
    const burstCount = 80; // Particles per side

    // Helper to create particle data
    function createBurstParticle(originX, originY, directionX) {
        const element = document.createElement('div');
        element.className = 'confetti-particle';
        const color = colors[Math.floor(Math.random() * colors.length)];
        element.style.backgroundColor = color;

        // Random shape: square or rectangle
        if (Math.random() > 0.5) {
            element.style.width = '12px';
            element.style.height = '6px';
        } else {
            element.style.width = '8px';
            element.style.height = '8px';
        }

        container.appendChild(element);

        // Physics properties
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5; // Upwards with spread

        let angleRad;
        if (directionX > 0) { // From Left
            // -80 to -10 degrees (up-right)
            angleRad = -Math.PI / 2 + (Math.random() * 1.2);
        } else { // From Right
            // -100 to -170 degrees (up-left)
            angleRad = -Math.PI / 2 - (Math.random() * 1.2);
        }

        const velocity = Math.random() * 15 + 15; // Initial burst speed

        return {
            x: originX,
            y: originY,
            vx: Math.cos(angleRad) * velocity,
            vy: Math.sin(angleRad) * velocity * 1.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 20,
            friction: 0.94, // Air resistance
            gravity: 0.6,
            element: element,
            opacity: 1
        };
    }

    // Spawn Particles
    for (let i = 0; i < burstCount; i++) {
        // Left Burst
        particles.push(createBurstParticle(0, window.innerHeight, 1));
        // Right Burst
        particles.push(createBurstParticle(window.innerWidth, window.innerHeight, -1));
    }

    // Animation Loop
    let active = true;
    function animate() {
        if (!active) return;

        let aliveCount = 0;
        particles.forEach(p => {
            if (p.opacity <= 0) return;
            aliveCount++;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.friction;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.005; // Slow fade

            p.element.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
            p.element.style.opacity = p.opacity;
        });

        if (aliveCount > 0) {
            requestAnimationFrame(animate);
        } else {
            active = false;
        }
    }

    requestAnimationFrame(animate);

    // Cleanup after animation (ribbons take ~6s)
    setTimeout(() => {
        active = false;
        container.innerHTML = '';
    }, 8000);
}

// === CHARACTER IMAGE LOADING ===
function loadCharacterImage() {
    const characterImage = document.getElementById('character-image');
    // You'll replace this with actual character image
    characterImage.src = 'character.png';
    characterImage.onerror = () => {
        // If image not found, hide character area
        characterImage.style.opacity = '0.3';
    };
}

// === PRELOAD ASSETS ===
const ASSETS = {
    images: ['character.png', 'penutup.webp', 'scene 1.webp', 'scene 2.webp', 'scene3.webp', 'scene 4.webp', 'scene 5.webp'],
    videos: ['lie.webm', '1228.webm', 'placeholder-video.mp4'],
    sounds: ['confetti.mp3', 'Sound effect terompet lucu.mp3', 'button-click.mp3']
};

const audioCache = {};

function playSound(src) {
    if (audioCache[src]) {
        audioCache[src].currentTime = 0;
        audioCache[src].play().catch(e => console.warn("Audio play failed:", e));
    }
}

function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            resolve(); // Continue anyway
        };
    });
}

function preloadVideo(src) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = src;
        video.preload = 'auto';
        video.oncanplaythrough = resolve;
        video.onerror = () => {
            console.warn(`Failed to preload video: ${src}`);
            resolve(); // Continue anyway
        };
        // Force load logic if needed, but usually src assignment is enough to start buffering
        // Set a timeout to avoid hanging forever
        setTimeout(resolve, 3000);
    });
}

function preloadAudio(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = src;
        audio.preload = 'auto';
        audio.oncanplaythrough = resolve;
        audio.onerror = () => {
            console.warn(`Failed to preload audio: ${src}`);
            resolve(); // Continue anyway
        };
        // Cache it
        audioCache[src] = audio;

        setTimeout(resolve, 3000);
    });
}

async function startGame() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadText = document.querySelector('#loading-screen .loader-text');

    try {
        if (loadText) loadText.textContent = "Loading Images...";
        await Promise.all(ASSETS.images.map(preloadImage));

        if (loadText) loadText.textContent = "Loading Videos...";
        await Promise.all(ASSETS.videos.map(preloadVideo));

        if (loadText) loadText.textContent = "Loading Sounds...";
        await Promise.all(ASSETS.sounds.map(preloadAudio));

    } catch (e) {
        console.error("Loading error:", e);
    }

    // Hide loading screen
    loadingScreen.classList.add('hidden');

    // Start game
    initScenes();
    loadCharacterImage();
    renderScene(0);
}

// === INITIALIZE GAME ===
window.addEventListener('DOMContentLoaded', () => {
    startGame();
});

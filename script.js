// --- DOM Elements ---
const timeDisplay = document.getElementById('time-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const startPauseText = document.getElementById('start-pause-text');
const startPauseIcon = document.getElementById('start-pause-icon');
const resetBtn = document.getElementById('reset-btn');
const modeIndicator = document.getElementById('mode-indicator');
const progressRing = document.getElementById('progress-ring');
const mainHeader = document.getElementById('main-header');
const modeButtons = document.querySelectorAll('.mode-button'); // Select all mode buttons
const sessionCounterDisplay = document.getElementById('session-counter');
const autoContinueToggle = document.getElementById('auto-continue-toggle');
const customColorPicker = document.getElementById('custom-color-picker'); // New DOM element
const studyTopicInput = document.getElementById('study-topic-input');
const studyTopicDisplay = document.getElementById('study-topic-display');

// --- Icon SVGs ---
const playIcon = `<path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.538 0 3.286L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />`;
const pauseIcon = `<path fill-rule="evenodd" d="M5.25 4.5A.75.75 0 004.5 5.25v9.5c0 .414.336.75.75.75h2a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-2zm7.5 0A.75.75 0 0012 5.25v9.5c0 .414.336.75.75.75h2a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-2z" clip-rule="evenodd" />`;

// --- Timer State ---
let timerInterval = null;
let totalSeconds = 25 * 60;
let remainingSeconds = 25 * 60;
let isRunning = false;
let currentMode = 'Study Focus';
let sessionCount = 0;
let pomodorosUntilLongBreak = 4;

// --- Sound Synthesis ---
const synth = new Tone.Synth().toDestination();
function playSound() {
    if (Tone.context.state !== 'running') { Tone.start(); }
    synth.triggerAttackRelease("C5", "8n", Tone.now());
    synth.triggerAttackRelease("G5", "8n", Tone.now() + 0.2);
}

// --- Theming ---
const themes = {
    'forest-green': { 
        bgClass: 'bg-green-700', 
        hoverClass: 'hover:bg-green-600', 
        textColorClass: 'text-lime-400', 
        ringColorClass: 'text-lime-400',
        initialButtonColor: '#047857', // Hex for bg-green-700
        displayTextColor: '#A3E635' // Hex for lime-400
    },
    'ocean-blue': { 
        bgClass: 'bg-blue-700', 
        hoverClass: 'hover:bg-blue-600', 
        textColorClass: 'text-sky-400', 
        ringColorClass: 'text-sky-400',
        initialButtonColor: '#1d4ed8', // Hex for bg-blue-700
        displayTextColor: '#38BDF8' // Hex for sky-400
    },
    'desert-sunset': { 
        bgClass: 'bg-orange-700', 
        hoverClass: 'hover:bg-orange-600', 
        textColorClass: 'text-yellow-400', 
        ringColorClass: 'text-yellow-400',
        initialButtonColor: '#c2410c', // Hex for bg-orange-700
        displayTextColor: '#FACC15' // Hex for yellow-400
    }
};
let currentThemeName = 'forest-green'; // Tracks the active theme name ('forest-green', 'custom', etc.)

function applyTheme(themeName) {
    // First, remove all previous theme-related Tailwind classes and inline styles
    // from header, ring, and mode buttons to ensure a clean slate.
    for (const key in themes) {
        const theme = themes[key];
        mainHeader.classList.remove(theme.textColorClass);
        progressRing.classList.remove(theme.ringColorClass);
        timeDisplay.classList.remove(theme.textColorClass); // Remove old text color class
        modeButtons.forEach(button => {
            button.classList.remove(theme.bgClass, theme.hoverClass);
        });
    }
    mainHeader.style.color = ''; // Clear inline style
    progressRing.style.stroke = ''; // Clear inline style
    timeDisplay.style.color = ''; // Clear inline style for time display
    timeDisplay.style.textShadow = ''; // Clear old text shadow
    modeButtons.forEach(button => {
        button.style.backgroundColor = ''; // Clear inline style
        button.onmouseover = null; // Clear custom hover
        button.onmouseout = null;  // Clear custom hover
    });

    let currentThemeColorForDisplay = '';

    if (themeName === 'custom') {
        currentThemeColorForDisplay = customColorPicker.value;
        mainHeader.style.color = currentThemeColorForDisplay;
        progressRing.style.stroke = currentThemeColorForDisplay;
        timeDisplay.style.color = currentThemeColorForDisplay; // Apply custom color to time display
        modeButtons.forEach(button => {
            button.style.backgroundColor = currentThemeColorForDisplay;
            // Simple hover effect for custom color: slightly darker
            const darkerColor = darkenColor(currentThemeColorForDisplay, 20); // Darken by 20%
            button.onmouseover = () => button.style.backgroundColor = darkerColor;
            button.onmouseout = () => button.style.backgroundColor = currentThemeColorForDisplay;
        });
        currentThemeName = 'custom';
    } else if (themes[themeName]) {
        const theme = themes[themeName];
        currentThemeColorForDisplay = theme.displayTextColor;
        mainHeader.classList.add(theme.textColorClass);
        progressRing.classList.add(theme.ringColorClass);
        timeDisplay.classList.add(theme.textColorClass); // Apply theme text color class to time display
        modeButtons.forEach(button => {
            button.classList.add(theme.bgClass, theme.hoverClass);
        });
        currentThemeName = themeName;
        // Update custom color picker to reflect the selected predefined theme's button color
        customColorPicker.value = theme.initialButtonColor;
    }

    // Apply text shadow for 3D and glow effect
    timeDisplay.style.textShadow = `
        1px 1px 2px rgba(0,0,0,0.7),
        2px 2px 4px rgba(0,0,0,0.5),
        0 0 5px ${currentThemeColorForDisplay},
        0 0 10px ${currentThemeColorForDisplay},
        0 0 20px ${currentThemeColorForDisplay}
    `;
}

// Helper function to darken a hex color (simple version)
function darkenColor(hex, percent) {
    let f=parseInt(hex.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=(f>>8)&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// Event listener for custom color picker
customColorPicker.addEventListener('input', () => {
    applyTheme('custom');
    // Ensure the active button styling is applied correctly when a custom color is chosen
    // and a mode button is already active.
    const currentActiveButton = document.querySelector('.mode-button.active');
    if (currentActiveButton) {
        // Re-apply the active border
        currentActiveButton.classList.add('active');
    }
});

// --- Core Functions ---
function setTimer(seconds, modeName, clickedButton) {
    resetTimer(false); 
    totalSeconds = seconds;
    remainingSeconds = seconds;
    currentMode = modeName;
    updateDisplay();
    modeIndicator.textContent = modeName;
    startPauseBtn.disabled = false;
    resetBtn.disabled = false;

    // Show or hide the study topic input based on the mode
    if (modeName === 'Study Focus') {
        studyTopicInput.classList.remove('hidden');
        studyTopicDisplay.classList.add('hidden'); // Hide display when setting a new study session
    } else {
        studyTopicInput.classList.add('hidden');
        studyTopicDisplay.classList.add('hidden');
    }

    // Remove active class from all buttons
    modeButtons.forEach(button => {
        button.classList.remove('active');
    });
    // Add active class to the clicked button
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

function toggleTimer() {
    if (isRunning) pauseTimer();
    else startTimer();
}

function startTimer() {
    if (remainingSeconds <= 0) return;
    isRunning = true;
    startPauseText.textContent = 'Pause';
    startPauseIcon.innerHTML = pauseIcon;

    // Handle study topic display
    if (currentMode === 'Study Focus') {
        const topic = studyTopicInput.value.trim();
        if (topic) {
            studyTopicDisplay.textContent = `Studying: ${topic}`;
            studyTopicDisplay.classList.remove('hidden');
            studyTopicInput.classList.add('hidden');
        } else {
            // If no topic is entered, just hide the input
            studyTopicInput.classList.add('hidden');
            studyTopicDisplay.classList.add('hidden');
        }
    }
    
    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        if (remainingSeconds <= 0) {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startPauseText.textContent = 'Resume';
    startPauseIcon.innerHTML = playIcon;
}

function resetTimer(clearMode = true) {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = totalSeconds;
    updateDisplay();
    startPauseText.textContent = 'Start';
    startPauseIcon.innerHTML = playIcon;

    // Also reset study topic elements
    studyTopicInput.classList.add('hidden');
    studyTopicDisplay.classList.add('hidden');
    studyTopicInput.value = ''; // Clear the input field

    if (clearMode) {
        modeIndicator.textContent = 'Choose a mode to begin';
        startPauseBtn.disabled = true;
        resetBtn.disabled = true;
        sessionCount = 0; // Reset session count on manual reset
        updateSessionCounter();
        // Remove active class from all buttons on full reset
        modeButtons.forEach(button => {
            button.classList.remove('active');
        });
    }
}

function updateSessionCounter() {
    sessionCounterDisplay.textContent = `Sessions: ${sessionCount}`;
}

function completeSession() {
    playSound();
    let wasStudySession = currentMode === 'Study Focus';
    
    if (wasStudySession) {
        sessionCount++;
        updateSessionCounter();
        studyTopicDisplay.classList.add('hidden'); // Hide topic after study session
    }

    if (autoContinueToggle.checked) {
        if (wasStudySession) {
            // After a study session, start a break
            if (sessionCount > 0 && sessionCount % pomodorosUntilLongBreak === 0) {
                setTimer(15 * 60, 'Long Break', document.getElementById('long-break-btn')); // Pass button reference
            } else {
                setTimer(5 * 60, 'Short Break', document.getElementById('short-break-btn')); // Pass button reference
            }
        } else {
            // After a break, go back to studying
            setTimer(25 * 60, 'Study Focus', document.getElementById('study-btn')); // Pass button reference
        }
        startTimer();
    } else {
        // If not auto-continuing, just reset the state
        isRunning = false;
        startPauseText.textContent = 'Start';
        startPauseIcon.innerHTML = playIcon;
        remainingSeconds = totalSeconds;
        updateDisplay();
        // Ensure active state is cleared if not auto-continuing
        modeButtons.forEach(button => {
            button.classList.remove('active');
        });
    }
}

// Function to create and animate a single fireworks particle
function spawnFireworksParticle(svgContainer, originX, originY, color) {
    const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    particle.setAttribute("fill", color);
    particle.setAttribute("r", (Math.random() * 1) + 0.5); // Radius between 0.5 and 1.5

    particle.setAttribute("cx", originX);
    particle.setAttribute("cy", originY);

    const explosionAngle = Math.random() * Math.PI * 2; // Random angle for outward movement
    const speed = Math.random() * 3 + 0.5; // Speed between 0.5 and 3.5
    const vx = speed * Math.cos(explosionAngle);
    const vy = speed * Math.sin(explosionAngle);

    let currentX = originX;
    let currentY = originY;
    let opacity = 1;
    const lifeTime = Math.floor(Math.random() * 60) + 30; // Life between 30 and 90 frames (approx 0.5 to 1.5 seconds)

    const animateParticle = () => {
        currentX += vx * 0.1; // Scale velocity for smoother animation
        currentY += vy * 0.1;
        opacity -= 1 / lifeTime; // Fade out over its life

        particle.setAttribute("cx", currentX);
        particle.setAttribute("cy", currentY);
        particle.setAttribute("fill-opacity", Math.max(0, opacity)); // Ensure opacity doesn't go below 0

        if (opacity > 0) {
            requestAnimationFrame(animateParticle);
        } else {
            particle.remove(); // Remove particle when it fades out
        }
    };

    svgContainer.appendChild(particle);
    requestAnimationFrame(animateParticle); // Start the animation for this particle
}

function updateDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds / 60; // Use remainingSeconds / 60 to get a float for more precise progress
    const displayString = `${String(minutes).padStart(2, '0')}:${String(Math.floor(remainingSeconds % 60)).padStart(2, '0')}`;
    
    timeDisplay.textContent = displayString;
    document.title = `${displayString} - ${currentMode}`;
    
    const progress = (totalSeconds - remainingSeconds) / totalSeconds;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - progress * circumference;
    progressRing.style.strokeDashoffset = offset;

    // --- Continuous Fireworks Effect ---
    // Generate a small number of particles for a continuous effect every second
    const svgElement = document.querySelector('.relative svg');
    const radius = 45;
    const centerX = 50;
    const centerY = 50;
    const computedColor = getComputedStyle(mainHeader).color; // Get current theme color

    const particlesPerSecond = 3; // Number of particles to generate each second

    if (isRunning) { // Only generate fireworks if the timer is running
        for (let i = 0; i < particlesPerSecond; i++) {
            // Random angle around the entire circle for origin of each particle
            const randomAngleInDegrees = Math.random() * 360;
            const randomAngleInRadians = (randomAngleInDegrees - 90) * (Math.PI / 180);

            const originX = centerX + radius * Math.cos(randomAngleInRadians);
            const originY = centerY + radius * Math.sin(randomAngleInRadians);

            spawnFireworksParticle(svgElement, originX, originY, computedColor);
        }
    }
}

// --- Initial Setup ---
window.onload = () => {
    // Initial setup for the study button and theme
    setTimer(25 * 60, 'Study Focus', document.getElementById('study-btn')); 
    startPauseIcon.innerHTML = playIcon; // Set initial icon
    updateSessionCounter();
    applyTheme(currentThemeName); // Apply initial theme
};

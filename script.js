// Global variables
let roastCount = 0;
let isFireMode = false;
let isBattleMode = false;
let isGodMode = false;
let roastLibrary = [];
let currentUser = null;

// DOM Elements
const roastButton = document.getElementById('roastButton');
const roastDisplay = document.getElementById('roastDisplay');
const fireModeButton = document.getElementById('fireModeButton');
const battleModeButton = document.getElementById('battleModeButton');
const roastCountDisplay = document.getElementById('roastCount');
const leaderboardList = document.getElementById('leaderboardList');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginLink = document.getElementById('loginLink');
const signupLink = document.getElementById('signupLink');
const userDisplay = document.getElementById('userDisplay');
const logoutButton = document.getElementById('logoutButton');

// Initialize the application
function init() {
    loadRoastLibrary();
    setupEventListeners();
    updateLeaderboard();
}

// Load roast library from JSON file
async function loadRoastLibrary() {
    try {
        const response = await fetch('roastLibrary.json');
        roastLibrary = await response.json();
    } catch (error) {
        console.error('Error loading roast library:', error);
        roastLibrary = [];
    }
}

// Setup event listeners
function setupEventListeners() {
    roastButton.addEventListener('click', generateRoast);
    fireModeButton.addEventListener('click', toggleFireMode);
    battleModeButton.addEventListener('click', toggleBattleMode);
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    loginLink.addEventListener('click', showLoginForm);
    signupLink.addEventListener('click', showSignupForm);
    logoutButton.addEventListener('click', handleLogout);
}

// Toast Messages
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                type === 'error' ? 'exclamation-circle' : 
                'exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading Animation
function showLoading() {
    const loading = document.getElementById('loadingAnimation');
    loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loadingAnimation');
    loading.style.display = 'none';
}

// Funny Error Messages
const funnyErrors = [
    {
        title: "Oops! That's not how you do it!",
        message: "Even my grandma types better than that! Try again, champ! 😅"
    },
    {
        title: "Error 404: Brain Not Found",
        message: "Looks like you left your brain at home! Just kidding, try again! 🤪"
    },
    {
        title: "Houston, We Have a Problem!",
        message: "Your input just crashed our servers! (Not really, but try again!) 🚀"
    },
    {
        title: "Are You a Robot?",
        message: "Because only robots make mistakes like that! Try again, human! 🤖"
    },
    {
        title: "That's Not How This Works!",
        message: "That's not how any of this works! But don't worry, try again! 😂"
    }
];

function showFunnyError() {
    const error = getRandomElement(funnyErrors);
    const funnyError = document.createElement('div');
    funnyError.className = 'funny-error';
    funnyError.innerHTML = `
        <h3>${error.title}</h3>
        <p>${error.message}</p>
        <button onclick="this.parentElement.remove()">Got it!</button>
    `;
    document.body.appendChild(funnyError);
    funnyError.style.display = 'block';
}

// Handle Authentication
function handleAuthSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const hobby = document.getElementById('hobby').value;
    const skills = document.getElementById('skills').value;
    const studies = document.getElementById('studies').value;
    const work = document.getElementById('work').value;

    // Validate inputs
    if (!username || !hobby || !skills || !studies || !work) {
        showToast('Please fill in all fields!', 'error');
        showFunnyError();
        return;
    }

    if (username.length < 3) {
        showToast('Username too short! Make it longer than your attention span!', 'warning');
        return;
    }

    saveUser(username, hobby, skills, studies, work);
    showToast('Welcome to ROAST-WORLD! Get ready to be roasted! 🔥', 'success');
    showGameContainer();
}

// Show Game Container
function showGameContainer() {
    authContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    updateLeaderboard();
}

// Toggle Fire Mode
function toggleFireMode() {
    isFireMode = !isFireMode;
    document.body.classList.toggle('fire-mode');
    fireModeButton.classList.toggle('active');
    if (isFireMode) {
        generateRoast();
    }
}

// Toggle Battle Mode
function toggleBattleMode() {
    isBattleMode = !isBattleMode;
    document.body.classList.toggle('battle-mode');
    battleModeButton.classList.toggle('active');
    if (isBattleMode) {
        generateBattleRoast();
    }
}

// Check for God Mode
function checkGodMode() {
    if (currentUser && currentUser.roastCount >= 10) {
        isGodMode = true;
        document.body.classList.add('god-mode');
    }
}

// Play Sound Effect
function playSound(soundType) {
    // Sound-related code removed
}

// Generate Roast
async function generateRoast(name) {
    if (isBattleMode) {
        return await generateBattleRoast(name);
    }

    // 30% chance to use AI roast in normal mode, 100% in fire mode
    const useAI = isFireMode || Math.random() < 0.3;

    if (useAI) {
        try {
            showLoading();
            const roast = await generateAIroast(name);
            hideLoading();
            return roast;
        } catch (error) {
            hideLoading();
            console.error('AI roast failed, falling back to template:', error);
            showToast('AI is taking a coffee break! Using backup roasts...', 'warning');
            return generateTemplateRoast(name);
        }
    } else {
        return generateTemplateRoast(name);
    }
}

// Generate AI Roast using Huggingface API
async function generateAIroast(name) {
    const prompts = [
        `Generate a funny roast about ${name}:`,
        `Create a witty insult about ${name}:`,
        `Write a humorous burn about ${name}:`,
        `Come up with a clever roast about ${name}:`,
        `Generate a tech-related roast about ${name}:`,
        `Create a coding-related insult about ${name}:`,
        `Write a programming joke about ${name}:`
    ];

    const prompt = getRandomElement(prompts);

    try {
        const response = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_length: 50,
                    temperature: 0.9,
                    top_p: 0.9,
                    do_sample: true,
                    num_return_sequences: 1
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract the generated text and clean it up
        let roast = data[0].generated_text;
        
        // Remove the prompt from the beginning
        roast = roast.replace(prompt, '').trim();
        
        // Remove any incomplete sentences at the end
        roast = roast.replace(/[^.!?]+$/, '');
        
        // If the roast is too short or empty, fallback to template
        if (roast.length < 10) {
            throw new Error('Generated roast too short');
        }

        // Add some personality to the roast
        roast = enhanceRoast(roast);

        return roast;
    } catch (error) {
        console.error('Error generating AI roast:', error);
        throw error;
    }
}

// Enhance the AI-generated roast
function enhanceRoast(roast) {
    // Add emojis randomly
    const emojis = ['🔥', '💀', '😂', '🤣', '😭', '🤡', '👏'];
    if (Math.random() < 0.7) { // 70% chance to add emoji
        roast += ' ' + getRandomElement(emojis);
    }

    // Add emphasis randomly
    if (Math.random() < 0.3) { // 30% chance to add emphasis
        const emphasis = [' OOF!', ' SAVAGE!', ' BRUTAL!', ' ROASTED!'];
        roast += getRandomElement(emphasis);
    }

    return roast;
}

// Generate template-based roast
function generateTemplateRoast(name) {
    // Randomly choose between general and tech roasts
    const category = Math.random() < 0.3 ? 'tech' : 'general';
    const categoryData = roastLibrary.categories[category];

    const start = getRandomElement(roastLibrary[categoryData.starts]);
    const middle = getRandomElement(roastLibrary[categoryData.middles]);
    const end = getRandomElement(roastLibrary[categoryData.ends]);

    return `${start} ${middle} ${end}`.replace('{name}', name);
}

// Play Roast
async function playRoast(roast) {
    // Display roast text
    roastDisplay.textContent = roast;
    
    // Choose appropriate sound effect
    const soundEffects = Object.keys(roastLibrary.soundEffects);
    const soundEffect = getRandomElement(soundEffects);
    
    // Play sound effect
    try {
        const audio = new Audio(roastLibrary.soundEffects[soundEffect]);
        await audio.play();
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}

// Save User
function saveUser(username, hobby, skills, studies, work) {
    currentUser = {
        username,
        hobby,
        skills,
        studies,
        work,
        roastCount: 0,
        lastActive: new Date().toISOString()
    };
    localStorage.setItem('roastWorldUser', JSON.stringify(currentUser));
}

// Update Leaderboard
function updateLeaderboard(name) {
    let leaderboard = JSON.parse(localStorage.getItem('roastWorldLeaderboard') || '[]');
    
    const userIndex = leaderboard.findIndex(user => user.username === name);
    if (userIndex !== -1) {
        leaderboard[userIndex].roastCount++;
        leaderboard[userIndex].lastActive = new Date().toISOString();
    } else {
        leaderboard.push({
            username: name,
            roastCount: 1,
            lastActive: new Date().toISOString()
        });
    }

    leaderboard.sort((a, b) => b.roastCount - a.roastCount);
    leaderboard = leaderboard.slice(0, 10);
    
    localStorage.setItem('roastWorldLeaderboard', JSON.stringify(leaderboard));
    
    displayLeaderboard(leaderboard);
    checkGodMode();
}

// Display Leaderboard
function displayLeaderboard(leaderboard) {
    leaderboardList.innerHTML = '';
    leaderboard.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${index < 3 ? 'top-3' : ''}`;
        item.innerHTML = `
            <span>${index + 1}. ${user.username}</span>
            <span>🔥 ${user.roastCount} roasts</span>
        `;
        leaderboardList.appendChild(item);
    });
}

// Handle Generate Roast Button Click
async function handleGenerateRoast() {
    if (!currentUser) return;

    const roast = await generateRoast(currentUser.username);
    await playRoast(roast);
    updateLeaderboard(currentUser.username);
    
    // Update user's roast count
    currentUser.roastCount++;
    localStorage.setItem('roastWorldUser', JSON.stringify(currentUser));
}

// Generate Battle Roast
async function generateBattleRoast(name) {
    const opponent = getRandomOpponent();
    const playerRoast = await generateRoast(opponent);
    const opponentRoast = await generateRoast(name);

    return {
        player: {
            name: name,
            roast: playerRoast
        },
        opponent: {
            name: opponent,
            roast: opponentRoast
        }
    };
}

// Get Random Opponent
function getRandomOpponent() {
    const opponents = [
        "CodeMaster",
        "DebugKing",
        "SyntaxError",
        "NullPointer",
        "StackOverflow",
        "GitGuru",
        "BugHunter",
        "ByteNinja"
    ];
    return getRandomElement(opponents);
}

// Helper function to get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
} 
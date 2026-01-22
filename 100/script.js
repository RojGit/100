let participants = [];

const achievements = {
    10: '🎊 10 Members!',
    25: '⭐ 25 Members!',
    50: '🚀 Halfway There!',
    75: '💪 Almost There!',
    100: '🎉 GOAL REACHED!'
};

let achieved = new Set();

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.textContent = ['🎉', '🎊', '⭐', '🚀', '💚'][Math.floor(Math.random() * 5)];
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '0px';
    confetti.style.animation = `fall ${Math.random() * 2 + 2}s linear`;
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
}

function playSound(type) {
    // Creates a beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'add') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'milestone') {
        oscillator.frequency.value = 1200;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

function checkMilestones() {
    const total = participants.length;
    Object.keys(achievements).forEach(milestone => {
        if (total >= milestone && !achieved.has(milestone)) {
            achieved.add(milestone);
            showMilestoneAnimation(achievements[milestone]);
            playSound('milestone');
            for (let i = 0; i < 10; i++) {
                createConfetti();
            }
        }
    });
}

function showMilestoneAnimation(message) {
    const achieveDiv = document.getElementById('achievements');
    const milestone = document.createElement('div');
    milestone.className = 'achievement';
    milestone.textContent = message.split(' ')[0];
    achieveDiv.appendChild(milestone);

    setTimeout(() => milestone.remove(), 2000);
}

function incrementCounter() {
    const counter = document.getElementById('counter');
    counter.classList.add('celebration');
    participants.push({ id: Date.now(), name: `Participant ${participants.length + 1}` });
    updateDisplay();
    playSound('add');
    checkMilestones();
    setTimeout(() => counter.classList.remove('celebration'), 600);
}

function decrementCounter() {
    if (participants.length > 0) {
        participants.pop();
        updateDisplay();
        playSound('add');
    }
}

function addParticipant() {
    const nameInput = document.getElementById('nameInput');
    const phoneInput = document.getElementById('phoneInput');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (name && phone) {
        participants.push({ id: Date.now(), name: name, phone: phone });
        nameInput.value = '';
        phoneInput.value = '';
        updateDisplay();
        playSound('add');
        checkMilestones();
        nameInput.focus();
    } else {
        alert('Please enter both name and phone number');
    }
}

function removeParticipant(id) {
    participants = participants.filter(p => p.id !== id);
    updateDisplay();
    playSound('add');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addParticipant();
    }
}

function shareProgress() {
    const progress = ((participants.length / 100) * 100).toFixed(0);
    const text = `🚀 I'm at ${progress}% of the 100 WhatsApp Challenge with ${participants.length} members! Join us! 💚`;

    if (navigator.share) {
        navigator.share({
            title: '100 WhatsApp Challenge',
            text: text,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Progress copied to clipboard! 📋');
        });
    }
}

function updateDisplay() {
    const counter = document.getElementById('counter');
    counter.textContent = participants.length;

    const totalStat = document.getElementById('totalStat');
    totalStat.textContent = participants.length;

    const progressStat = document.getElementById('progressStat');
    const progress = Math.min((participants.length / 100) * 100, 100).toFixed(0);
    progressStat.textContent = progress + '%';

    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = progress + '%';

    // Big milestone animation
    if (participants.length % 10 === 0 && participants.length > 0) {
        counter.classList.add('big-milestone');
        setTimeout(() => counter.classList.remove('big-milestone'), 2000);
    }

    const list = document.getElementById('participantList');
    list.innerHTML = '';

    participants.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.innerHTML = `
            <span>#${index + 1} - ${p.name} (${p.phone})</span>
            <button class="delete-btn" onclick="removeParticipant(${p.id})">Delete</button>
        `;
        list.appendChild(item);
    });
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: 'smooth' });
}

// Initialize
updateDisplay();

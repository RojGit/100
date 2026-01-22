let tempParticipant = null;
let generatedOTP = null;
let otpAttempts = 0;

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Initialize verification page
function initVerification() {
    const urlParams = new URLSearchParams(window.location.search);
    const participantData = sessionStorage.getItem('pendingParticipant');

    if (!participantData) {
        alert('No participant data found. Please try again.');
        window.location.href = 'index.html';
        return;
    }

    tempParticipant = JSON.parse(participantData);
    document.getElementById('displayPhone').textContent = tempParticipant.phone;

    // Generate and "send" OTP
    generatedOTP = generateOTP();
    console.log('🔐 OTP for testing:', generatedOTP);
    showOTPMessage();
}

function showOTPMessage() {
    alert(`📨 OTP sent to ${tempParticipant.phone}\n\n🔐 For testing: ${generatedOTP}`);
}

function verifyOTP() {
    const otpInput = document.getElementById('otpInput').value.trim();

    if (!otpInput) {
        alert('Please enter the OTP');
        return;
    }

    if (otpInput === generatedOTP) {
        alert('✅ Verification successful!');
        addVerifiedParticipant();
    } else {
        otpAttempts++;
        if (otpAttempts >= 3) {
            alert('❌ Too many failed attempts. Please try again later.');
            window.location.href = 'index.html';
        } else {
            alert('❌ Invalid OTP. Please try again.');
            document.getElementById('otpInput').value = '';
        }
    }
}

function resendOTP() {
    generatedOTP = generateOTP();
    otpAttempts = 0;
    console.log('🔐 New OTP for testing:', generatedOTP);
    alert(`📨 OTP resent to ${tempParticipant.phone}\n\n🔐 For testing: ${generatedOTP}`);
    document.getElementById('otpInput').value = '';
}

function addVerifiedParticipant() {
    // Get the participants array from localStorage
    let participants = JSON.parse(localStorage.getItem('participants')) || [];

    // Add the verified participant
    participants.push({
        id: Date.now(),
        name: tempParticipant.name,
        phone: tempParticipant.phone,
        verified: true,
        verifiedAt: new Date().toISOString()
    });

    // Save back to localStorage
    localStorage.setItem('participants', JSON.stringify(participants));

    // Clear session storage
    sessionStorage.removeItem('pendingParticipant');

    // Redirect back to main page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function goBack() {
    sessionStorage.removeItem('pendingParticipant');
    window.location.href = 'index.html';
}

// Initialize on page load
window.addEventListener('load', initVerification);

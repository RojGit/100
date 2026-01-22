let tempParticipant = null;
let otpAttempts = 0;

// Initialize verification page
function initVerification() {
    const participantData = sessionStorage.getItem('pendingParticipant');

    if (!participantData) {
        alert('No participant data found. Please try again.');
        window.location.href = 'index.html';
        return;
    }

    tempParticipant = JSON.parse(participantData);
    document.getElementById('displayPhone').textContent = tempParticipant.phone;

    // Send OTP via Twilio Verify
    sendOTP();
}

async function sendOTP() {
    try {
        const response = await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: tempParticipant.phone,
                action: 'send'
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ ${data.message}`);
        } else {
            alert(`❌ Error: ${data.error}`);
            setTimeout(() => window.location.href = 'index.html', 2000);
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Failed to send OTP. Please try again.');
    }
}

function verifyOTP() {
    const otpInput = document.getElementById('otpInput').value.trim();

    if (!otpInput) {
        alert('Please enter the OTP');
        return;
    }

    if (otpInput.length !== 6) {
        alert('OTP must be 6 digits');
        return;
    }

    verifyCode(otpInput);
}

async function verifyCode(code) {
    try {
        const response = await fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: tempParticipant.phone,
                action: 'verify',
                code: code
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Verification successful!');
            addVerifiedParticipant();
        } else {
            otpAttempts++;
            if (otpAttempts >= 3) {
                alert('❌ Too many failed attempts. Please try again later.');
                window.location.href = 'index.html';
            } else {
                alert(`❌ Invalid code. Attempts remaining: ${3 - otpAttempts}`);
                document.getElementById('otpInput').value = '';
            }
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        alert('Failed to verify OTP. Please try again.');
    }
}

function resendOTP() {
    otpAttempts = 0;
    document.getElementById('otpInput').value = '';
    sendOTP();
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

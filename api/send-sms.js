import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phoneNumber, action } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number required' });
    }

    try {
        if (action === 'send') {
            // Send OTP via Twilio Verify
            const verification = await client.verify.v2
                .services(verifyServiceSid)
                .verifications.create({
                    to: phoneNumber,
                    channel: 'sms'
                });

            return res.status(200).json({
                success: true,
                sid: verification.sid,
                message: `OTP sent to ${phoneNumber}`
            });
        } else if (action === 'verify') {
            // Verify OTP code
            const { code } = req.body;

            if (!code) {
                return res.status(400).json({ error: 'Code required' });
            }

            const verificationCheck = await client.verify.v2
                .services(verifyServiceSid)
                .verificationChecks.create({
                    to: phoneNumber,
                    code: code
                });

            return res.status(200).json({
                success: verificationCheck.status === 'approved',
                status: verificationCheck.status,
                message: verificationCheck.status === 'approved'
                    ? 'Verification successful!'
                    : 'Invalid code'
            });
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Twilio error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to process request'
        });
    }
}

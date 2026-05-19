const otpStore = new Map(); // In-memory for dev. Use Redis in production.

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = (key, otp) => {
  otpStore.set(key, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min expiry
  // Auto-cleanup
  setTimeout(() => otpStore.delete(key), 10 * 60 * 1000);
};

const verifyOTP = (key, otp) => {
  const stored = otpStore.get(key);
  if (!stored) return { valid: false, message: 'OTP expired or not found' };
  if (stored.expiresAt < Date.now()) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP expired' };
  }
  if (stored.otp !== otp) return { valid: false, message: 'Invalid OTP' };
  otpStore.delete(key);
  return { valid: true };
};

module.exports = { generateOTP, storeOTP, verifyOTP };

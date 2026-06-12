// Validating password strength
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters",
    };
  }

  if (
    !/[0-9]/.test(password) ||
    !/[^a-zA-Z0-9]/.test(password)
  ) {
    return {
      isValid: false,
      message:
        "Password must contain at least one number and one special character",
    };
  }
  return { isValid: true };
};

module.exports = validatePasswordStrength ;
// Input validation middleware
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, one uppercase, one number
  return password.length >= 6;
};

export const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        code: "MISSING_FIELDS"
      });
    }

    // Email validation if email field is present
    if (req.body.email && !validateEmail(req.body.email)) {
      return res.status(400).json({
        message: "Invalid email format",
        code: "INVALID_EMAIL"
      });
    }

    // Password validation if password field is present
    if (req.body.password && !validatePassword(req.body.password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        code: "WEAK_PASSWORD"
      });
    }

    next();
  };
};

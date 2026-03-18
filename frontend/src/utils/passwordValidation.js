/**
 * Password validation utilities matching backend requirements
 */

// Enhanced password blacklist (same as backend)
export const COMMON_PASSWORDS = new Set([
  // Top 10 most common passwords
  '123456', 'password', '123456789', '12345678', '12345', '1234567', 
  '1234567890', '1234', 'qwerty', 'abc123',
  
  // Common variations
  'password1', 'password123', 'password123!', 'admin', 'admin123', 'admin123!',
  'letmein', 'letmein123', 'welcome', 'welcome123', 'welcome123!',
  'changeme', 'changeme123', 'default', 'default123', 'root', 'root123',
  
  // Year-based passwords
  'password2023', 'password2024', 'password2025', 'admin2023', 'admin2024',
  'welcome2023', 'welcome2024', '1234562023', '1234562024',
  
  // Keyboard patterns
  'qwerty', 'qwerty123', 'qwerty123!', 'asdf', 'asdf123', 'zxcv', 'zxcv123',
  '123qwe', 'qwe123', '1q2w3e', '1qaz2wsx',
  
  // Common names and words
  'dragon', 'master', 'superman', 'princess', 'football', 'baseball',
  'shadow', 'monkey', 'michael', 'jennifer', 'thomas', 'jordan',
  
  // Tech-related
  'computer', 'internet', 'server', 'database', 'network', 'system',
  'oracle', 'mysql', 'passwd', 'passw0rd', 'p@ssword', 'p@ssw0rd',
  
  // Business-related
  'company', 'office', 'business', 'corporate', 'manager', 'employee',
  'retail', 'store', 'shop', 'sales', 'service', 'customer',
  
  // Simple numeric patterns
  '111111', '222222', '333333', '444444', '555555', '666666',
  '777777', '888888', '999999', '000000', '123123', '321321',
  
  // Leaked passwords from major breaches
  'starwars', 'harley', 'batman', 'superman', 'ironman', 'spiderman',
  'pokemon', 'mario', 'zelda', 'halo', 'call of duty', 'fortnite',
  
  // Common phrases
  'iloveyou', 'trustno1', 'whatever', 'nothing', 'blink182',
  
  // Security-related (ironically common)
  'security', 'secure', 'protected', 'private', 'secret', 'confidential'
]);

export const validatePasswordStrength = (password) => {
  const errors = [];
  const warnings = [];
  
  // Length requirements
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }
  
  // Character requirements
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one digit (0-9)");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*()_+-=[]{}:\"|,.<>/? )");
  }
  
  // Common password blacklist
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push("Password is too common. Please choose a more secure password");
  }
  
  // Sequential characters check
  if (hasSequentialChars(password)) {
    errors.push("Password cannot contain sequential characters (e.g., '1234', 'abcd')");
  }
  
  // Repeated characters check
  if (hasRepeatedChars(password)) {
    errors.push("Password cannot contain repeated characters (e.g., 'aaaa', '1111')");
  }
  
  // Calculate strength score
  const score = calculatePasswordScore(password);
  
  // Warnings for weak but valid passwords
  if (score < 3 && errors.length === 0) {
    warnings.push("Password is weak. Consider adding more character variety");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: score,
    strength: getStrengthLabel(score)
  };
};

const hasSequentialChars = (password) => {
  const passwordLower = password.toLowerCase();
  
  // Check for numeric sequences (1234, 2345, etc.)
  for (let i = 0; i < passwordLower.length - 3; i++) {
    const substring = passwordLower.substring(i, i + 4);
    if (substring.match(/^\d{4}$/)) {
      const digits = substring.split('').map(Number);
      if (digits[1] === digits[0] + 1 && 
          digits[2] === digits[0] + 2 && 
          digits[3] === digits[0] + 3) {
        return true;
      }
    }
  }
  
  // Check for alphabetic sequences (abcd, bcde, etc.)
  for (let i = 0; i < passwordLower.length - 3; i++) {
    const substring = passwordLower.substring(i, i + 4);
    if (substring.match(/^[a-z]{4}$/)) {
      const chars = substring.split('').map(c => c.charCodeAt(0));
      if (chars[1] === chars[0] + 1 && 
          chars[2] === chars[0] + 2 && 
          chars[3] === chars[0] + 3) {
        return true;
      }
    }
  }
  
  return false;
};

const hasRepeatedChars = (password) => {
  for (let i = 0; i < password.length - 3; i++) {
    if (password[i] === password[i+1] && 
        password[i] === password[i+2] && 
        password[i] === password[i+3]) {
      return true;
    }
  }
  return false;
};

const calculatePasswordScore = (password) => {
  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety scoring
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 0.5;
  if (/\d/.test(password)) score += 0.5;
  if (/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]/.test(password)) score += 1;
  
  return Math.min(Math.floor(score), 5);
};

const getStrengthLabel = (score) => {
  switch (score) {
    case 1: return 'Very Weak';
    case 2: return 'Weak';
    case 3: return 'Fair';
    case 4: return 'Good';
    case 5: return 'Strong';
    default: return 'Very Weak';
  }
};

export const getPasswordStrengthColor = (score) => {
  switch (score) {
    case 1: return 'bg-red-500';
    case 2: return 'bg-orange-500';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-blue-500';
    case 5: return 'bg-green-500';
    default: return 'bg-red-500';
  }
};

export const getPasswordStrengthTextColor = (score) => {
  switch (score) {
    case 1: return 'text-red-600';
    case 2: return 'text-orange-600';
    case 3: return 'text-yellow-600';
    case 4: return 'text-blue-600';
    case 5: return 'text-green-600';
    default: return 'text-red-600';
  }
};

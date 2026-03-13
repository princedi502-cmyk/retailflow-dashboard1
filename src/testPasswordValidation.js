/**
 * Test frontend password validation
 */

// Import the validation functions
import { validatePasswordStrength, COMMON_PASSWORDS } from './passwordValidation.js';

// Test function
function testPasswordValidation() {
  console.log('Testing Frontend Password Validation\n');
  
  const testCases = [
    // Valid passwords
    {
      password: 'StrongPass123!',
      expected: { valid: true, minScore: 3 },
      description: 'Valid strong password'
    },
    {
      password: 'MySecure@Pass2024',
      expected: { valid: true, minScore: 3 },
      description: 'Valid password with special char'
    },
    {
      password: 'Complex#Password456',
      expected: { valid: true, minScore: 3 },
      description: 'Valid password with hash special char'
    },
    
    // Invalid passwords - length
    {
      password: 'Short1!',
      expected: { valid: false },
      description: 'Too short (7 chars)'
    },
    {
      password: 'A'.repeat(129) + '1!',
      expected: { valid: false },
      description: 'Too long (129 chars)'
    },
    
    // Invalid passwords - missing requirements
    {
      password: 'nouppercase123!',
      expected: { valid: false },
      description: 'Missing uppercase'
    },
    {
      password: 'NOLOWERCASE123!',
      expected: { valid: false },
      description: 'Missing lowercase'
    },
    {
      password: 'NoDigitsHere!',
      expected: { valid: false },
      description: 'Missing digits'
    },
    {
      password: 'NoSpecialChars123',
      expected: { valid: false },
      description: 'Missing special character'
    },
    
    // Common passwords
    {
      password: 'password123!',
      expected: { valid: false },
      description: 'Common password with special char'
    },
    {
      password: 'Admin123!',
      expected: { valid: false },
      description: 'Common admin password'
    },
    {
      password: 'Welcome123!',
      expected: { valid: false },
      description: 'Common welcome password'
    },
    
    // Sequential characters
    {
      password: 'Abcd1234!',
      expected: { valid: false },
      description: 'Sequential letters'
    },
    {
      password: '1234Abcd!',
      expected: { valid: false },
      description: 'Sequential numbers'
    },
    
    // Repeated characters
    {
      password: 'aaaaBBBB123!',
      expected: { valid: false },
      description: 'Repeated lowercase'
    },
    {
      password: 'AAAAbbbb123!',
      expected: { valid: false },
      description: 'Repeated uppercase'
    },
    {
      password: '11112222!!',
      expected: { valid: false },
      description: 'Repeated numbers'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = validatePasswordStrength(testCase.password);
    const passedTest = result.isValid === testCase.expected.valid;
    
    if (testCase.expected.minScore) {
      const scorePassed = result.score >= testCase.expected.minScore;
      if (!scorePassed) {
        console.log(`Score too low: ${result.score} (expected >= ${testCase.expected.minScore})`);
      }
    }
    
    if (passedTest) {
      console.log(`✓ PASS: ${testCase.description}`);
      passed++;
    } else {
      console.log(`✗ FAIL: ${testCase.description}`);
      console.log(`  Password: ${testCase.password}`);
      console.log(`  Expected: ${testCase.expected.valid ? 'Valid' : 'Invalid'}`);
      console.log(`  Got: ${result.isValid ? 'Valid' : 'Invalid'}`);
      console.log(`  Score: ${result.score}/5 (${result.strength})`);
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.join(', ')}`);
      }
      failed++;
    }
    console.log();
  });
  
  // Test blacklist
  console.log('Testing Password Blacklist:');
  const blacklistTests = [
    '123456', 'password', 'qwerty', 'admin123', 'welcome123',
    'password2024', 'computer', 'retail', 'starwars', 'iloveyou'
  ];
  
  let blacklistPassed = 0;
  blacklistTests.forEach(password => {
    const result = validatePasswordStrength(password);
    const isBlacklisted = COMMON_PASSWORDS.has(password.toLowerCase());
    const correctlyRejected = !result.isValid && result.errors.some(e => e.includes('common'));
    
    if (correctlyRejected) {
      console.log(`✓ "${password}" correctly blocked as common password`);
      blacklistPassed++;
    } else {
      console.log(`✗ "${password}" not properly blocked`);
    }
  });
  
  console.log(`\nBlacklist: ${blacklistPassed}/${blacklistTests.length} passed`);
  console.log(`\nOverall Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All frontend password validation tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed!');
    return false;
  }
}

// Test strength scoring
function testPasswordStrengthScoring() {
  console.log('\nTesting Password Strength Scoring:');
  
  const scoringTests = [
    { password: 'a', expectedScore: 0 },
    { password: 'Abcdefgh', expectedScore: 2 }, // 8 chars + uppercase + lowercase
    { password: 'Abcdefg1', expectedScore: 3 }, // + digit
    { password: 'Abcdefg1!', expectedScore: 4 }, // + special char
    { password: 'Abcdefgh1!', expectedScore: 5 }, // 12+ chars + all requirements
  ];
  
  let passed = 0;
  scoringTests.forEach(test => {
    const result = validatePasswordStrength(test.password);
    if (result.score === test.expectedScore) {
      console.log(`✓ "${test.password}" - Score: ${result.score}/5 (${result.strength})`);
      passed++;
    } else {
      console.log(`✗ "${test.password}" - Expected: ${test.expectedScore}, Got: ${result.score}`);
    }
  });
  
  console.log(`Scoring: ${passed}/${scoringTests.length} passed`);
  return passed === scoringTests.length;
}

// Run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  const validationPassed = testPasswordValidation();
  const scoringPassed = testPasswordStrengthScoring();
  
  if (validationPassed && scoringPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Frontend validation is working correctly.');
  } else {
    console.log('\n❌ SOME TESTS FAILED!');
    process.exit(1);
  }
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testPasswordValidation = testPasswordValidation;
  window.testPasswordStrengthScoring = testPasswordStrengthScoring;
}

import {
  loginUser,
  registerUser,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword
} from './api.js';

export const authApi = {
  login: loginUser,
  register: registerUser,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword
};

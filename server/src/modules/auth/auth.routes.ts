import { Router } from "express";
import * as controller from "./auth.controller.js";
import { validate } from "../../common/middlewares/validate.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "./auth.validators.js";
import {
  authRateLimiter,
  forgotPasswordLimiter,
} from "../../common/middlewares/rateLimit.js";
import { requireAuth } from "../../common/middlewares/auth.js";

const router = Router();

router.post(
  "/signup",
  authRateLimiter,
  validate({ body: signupSchema }),
  controller.signup,
);
router.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  controller.login,
);
router.post("/refresh", authRateLimiter, controller.refresh);
router.post("/logout", controller.logout);
router.get(
  "/verify-email",
  validate({ query: verifyEmailSchema }),
  controller.verifyEmail,
);
router.post(
  "/resend-verification",
  authRateLimiter,
  validate({ body: resendVerificationSchema }),
  controller.resendVerification,
);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate({ body: forgotPasswordSchema }),
  controller.forgotPassword,
);
router.post(
  "/reset-password",
  forgotPasswordLimiter,
  validate({ body: resetPasswordSchema }),
  controller.resetPassword,
);
router.get("/me", requireAuth, controller.me);

export default router;

import { Router } from "express";
import * as controller from "./users.controller.js";
import { validate } from "../../common/middlewares/validate.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  addressSchema,
  addressUpdateSchema,
  adminUserListQuerySchema,
  adminUpdateUserSchema,
  idParamSchema,
} from "./users.validators.js";
import { requireAuth, requireRole } from "../../common/middlewares/auth.js";

const router = Router();

// Me
router.get("/me", requireAuth, controller.getMe);
router.patch(
  "/me",
  requireAuth,
  validate({ body: updateProfileSchema }),
  controller.updateMe,
);
router.post(
  "/me/password",
  requireAuth,
  validate({ body: changePasswordSchema }),
  controller.changePassword,
);
router.post("/me/delete", requireAuth, controller.deleteMe);
router.post("/me/avatar", requireAuth, controller.avatarUploadTicket);

// Addresses
router.get("/me/addresses", requireAuth, controller.listAddresses);
router.post(
  "/me/addresses",
  requireAuth,
  validate({ body: addressSchema }),
  controller.createAddress,
);
router.patch(
  "/me/addresses/:id",
  requireAuth,
  validate({ params: idParamSchema, body: addressUpdateSchema }),
  controller.updateAddress,
);
router.delete(
  "/me/addresses/:id",
  requireAuth,
  validate({ params: idParamSchema }),
  controller.deleteAddress,
);

// Admin
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate({ query: adminUserListQuerySchema }),
  controller.adminListUsers,
);
router.get(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema }),
  controller.adminGetUser,
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate({ params: idParamSchema, body: adminUpdateUserSchema }),
  controller.adminUpdateUser,
);

export default router;

import express from "express";

import { validateBody } from "../../decorators/index.js";

import authControllers from "../../controllers/auth-controllers.js";

import usersSchemas from "../../Schemas/users-schemas.js";

// import authenticate from "../../middlewares/authenticate.js";
import { authenticate, upload } from "../../middlewares/index.js";

const authRouter = express.Router();
authRouter.post(
  "/signup",
  validateBody(usersSchemas.userSignupSchema),
  authControllers.signup
);
authRouter.get("/verify/:verificationCode", authControllers.verifyEmail);
authRouter.post(
  "/verify",
  validateBody(usersSchemas.emailSchema),
  authControllers.resendVerifyEmail
);
authRouter.post(
  "/signin",
  validateBody(usersSchemas.userSignInSchema),
  authControllers.signin
);
authRouter.get("/current", authenticate, authControllers.getCurrent);
authRouter.post("/signout", authenticate, authControllers.signout);
authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authControllers.updateAvatar
);
export default authRouter;

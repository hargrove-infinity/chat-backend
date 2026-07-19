import { Router } from "express";
import { paths } from "../common/paths";
import { logger } from "../logger";
import { userRepository } from "../repositories/user.repository";

export const authRouter = Router();

/**
 * Authenticates user credentials against mocked data,
 * and returns a base64-encoded user payload on successful login
 */
authRouter.post(paths.auth.login, async (req, res) => {
  const { email, password } = req.body;

  const [user, userError] = await userRepository.findFirstBy({
    email,
    password,
  });

  if (userError) {
    logger.error({ error: userError }, "Failed to login user in POST /login");

    res.status(500).send({ errors: ["Unknown error"] });
    return;
  }

  if (!user) {
    res.status(400).send({ errors: ["Wrong credentials"] });
    return;
  }

  const { password: _, ...rest } = user;

  const encoded = Buffer.from(JSON.stringify(rest)).toString("base64");

  res.send({ payload: encoded });
});

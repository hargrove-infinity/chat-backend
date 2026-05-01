import { Router } from "express";
import { paths } from "../common/paths";
import { userRepository } from "../repositories/user.repository";

export const authRoutes = Router();

/**
 * Authenticates user credentials against mocked data,
 * and returns a base64-encoded user payload on successful login
 */
authRoutes.post(paths.auth.login, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findFirstBy({ email, password });

    if (!user) {
      res.status(400).send({ errors: ["Wrong credentials"] });
      return;
    }

    const { password: _, ...rest } = user;

    const encoded = Buffer.from(JSON.stringify(rest)).toString("base64");

    res.send({ payload: encoded });
  } catch (error) {
    // TODO: change later
    if (error instanceof Error) {
      res.status(500).send({ errors: [error.message] });
      return;
    }
    res.status(500).send({ errors: ["Unknown error"] });
  }
});

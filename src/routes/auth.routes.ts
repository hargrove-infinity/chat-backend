import { Router } from "express";
import { paths } from "../common";
import { db } from "../_mock/db";

export const authRoutes = Router();

/**
 * Authenticates user credentials against mocked data,
 * and returns a base64-encoded user payload on successful login
 */
authRoutes.post(paths.auth.login, async (req, res) => {
  const { email, password } = req.body;

  const foundUser = db.users.find(
    (user) => user.email === email && user.password === password,
  );

  if (!foundUser) {
    res.status(400).send({ errors: ["Wrong credentials"] });
    return;
  }

  const { password: _, ...rest } = foundUser;
  const encoded = Buffer.from(JSON.stringify(rest)).toString("base64");

  res.send({ payload: encoded });
});

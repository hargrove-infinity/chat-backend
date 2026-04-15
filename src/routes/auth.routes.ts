// TODO: uncomment
// import { eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../_mock/db";
import { paths } from "../common/paths";
// TODO: uncomment
// import { userTable } from "../db/schema";
// import { userRepository } from "../repositories/user.repository";

export const authRoutes = Router();

/**
 * Authenticates user credentials against mocked data,
 * and returns a base64-encoded user payload on successful login
 */
authRoutes.post(paths.auth.login, async (req, res) => {
  const { email, password } = req.body;

  const user = db.users.find(
    (user) => user.email === email && user.password === password,
  );

  if (!user) {
    res.status(400).send({ errors: ["Wrong credentials"] });
    return;
  }

  // TODO: uncomment
  // const [user, error] = await userRepository.findFirst({
  //   where: eq(userTable.email, email),
  // });

  // if (error) {
  //   res.status(500).send({ errors: ["Internal server error"] });
  //   return;
  // }

  // if (!user) {
  //   res.status(400).send({ errors: ["Wrong credentials"] });
  //   return;
  // }

  // // TODO: replace with bcrypt method
  // if (user.password !== password) {
  //   res.status(400).send({ errors: ["Wrong credentials"] });
  //   return;
  // }

  const { password: _, ...rest } = user;

  const encoded = Buffer.from(JSON.stringify(rest)).toString("base64");

  res.send({ payload: encoded });
});

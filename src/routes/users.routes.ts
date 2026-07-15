import { type Request, type Response, Router } from "express";
import { paths } from "../common/paths";
import { logger } from "../logger";
import { authMiddleware } from "../middlewares/auth.middleware";
import { usersService } from "../services/users.service";
import type { QueryParamsUsersSearchInput } from "../validation/users";

export const usersRouter = Router();

/**
 * Returns a paginated list of users matching a search text,
 * filtered by first name, last name, or email
 */
usersRouter.get(
  paths.users.list,
  authMiddleware("header"),
  async (
    req: Request<object, object, object, QueryParamsUsersSearchInput>,
    res: Response,
  ) => {
    const { user } = req;
    const { text, page, size } = req.query;

    if (!user) {
      logger.warn("User is not attached to request in GET /users");
      res.status(400).send({ errors: ["User is not attached"] });
      return;
    }

    const [users, error] = await usersService.findByText({
      text,
      page,
      size,
    });

    if (error) {
      logger.error(
        { error, userId: user.id },
        "Failed to fetch chats in GET /users",
      );

      res.status(500).send({ errors: [error.message] });
      return;
    }

    res.send({ payload: users });
  },
);

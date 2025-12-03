import { Hono } from "hono";
import posts from "./posts";
import comments from "./comments";
import likes from "./likes";
import reports from "./reports";
import follows from "./follows";
import users from "./users";
import upload from "./upload";

const routes = new Hono();

routes.route("/posts", posts);
routes.route("/comments", comments);
routes.route("/likes", likes);
routes.route("/reports", reports);
routes.route("/follows", follows);
routes.route("/users", users);
routes.route("/upload", upload);

export default routes;

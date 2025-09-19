import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {getUsersForSidebar,getMessages,sendMessage} from "../controllers/messageControllers.js"
const router = express.Router();

router.get("/users",protect,getUsersForSidebar);
router.get("/:id",protect,getMessages);
router.post("/:id",protect,sendMessage);
export default router;
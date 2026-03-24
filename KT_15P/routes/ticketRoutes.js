const express = require("express");
const upload = require("../middlewares/upload");
const ticketController = require("../controllers/ticketController");

const router = express.Router();

router.get("/", ticketController.showList);
router.get("/add", ticketController.showAddForm);
router.post("/add", upload.single("image"), ticketController.createNewTicket);
router.get("/:ticketId", ticketController.getTicketDetail);
router.get("/:ticketId/edit", ticketController.renderEditForm);
router.post(
  "/:ticketId/edit",
  upload.single("image"),
  ticketController.updateTicket
);
router.post("/:ticketId/delete", ticketController.deleteTicket);

module.exports = router;

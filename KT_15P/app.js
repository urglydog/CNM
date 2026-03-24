require("dotenv").config();

const express = require("express");
const path = require("path");
const upload = require("./middlewares/upload");
const ticketController = require("./controllers/ticketController");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.redirect("/tickets");
});

// Routes CRUD cho EventTickets.
app.get("/tickets", ticketController.showList);
app.get("/tickets/add", ticketController.showAddForm);
app.post("/tickets/add", upload.single("image"), ticketController.createNewTicket);
app.get("/tickets/:ticketId", ticketController.getTicketDetail);
app.get("/tickets/:ticketId/edit", ticketController.renderEditForm);
app.post("/tickets/:ticketId/edit", upload.single("image"), ticketController.updateTicket);
app.post("/tickets/:ticketId/delete", ticketController.deleteTicket);

app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  return res.status(500).render("tickets/index", {
    tickets: [],
    query: "",
    status: "",
    message: "Co loi he thong. Vui long thu lai.",
    messageType: "danger",
  });
});

app.listen(PORT, () => {
  console.log(`Express app is running at http://localhost:${PORT}`);
});

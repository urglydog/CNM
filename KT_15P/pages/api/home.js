const path = require("path");
const fs = require("fs/promises");
const ejs = require("ejs");
const { getItems } = require("../../models/Item");

module.exports = async function handler(req, res) {
  try {
    const items = await getItems();
    const templatePath = path.join(process.cwd(), "views", "index.ejs");
    const template = await fs.readFile(templatePath, "utf-8");
    const html = ejs.render(template, { items });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).json({
      message: "Khong the render giao dien",
      error: error.message,
    });
  }
};

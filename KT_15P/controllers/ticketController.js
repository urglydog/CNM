const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3, region } = require("../aws");
const {
    listTickets,
    getTicketById,
    createTicket,
    updateTicket: putTicket,
    deleteTicket: deleteTicketById,
} = require("../models/ticketModel");

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const validCategories = ["Standard", "VIP", "VVIP"];
const validStatuses = ["Upcoming", "Sold", "Cancelled"];

function parseNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : NaN;
}

function isTodayOrFuture(dateStr) {
    const selected = new Date(dateStr);
    if (Number.isNaN(selected.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
}

// Ham nghiep vu tinh tong tien va tien cuoi cung sau khi giam gia.
function calculateAmounts(quantity, pricePerTicket, category) {
    const totalAmount = quantity * pricePerTicket;
    let discountRate = 0;

    if (category === "VIP" && quantity >= 4) {
        discountRate = 0.1;
    }

    if (category === "VVIP" && quantity >= 2) {
        discountRate = 0.15;
    }

    const finalAmount = Number((totalAmount * (1 - discountRate)).toFixed(2));
    return { totalAmount, finalAmount };
}

// Ham validate du lieu dau vao theo de bai.
function validateInput(data) {
    const errors = [];
    const quantity = parseNumber(data.quantity);
    const pricePerTicket = parseNumber(data.pricePerTicket);

    if (!data.eventName || !String(data.eventName).trim()) {
        errors.push("Ten su kien khong duoc de trong.");
    }

    if (!data.holderName || !String(data.holderName).trim()) {
        errors.push("Ten nguoi so huu khong duoc de trong.");
    }

    if (!validCategories.includes(data.category)) {
        errors.push("Category chi nhan Standard, VIP, VVIP.");
    }

    if (!validStatuses.includes(data.status)) {
        errors.push("Status chi nhan Upcoming, Sold, Cancelled.");
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        errors.push("Quantity phai lon hon 0.");
    }

    if (!Number.isFinite(pricePerTicket) || pricePerTicket <= 0) {
        errors.push("Price per ticket phai lon hon 0.");
    }

    if (!isTodayOrFuture(data.eventDate)) {
        errors.push("Event date phai lon hon hoac bang ngay hien tai.");
    }

    return {
        errors,
        parsed: {
            quantity,
            pricePerTicket,
        },
    };
}

// Ham upload anh len S3, tra ve URL de luu vao DB.
async function uploadImageToS3(file) {
    if (!file) {
        return "";
    }

    if (!S3_BUCKET_NAME) {
        throw new Error("Chua cau hinh S3_BUCKET_NAME trong .env");
    }

    const extension = (file.originalname.split(".").pop() || "jpg").toLowerCase();
    const key = `tickets/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);
    return `https://${S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
}

function renderForm(res, view, payload) {
    return res.status(400).render(view, payload);
}

async function showList(req, res) {
    try {
        const query = String(req.query.q || "").trim();
        const status = String(req.query.status || "").trim();
        const tickets = await listTickets({ query, status });

        return res.render("tickets/index", {
            tickets,
            query,
            status,
            message: req.query.message || "",
            messageType: req.query.messageType || "success",
        });
    } catch (error) {
        return res.status(500).render("tickets/index", {
            tickets: [],
            query: "",
            status: "",
            message: `Khong the tai danh sach: ${error.message}`,
            messageType: "danger",
        });
    }
}

function showAddForm(req, res) {
    return res.render("tickets/add", {
        ticket: {
            eventName: "",
            holderName: "",
            category: "Standard",
            quantity: "",
            pricePerTicket: "",
            eventDate: "",
            status: "Upcoming",
        },
        errors: [],
    });
}

async function createNewTicket(req, res) {
    try {
        const { errors, parsed } = validateInput(req.body);

        if (errors.length) {
            return renderForm(res, "tickets/add", {
                ticket: req.body,
                errors,
            });
        }

        const imageUrl = req.file ? await uploadImageToS3(req.file) : "";
        const ticketId = crypto.randomUUID();
        const now = new Date().toISOString();
        const { totalAmount, finalAmount } = calculateAmounts(
            parsed.quantity,
            parsed.pricePerTicket,
            req.body.category
        );

        const ticket = {
            ticketId,
            eventName: String(req.body.eventName).trim(),
            holderName: String(req.body.holderName).trim(),
            category: req.body.category,
            quantity: parsed.quantity,
            pricePerTicket: parsed.pricePerTicket,
            eventDate: req.body.eventDate,
            status: req.body.status,
            imageUrl,
            createdAt: now,
            totalAmount,
            finalAmount,
        };

        await createTicket(ticket);
        return res.redirect(
            "/tickets?message=Them%20ve%20thanh%20cong&messageType=success"
        );
    } catch (error) {
        return renderForm(res, "tickets/add", {
            ticket: req.body,
            errors: [error.message],
        });
    }
}

async function getTicketDetail(req, res) {
    try {
        const ticket = await getTicketById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).send("Khong tim thay ticket.");
        }

        return res.render("detail", { ticket });
    } catch (error) {
        return res.status(500).send(`Loi he thong: ${error.message}`);
    }
}

async function renderEditForm(req, res) {
    try {
        const ticket = await getTicketById(req.params.ticketId);
        if (!ticket) {
            return res.status(404).send("Khong tim thay ticket.");
        }

        return res.render("edit", {
            ticket,
            errors: [],
        });
    } catch (error) {
        return res.status(500).send(`Loi he thong: ${error.message}`);
    }
}

async function updateTicket(req, res) {
    try {
        const existing = await getTicketById(req.params.ticketId);
        if (!existing) {
            return res.status(404).send("Khong tim thay ticket.");
        }

        const { errors, parsed } = validateInput(req.body);
        if (errors.length) {
            return renderForm(res, "edit", {
                ticket: {
                    ...existing,
                    ...req.body,
                    ticketId: existing.ticketId,
                },
                errors,
            });
        }

        const imageUrl = req.file ?
            await uploadImageToS3(req.file) :
            existing.imageUrl || "";

        const { totalAmount, finalAmount } = calculateAmounts(
            parsed.quantity,
            parsed.pricePerTicket,
            req.body.category
        );

        const updatedTicket = {
            ticketId: existing.ticketId,
            eventName: String(req.body.eventName).trim(),
            holderName: String(req.body.holderName).trim(),
            category: req.body.category,
            quantity: parsed.quantity,
            pricePerTicket: parsed.pricePerTicket,
            eventDate: req.body.eventDate,
            status: req.body.status,
            imageUrl,
            createdAt: existing.createdAt,
            totalAmount,
            finalAmount,
        };

        await putTicket(updatedTicket);

        return res.redirect(
            "/tickets?message=Cap%20nhat%20ve%20thanh%20cong&messageType=success"
        );
    } catch (error) {
        return renderForm(res, "edit", {
            ticket: req.body,
            errors: [error.message],
        });
    }
}

async function deleteTicket(req, res) {
    try {
        await deleteTicketById(req.params.ticketId);
        return res.redirect(
            "/tickets?message=Xoa%20ve%20thanh%20cong&messageType=warning"
        );
    } catch (error) {
        return res.redirect(
            `/tickets?message=${encodeURIComponent(error.message)}&messageType=danger`
        );
    }
}

module.exports = {
    showList,
    showAddForm,
    createNewTicket,
    renderEditForm,
    updateTicket,
    deleteTicket,
    getTicketDetail,
};
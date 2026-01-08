import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "public/uploads/items/";

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Kiểm tra file type 
function fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File không hợp lệ! Chỉ cho phép PNG/JPG/WEBP."), false);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + ext;
        cb(null, filename);
    }
});

export const uploadItemImg = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

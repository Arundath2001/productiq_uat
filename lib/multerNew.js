import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = "uploads/";

        if (req.baseUrl?.includes('sea-batch') || req.body.uploadType === "seaVoyage") {
            uploadPath = "uploads/seaVoyages/";
        } else if (req.baseUrl.includes('voyage') || req.body.uploadType === "airVoyage") {
            uploadPath = "uploads/airVoyages/"
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/webp'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;

export const uploadAirCargoImages = upload.array('images', 10);

export const uploadSeaBatchImages = upload.fields([
    { name: 'deliveryPaperImage', maxCount: 1 },
    { name: 'productImages', maxCount: 5 }
]);

export const uploadSingleImage = upload.single('image');

export const uploadMultipleImages = (fieldName, maxCount) => upload.array(fieldName, maxCount);

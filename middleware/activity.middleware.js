import { logUserActivity } from "../utils/activityLogger.js";
import mongoose from "mongoose";

const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const nonMutationPaths = new Set([
    "/api/package/package-details",
    "/api/branch/check-usernames",
    "/api/voyage/get-uploaded-product",
    "/api/auth/update-expo-token",
    "/api/auth/remove-expo-token"
]);
const sensitiveFields = new Set([
    "password",
    "newpassword",
    "confirmpassword",
    "token",
    "expopushtoken"
]);

const routeModules = {
    "/api/auth": "user_management",
    "/api/savedcode": "customer_code",
    "/api/branch": "branch_management",
    "/api/companycode": "company_management",
    "/api/app": "app_content",
    "/api/package": "package_management",
    "/api/billoflading": "bill_of_lading",
    "/api/notification": "notification",
    "/api/goni": "goni_management",
    "/api/line": "shipping_line",
    "/api/container-company": "container_company",
    "/api/sea-batch": "sea_batch",
    "/api/product-type": "product_type",
    "/api/printedqr": "qr_management"
};

const cleanValue = (value, depth = 0) => {
    if (depth > 2 || value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.slice(0, 10).map(item => cleanValue(item, depth + 1));
    if (typeof value !== "object") return value;

    return Object.fromEntries(
        Object.entries(value)
            .filter(([key]) => !sensitiveFields.has(key.toLowerCase()))
            .slice(0, 25)
            .map(([key, item]) => [key, cleanValue(item, depth + 1)])
    );
};

const getAction = (req) => {
    const path = `${req.baseUrl}${req.route?.path || req.path}`.toLowerCase();

    if (path.includes("approve-client")) return "approve_client";
    if (path.includes("reject-client")) return "reject_client";
    if (path.includes("resubmit-client")) return "resubmit_client";
    if (path.includes("add-admin")) return "add_branch_admin";
    if (path.includes("/admin/") && req.method === "DELETE") return "remove_branch_admin";
    if (path.includes("/admin/") && req.method === "PUT") return "update_branch_admin";
    if (path.includes("changepassword")) return "change_password";
    if (path.includes("sendnoti")) return "send_notification";
    if (path.includes("read-all")) return "mark_notifications_read";
    if (path.includes("/read")) return "mark_notification_read";
    if (path.includes("update-status")) return "update_print_status";
    if (path.includes("remove-product")) return "remove_package_product";
    if (path.includes("/weight")) return "update_package_weight";
    if (path.includes("/upload")) return "upload";
    if (path.includes("/assign")) return "assign";
    if (path.includes("/close")) return "close";
    if (req.method === "DELETE") return "delete";
    if (req.method === "PATCH" || req.method === "PUT") return "update";
    return "create";
};

const getTargetName = (req) => {
    const body = req.body || {};
    return body.productCode ||
        body.companyCode ||
        body.username ||
        body.branchName ||
        body.packageName ||
        body.lineName ||
        body.containerCompanyName ||
        body.itemType ||
        body.seaBatchNumber ||
        body.billNo ||
        null;
};

const describeAction = ({ action, module, targetName }) => {
    const actionLabel = action.replaceAll("_", " ");
    const moduleLabel = module.replaceAll("_", " ");
    return `${actionLabel.charAt(0).toUpperCase()}${actionLabel.slice(1)}${targetName ? ` ${targetName}` : ""} in ${moduleLabel}`;
};

export const auditSuccessfulMutation = (req, res, next) => {
    const requestPath = req.originalUrl.split("?")[0];
    if (!mutationMethods.has(req.method) || nonMutationPaths.has(requestPath)) return next();

    res.on("finish", () => {
        if (
            res.statusCode < 200 ||
            res.statusCode >= 400 ||
            !req.user ||
            req.activityLogged
        ) {
            return;
        }

        const module = routeModules[req.baseUrl] || req.baseUrl.replace("/api/", "").replaceAll("-", "_");
        const action = getAction(req);
        const targetName = getTargetName(req);
        const entityIdCandidate =
            req.params?.userId ||
            req.params?.codeId ||
            req.params?.id ||
            req.params?.imageId ||
            req.params?.packageId ||
            req.params?.adminId ||
            req.params?.goniId ||
            req.params?.lineId ||
            req.params?.containerCompanyId ||
            req.params?.seaBatchId ||
            req.params?.itemTypeId ||
            null;
        const entityId = mongoose.isValidObjectId(entityIdCandidate) ? entityIdCandidate : null;

        void logUserActivity({
            req,
            action,
            module,
            entityType: module,
            entityId,
            branchId: req.params?.branchId || req.user?.branchId,
            description: describeAction({ action, module, targetName }),
            metadata: {
                method: req.method,
                path: req.originalUrl.split("?")[0],
                params: cleanValue(req.params),
                changes: cleanValue(req.body)
            }
        });
    });

    next();
};

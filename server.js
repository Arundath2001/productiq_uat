import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import chalk from "chalk";
import { connectDb } from "./lib/db.js";
import authRoutes from "./routers/auth.route.js";
import cookieParser from "cookie-parser";
import voyageRoutes from "./routers/voyage.route.js";
import saveCodeRoutes from "./routers/savedcode.route.js";
import printedQrRoutes from "./routers/printedQr.route.js";
import billOfLading from "./routers/billoflading.route.js";
import contactRoutes from "./routers/contact.routes.js";
import companyRoutes from "./routers/company.route.js";
import branchRoutes from "./routers/branch.route.js";
import trackproductRoutes from "./routers/trackproduct.route.js";
import goniRoutes from "./routers/goni.route.js";
import packageRoutes from "./routers/package.route.js";
import appControlRoutes from "./routers/appControl.route.js";
import seaVoyageRoutes from "./routers/seaVoyage.route.js";
import seaContainerRoutes from "./routers/seaContainer.router.js";
import lineRoutes from "./routers/line.route.js";
import containerCompanyRoutes from "./routers/containerCompany.route.js";
import seaBatchRoutes from "./routers/seaBatch.route.js";
import seaBatchAssignRoutes from "./routers/seaBatchAssign.route.js";
import productTypeRoutes from "./routers/productType.route.js";
import airlineRoutes from "./routers/airline.route.js";
import airportRoutes from "./routers/airport.route.js";
import cors from "cors";
import path from "path";
import { app, server, io } from "./lib/socket.js";
import notificationRoutes from "./routers/notification.route.js";
import dashboardRoutes from "./routers/dashboard.route.js";
import { setupVoyageAutomation } from "./controllers/voyage.controller.js";
import compression from "compression";
import userActivityRoutes from "./routers/userActivity.route.js";
import { auditSuccessfulMutation } from "./middleware/activity.middleware.js";

dotenv.config();

const port = process.env.PORT;

const __dirname = path.resolve();

const allowedOrigins = [
  "http://localhost:5173",
  "https://aswaqforwarder.com",
  "https://uat.aswaqforwarder.com",
  "https://productiq-web.onrender.com",
  "https://www.aswaqforwarder.com",
  "https://www.uat.aswaqforwarder.com",
  "http://localhost:8081"
];

app.use(compression());

const morganFormat = function (tokens, req, res) {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res) || '-';

  const statusColor = status >= 500 ? chalk.red(status)
    : status >= 400 ? chalk.yellow(status)
      : status >= 300 ? chalk.cyan(status)
        : chalk.green(status);

  return `${chalk.bold.blue(method)} ${chalk.white(url)} ${statusColor} ${chalk.magenta(responseTime + ' ms')}`;
};
app.use(morgan(morganFormat));

app.use(express.json())
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.use(auditSuccessfulMutation);

app.use("/api/auth", authRoutes);
app.use("/api/voyage", voyageRoutes);
app.use("/api/printedqr", printedQrRoutes);
app.use("/api/savedcode", saveCodeRoutes);
app.use("/api/billoflading", billOfLading);
app.use("/api/notification", notificationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/companycode", companyRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/trackproduct", trackproductRoutes);
app.use("/api/goni", goniRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/app", appControlRoutes);
app.use("/api/sea-voyage", seaVoyageRoutes);
app.use("/api/sea-container", seaContainerRoutes);
app.use("/api/line", lineRoutes);
app.use("/api/container-company", containerCompanyRoutes);
app.use("/api/sea-batch", seaBatchRoutes);
app.use("/api/sea-batch-assignment", seaBatchAssignRoutes);
app.use("/api/product-type", productTypeRoutes);
app.use("/api/user-activity", userActivityRoutes);
app.use("/api/airline", airlineRoutes);
app.use("/api/airport", airportRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../client/dist")))

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  })
}

console.log('Initializing voyage automation...');
setupVoyageAutomation(io);

server.listen(port, () => {
  connectDb();
  console.log(`Server started at http://localhost:${port}`);
  console.log("Voyage automation is active");
})

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const record_routes_1 = __importDefault(require("./routes/record.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Connect to Database
(0, db_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // For parsing JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // For parsing URL-encoded data
// Routes
app.use('/api/records', record_routes_1.default);
// Root Endpoint
app.get('/', (req, res) => {
    res.send('CloudKeep Server is Running');
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

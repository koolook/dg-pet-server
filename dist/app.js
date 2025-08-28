"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_1 = require("socket.io");
const articleRouter_1 = __importDefault(require("./routes/articleRouter"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const uploadRouter_1 = __importDefault(require("./routes/uploadRouter"));
const Cron_1 = require("./services/Cron");
const app = (0, express_1.default)();
const port = config_1.default.get('port') || 4000;
if (!config_1.default.get('jwtSecret')) {
    throw new Error('JWT secret is not set. Set environment variable `HOST_JWT_SECRET` before you start server.');
}
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: 'http://localhost:3000',
}));
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
// io.use(socketAuthStrict) // ????
io.on('connection', (socket) => {
    console.log('A user connected ');
});
app.use('/static', express_1.default.static('static'));
app.use('/uploaded', express_1.default.static('uploaded'));
app.use('/auth', authRouter_1.default);
app.use('/article', articleRouter_1.default);
app.use('/upload', uploadRouter_1.default);
app.get('/', (req, res) => {
    res.send('>>> Hello from Express with TypeScript!');
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Connect DB!');
            yield mongoose_1.default.connect(config_1.default.get('dbUrl') || 'mongodb://mongodb:27017/');
            server.listen(port, () => {
                // startCronJob(io)
                (0, Cron_1.initCron)(io);
                console.log(`Server running on http://localhost:${port}`);
            });
        }
        catch (error) {
            console.log('Server Error', error.message);
            process.exit(1);
        }
    });
}
start();
//# sourceMappingURL=app.js.map
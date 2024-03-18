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
const debug_1 = __importDefault(require("debug"));
const logger = (0, debug_1.default)('core');
const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);
const load = delays.map((delay) => () => new Promise((resolve) => {
    setTimeout(() => resolve(Math.floor(delay / 100)), delay);
}));
const throttle = (_a) => __awaiter(void 0, [_a], void 0, function* ({ workers, tasks, }) {
    // implemente aqui
    return [];
});
const bootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
    logger('Starting...');
    const start = Date.now();
    const answers = yield throttle({ workers: 5, tasks: load });
    logger('Done in %dms', Date.now() - start);
    logger('Answers: %O', answers);
});
bootstrap().catch((err) => {
    logger('General fail: %O', err);
});

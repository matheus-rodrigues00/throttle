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
const workers_hashmap = new Map();
const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);
const load = delays.map((delay) => () => new Promise((resolve) => {
    setTimeout(() => resolve(Math.floor(delay / 100)), delay);
}));
const logWorkersInfo = () => {
    workers_hashmap.forEach((worker, index) => {
        const { tasks, total_time } = worker;
        const numTasks = tasks.length;
        const totalTimeMs = total_time / 10;
        const color = totalTimeMs >= 5 ? '\x1b[31m' : '\x1b[32m';
        logger(color +
            'Worker %d finished %d tasks and took %d seconds to finish them' +
            '\x1b[0m', index, numTasks, totalTimeMs.toFixed(2));
    });
};
const runNextWorkload = (state, tasks, worker) => __awaiter(void 0, void 0, void 0, function* () {
    const curr_index = state.index++;
    const task = tasks[curr_index];
    if (!workers_hashmap.has(worker)) {
        workers_hashmap.set(worker, {
            tasks: [],
            total_time: 0,
        });
    }
    if (task) {
        const result = yield task();
        workers_hashmap.get(worker).tasks.push(curr_index);
        workers_hashmap.get(worker).total_time += result;
        state.results[curr_index] = result;
        yield runNextWorkload(state, tasks, worker);
    }
});
const throttle = (_a) => __awaiter(void 0, [_a], void 0, function* ({ workers, tasks, }) {
    const state = {
        results: [],
        running_tasks: [],
        index: 0,
    };
    while (state.running_tasks.length < workers && state.index < tasks.length) {
        state.running_tasks.push(runNextWorkload(state, tasks, state.running_tasks.length + 1));
    }
    yield Promise.all(state.running_tasks);
    return state.results;
});
const bootstrap = () => __awaiter(void 0, void 0, void 0, function* () {
    logger('Starting...');
    const start = Date.now();
    const answers = yield throttle({ workers: 5, tasks: load });
    logger('Done in %dms', Date.now() - start);
    logger('Answers: %O', answers);
    logWorkersInfo();
});
bootstrap().catch((err) => {
    logger('General fail: %O', err);
});

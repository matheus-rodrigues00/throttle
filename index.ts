import debug from 'debug';
const logger = debug('core');

interface IThrottleOptions {
    workers: number;
    tasks: ITask[];
}

interface ITask {
    (): Promise<number>;
}

interface IState {
    results: number[];
    running_tasks: Promise<void>[];
    index: number;
}

interface IWorkerInfo {
    tasks: number[];
    total_time: number;
}

const workers_hashmap: Map<number, IWorkerInfo> = new Map();

const delays: number[] = [...Array(50)].map(
    () => Math.floor(Math.random() * 900) + 100
);

const load: ITask[] = delays.map(
    (delay: number): ITask =>
        (): Promise<number> =>
            new Promise((resolve) => {
                setTimeout(() => resolve(Math.floor(delay / 100)), delay);
            })
);

const logWorkersInfo = () => {
    workers_hashmap.forEach((worker, index) => {
        const { tasks, total_time } = worker;
        const numTasks = tasks.length;
        const totalTimeMs = total_time / 10;
        const color = totalTimeMs >= 5 ? '\x1b[31m' : '\x1b[32m';

        logger(
            color +
                'Worker %d finished %d tasks and took %d seconds to finish them' +
                '\x1b[0m',
            index,
            numTasks,
            totalTimeMs.toFixed(2)
        );
    });
};

const runNextWorkload = async (
    state: IState,
    tasks: ITask[],
    worker: number
): Promise<void> => {
    const curr_index = state.index++;
    const task = tasks[curr_index];

    if (!workers_hashmap.has(worker)) {
        workers_hashmap.set(worker, {
            tasks: [],
            total_time: 0,
        });
    }

    if (task) {
        console.info('worker %d is running task %d', worker, curr_index + 1);
        const result = await task(); // run the task
        workers_hashmap.get(worker).tasks.push(curr_index);
        // also add the time it took to the total time of the worker
        workers_hashmap.get(worker).total_time += result;

        // first check if it exists, if not, create it
        state.results[curr_index] = result;
        await runNextWorkload(state, tasks, worker); // worker is free, run next task recursively...
    }
};

const throttle = async ({
    workers,
    tasks,
}: IThrottleOptions): Promise<number[]> => {
    const state: IState = {
        results: [],
        running_tasks: [],
        index: 0,
    };

    // managing workers
    while (state.running_tasks.length < workers && state.index < tasks.length) {
        state.running_tasks.push(
            runNextWorkload(state, tasks, state.running_tasks.length + 1)
        );
    }

    // waiting for all tasks to complete before returning...
    await Promise.all(state.running_tasks);

    return state.results;
};

const bootstrap = async (): Promise<void> => {
    logger('Starting...');
    const start: number = Date.now();
    const answers: number[] = await throttle({ workers: 5, tasks: load });
    logger('Done in %dms', Date.now() - start);
    logger('Answers: %O', answers);
    logWorkersInfo();
};

bootstrap().catch((err: any) => {
    logger('General fail: %O', err);
});

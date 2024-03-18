import debug from 'debug';

interface ThrottleOptions {
    workers: number;
    tasks: Task[];
}

interface Task {
    (): Promise<number>;
}

interface State {
    results: number[];
    running_tasks: Promise<void>[];
    index: number;
}

const logger = debug('core');

const delays: number[] = [...Array(50)].map(
    () => Math.floor(Math.random() * 900) + 100
);
const load: Task[] = delays.map(
    (delay: number): Task =>
        (): Promise<number> =>
            new Promise((resolve) => {
                setTimeout(() => resolve(Math.floor(delay / 100)), delay);
            })
);

const runNextWorkload = async (
    state: State,
    tasks: Task[],
    worker: number
): Promise<void> => {
    const curr_index = state.index++;
    const task = tasks[curr_index];
    if (task) {
        console.info('worker %d is running task %d', worker, curr_index + 1);
        const result = await task(); // run the task
        state.results[curr_index] = result;
        await runNextWorkload(state, tasks, worker); // worker is free, run next task recursively...
    }
};

const throttle = async ({
    workers,
    tasks,
}: ThrottleOptions): Promise<number[]> => {
    const state: State = {
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

    console.info('tasks finished!');

    return state.results;
};

const bootstrap = async (): Promise<void> => {
    logger('Starting...');
    const start: number = Date.now();
    const answers: number[] = await throttle({ workers: 5, tasks: load });
    logger('Done in %dms', Date.now() - start);
    logger('Answers: %O', answers);
};

bootstrap().catch((err: any) => {
    logger('General fail: %O', err);
});

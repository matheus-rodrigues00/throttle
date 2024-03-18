import debug from 'debug';

interface ThrottleOptions {
    workers: number;
    tasks: Task[];
}

interface Task {
    (): Promise<number>;
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

const throttle = async ({
    workers,
    tasks,
}: ThrottleOptions): Promise<number[]> => {
    const results: number[] = [];
    const running_tasks: Promise<void>[] = [];
    let index = 0;

    async function runNextWorkload(worker: number): Promise<void> {
        const curr_index = index++;
        const task = tasks[curr_index];
        if (task) {
            console.info(
                'worker %d is running task %d',
                worker,
                curr_index + 1
            );
            const result = await task(); // run the task
            results[curr_index] = result;
            await runNextWorkload(worker); // worker is free, run next task recursively...
        }
    }

    // managing workers
    while (running_tasks.length < workers && index < tasks.length) {
        running_tasks.push(runNextWorkload(running_tasks.length + 1));
    }

    // waiting for all tasks to complete before returning...
    await Promise.all(running_tasks);

    console.info('tasks finished!');

    return results;
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

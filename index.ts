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
    // implemente aqui
    return [];
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

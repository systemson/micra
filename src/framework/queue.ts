import { Job, Queue, QueueOptions, WorkerOptions  } from "bullmq";
import { getEnv } from "./functions";
import { Lang } from "./lang";

/**
 * The Worker base interface
 */
export interface WorkerContract {
    /**
     * Amount of jobs that a single worker is allowed to work on in parallel.
     */
    concurrency: number;

    /**
     * Gets the queue name for the current worker.
     */
    getQueueName(): string;

    /**
     * The worker's configuration.
     */
    getOptions(): WorkerOptions;

    /**
     * Handles the job, and COULD return a response.
     * 
     * @param job The job to process
     */
    handler(job: Job): any;
}

export abstract class BaseWorker implements WorkerContract {
    protected name?: string;

    public concurrency = 1;

    public abstract handler(job: Job): any;

    public getQueueName(): string {
        return this.name || getEnv("APP_DEFAULT_QUEUE");;
    }

    public getOptions(): WorkerOptions {
        const options: WorkerOptions = {
            concurrency: this.concurrency,
        };

        return options;
    }
}

export class QueueEngineFacade {
    protected static instances: Map<string, Queue> = new Map();
    protected static default: string;

    public static bootQueue(name: string, options?: QueueOptions): typeof QueueEngineFacade {
        if (!QueueEngineFacade.instances.has(name)) {
            QueueEngineFacade.instances.set(name,  new Queue(name, options));
        }

        return QueueEngineFacade;
    }
    
    public static getInstance(name: string): Queue {
        this.bootQueue(name);

        return QueueEngineFacade.instances.get(name) as Queue;
    }

    public static queue(name: string): typeof QueueEngineFacade {
        this.bootQueue(name);

        this.default = name;

        return QueueEngineFacade;
    }

    public static add(jobName: string, data: any): void {
        QueueEngineFacade.getInstance(this.default || getEnv("APP_DEFAULT_QUEUE")).add(jobName, data, {
            removeOnComplete: true,
            attempts: parseInt(getEnv("APP_QUEUE_RETRIES")),
            removeOnFail: getEnv("APP_QUEUE_REMOVE_FAILED") === "true",
        });
    }
}

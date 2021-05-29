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
    protected abstract name: string;

    public concurrency = 1;

    public abstract handler(job: Job): any;

    public getQueueName(): string {
        return this.name;
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

    public static bootQueue(name: string, options?: QueueOptions): void {
        if (QueueEngineFacade.instances.has(name)) {
            throw new Error(Lang.__("Queue {{name}} already exists", {
                name: name,
            }));
        }

        QueueEngineFacade.instances.set(name,  new Queue(name, options));
    }
    
    public static getInstance(name: string): Queue {
        if (!QueueEngineFacade.instances.has(name)) {
            QueueEngineFacade.instances.set(name, new Queue(name));
        }

        return QueueEngineFacade.instances.get(name) as Queue;
    }

    public static add(name: string, data: any): void {
        // Adds a job to the queue
        QueueEngineFacade.getInstance(getEnv("APP_QUEUE_NAME")).add(name, data, {
            removeOnComplete: true,
            attempts: parseInt(getEnv("APP_QUEUE_RETRIES")),
            removeOnFail: getEnv("APP_QUEUE_REMOVE_FAILED") === "true",
        });
    }
}

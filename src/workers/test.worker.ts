import { BaseWorker } from "../framework/queue";
import { Lang } from "../framework/lang";
import { Job } from "bullmq";
import { getEnv } from "../framework/functions";

export class TestWorker extends BaseWorker {
    name = getEnv("APP_QUEUE_NAME");

    handler(job: Job): any {
        if (job.data.name === "completed") {
            return {
                status: "ok",
                message: Lang.__("Job [{{name}}#{{id}}] completed", {
                    name: job.name,
                    id: job.id?.toString() as string,
                })
            };
        }

        throw new Error("Ha ocurrido un error controlado.");
    }
}

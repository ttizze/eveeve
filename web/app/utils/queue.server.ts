import { Queue as BullQueue, type Job, type Processor, Worker } from "bullmq";
import { RedisConfig } from "./redis-config";

type RegisteredQueue = {
	queue: BullQueue;
	worker: Worker;
};

declare global {
	var __registeredQueues: Record<string, RegisteredQueue> | undefined;
}

if (!global.__registeredQueues) {
	global.__registeredQueues = {};
}
const registeredQueues = global.__registeredQueues;

export function Queue<Payload>(
	name: string,
	handlers: {
		processor: Processor<Payload>;
		onComplete: (job: Job<Payload>, queue: BullQueue<Payload>) => void;
	},
): BullQueue<Payload> {
	if (registeredQueues[name]) {
		return registeredQueues[name].queue;
	}
	const queue = new BullQueue<Payload>(name, { connection: RedisConfig });
	const worker = new Worker<Payload>(name, handlers.processor, {
		connection: RedisConfig,
	});
	worker.on("completed", (job) => handlers.onComplete(job, queue));
	registeredQueues[name] = { queue, worker };
	return queue;
}

export async function clearAllQueues() {
	for (const [name, { queue }] of Object.entries(registeredQueues)) {
		await queue.obliterate({ force: true });
		console.log(`Cleared queue: ${name}`);
	}
	console.log("All queues have been cleared.");
}

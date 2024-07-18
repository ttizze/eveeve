import Queue, { type Queue as QueueType } from "bull";
import { REDIS_URL } from "../constants";
import { processTranslationJob } from "./translation";

const createUserTranslationQueue = (userId: number) =>
	new Queue(`translation-user-${userId}`, REDIS_URL, {
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true
		},
	});

const userTranslationQueues: { [userId: number]: QueueType } = {};

export function setupUserQueue(userId: number, geminiApiKey: string) {
	if (userTranslationQueues[userId]) {
		return userTranslationQueues[userId];
	}
	const userTranslationQueue = createUserTranslationQueue(userId);
  userTranslationQueue.process(async (job) => {
    console.log(`Starting job ${job.id} for user ${userId}`);
    try {
      await processTranslationJob(job, geminiApiKey, userId);
      console.log(`Job ${job.id} completed successfully for user ${userId}`);
    } catch (error) {
      console.error(`Error processing job ${job.id} for user ${userId}:`, error);
      throw error;
    }
	});

  userTranslationQueue.on('completed', async (job) => {
    const activeCount = await userTranslationQueue.getActiveCount();
    const waitingCount = await userTranslationQueue.getWaitingCount();
    
    if (activeCount === 0 && waitingCount === 0) {
      console.log(`All translation jobs for user ${userId} have been completed.`);
    }
  });

	userTranslationQueues[userId] = userTranslationQueue;
	return userTranslationQueue;
}

import Queue, { type Queue as QueueType } from "bull";
import { REDIS_URL } from "../constants";
import { processTranslationJob } from "./translation";

const createUserTranslationQueue = (userId: number) =>
	new Queue(`translation-user-${userId}`, REDIS_URL);

const userTranslationQueues: { [userId: number]: QueueType } = {};

export function setupUserQueue(userId: number, geminiApiKey: string) {
	if (userTranslationQueues[userId]) {
		return userTranslationQueues[userId];
	}
	const userTranslationQueue = createUserTranslationQueue(userId);
	userTranslationQueue.process(async (job) => {
		await processTranslationJob(job, geminiApiKey, userId);
	});
	userTranslationQueues[userId] = userTranslationQueue;
	return userTranslationQueue;
}

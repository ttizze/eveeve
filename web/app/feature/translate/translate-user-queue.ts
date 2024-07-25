import { translateJob } from './jobs/translate-job.server';
import { Queue } from '~/utils/queue.server';

type TranslateJobData = {
  url: string;
  targetLanguage: string;
  apiKey: string;
  userId: number;
};

export const getTranslateUserQueue = (userId: number) => {
  return Queue<TranslateJobData>(`translation-user-${userId}`, {
    processor: async (job) => {
      console.log(`Starting job ${job.id} for user ${userId}`);
      try {
        await translateJob(job.data);
        console.log(`Job ${job.id} completed successfully for user ${userId}`);
      } catch (error) {
        console.error(
          `Error processing job ${job.id} for user ${userId}:`,
          error
        );
        throw error;
      }
    },
    onComplete: async (job, queue) => {
      const waitingCount = await queue.getWaitingCount();
      const activeCount = await queue.getActiveCount();
      const delayedCount = await queue.getDelayedCount();
      const totalCount = waitingCount + activeCount + delayedCount;
      if (totalCount === 0) {
        console.log(
          `All translation jobs for user ${userId} have been completed.`
        );
      }
    },
  });
};

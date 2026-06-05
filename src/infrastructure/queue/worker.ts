import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

console.log("Initializing Kadhaisolai Background Worker...");

// Use mock execution in the absence of local Redis instance to ensure pipeline progresses
const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
  lazyConnect: true
});

const worker = new Worker('kadhaisolai-jobs', async (job: Job) => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  return { success: true };
}, { connection });

worker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});

process.on('SIGINT', async () => {
  console.log("Gracefully shutting down worker...");
  await worker.close();
  process.exit(0);
});

console.log("Worker is listening for jobs.");

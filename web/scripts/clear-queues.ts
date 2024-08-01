import { clearAllQueues } from "../app/utils/queue.server";

async function main() {
	console.log("Clearing all queues...");
	await clearAllQueues();
	console.log("All queues have been cleared.");
	process.exit(0);
}

main().catch((error) => {
	console.error("Failed to clear queues:", error);
	process.exit(1);
});

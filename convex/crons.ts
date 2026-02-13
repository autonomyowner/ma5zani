import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Poll Yalidine for delivery status updates every 30 minutes
crons.interval(
  "poll-yalidine-statuses",
  { minutes: 30 },
  internal.delivery.pollYalidineStatuses,
);

export default crons;

const cron = require("node-cron");
const IndividualLaptopModel = require("../service-layer/models/IndividualLaptopModel");
const AiService = require("../service-layer/services/AiService");

const initPredictiveMaintenanceCron = () => {
  // Schedule to run every Sunday at 2:00 AM
  cron.schedule("0 2 * * 0", async () => {
    console.log("[CRON] Starting AI Predictive Maintenance Analysis...");
    
    try {
      // Find all laptops to evaluate
      const laptops = await IndividualLaptopModel.find({}).select("_id");
      
      let processed = 0;
      let skipped = 0;
      let errors = 0;

      for (const laptop of laptops) {
        try {
          const result = await AiService.analyzeLaptop(laptop._id);
          if (result.skipped) {
            skipped++;
          } else {
            processed++;
          }
          // Sleep for 1 second between API calls to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (err) {
          console.error(`[CRON] Failed to analyze laptop ${laptop._id}:`, err.message);
          errors++;
        }
      }

      console.log(`[CRON] AI Analysis Complete. Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`);
    } catch (err) {
      console.error("[CRON] Fatal error in AI Predictive Maintenance Job:", err.message);
    }
  });

  console.log("[CRON] Scheduled AI Predictive Maintenance (Runs every Sunday at 2:00 AM)");
};

module.exports = initPredictiveMaintenanceCron;

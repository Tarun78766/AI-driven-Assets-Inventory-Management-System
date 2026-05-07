const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Force register models in correct order
require('./service-layer/models/LaptopModel');
require('./service-layer/models/AssignmentModel');
require('./service-layer/models/RepairHistory');
const IndividualLaptopModel = require('./service-layer/models/IndividualLaptopModel');
const AiService = require('./service-layer/services/AiService');

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const laptops = await IndividualLaptopModel.find().limit(3);
        console.log(`Found ${laptops.length} laptops to test.`);

        for (const l of laptops) {
            console.log(`\n--- Analyzing ${l.serialNumber} (${l.status}) ---`);
            const result = await AiService.analyzeLaptop(l._id);
            
            // Check if result is the full laptop object or just metrics
            const metrics = result.aiMetrics || result;
            
            console.log(`Score: ${metrics.predictionScore}`);
            console.log(`Level: ${metrics.riskLevel}`);
            console.log(`Reason: ${metrics.reason}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("TEST FAILED:", err.message);
        if (err.stack) console.error(err.stack);
        await mongoose.disconnect();
    }
}

runTest();

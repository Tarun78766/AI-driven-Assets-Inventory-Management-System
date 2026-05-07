const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

require('./service-layer/models/LaptopModel');
require('./service-layer/models/AssignmentModel');
require('./service-layer/models/RepairHistory');
require('./service-layer/models/EmployeeModel');
const IndividualLaptopModel = require('./service-layer/models/IndividualLaptopModel');
const AiService = require('./service-layer/services/AiService');

async function runFullTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("--- STARTING FULL INVENTORY AI TEST ---");

        const laptops = await IndividualLaptopModel.find();
        console.log(`Analyzing ${laptops.length} assets...\n`);

        console.log("SERIAL NUMBER        | STATUS          | SCORE | RISK     | REASON");
        console.log("--------------------------------------------------------------------------------");

        for (const l of laptops) {
            const result = await AiService.analyzeLaptop(l._id);
            const metrics = result.aiMetrics || result;
            
            const sn = l.serialNumber.padEnd(20);
            const status = l.status.padEnd(15);
            const score = String(metrics.predictionScore).padEnd(5);
            const risk = metrics.riskLevel.padEnd(8);
            const reason = metrics.reason.substring(0, 40) + "...";
            
            console.log(`${sn} | ${status} | ${score} | ${risk} | ${reason}`);
        }

        await mongoose.disconnect();
        console.log("\n--- TEST COMPLETE ---");
    } catch (err) {
        console.error("TEST FAILED:", err.message);
        await mongoose.disconnect();
    }
}

runFullTest();

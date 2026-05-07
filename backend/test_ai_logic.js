const AiService = require('./service-layer/services/AiService');

function testAi() {
    console.log("--- STARTING AI LOGIC TEST ---");
    
    // Mock a Critical Laptop
    const payloadCritical = {
        serialNumber: "SN-CRITICAL-999",
        ageInMonths: 60,
        repairCount: 4,
        status: "Under Repair"
    };

    // Mock a Healthy Laptop
    const payloadHealthy = {
        serialNumber: "SN-HEALTHY-001",
        ageInMonths: 6,
        repairCount: 0,
        status: "Available"
    };

    console.log("\n--- TESTING CRITICAL ASSET ---");
    const result1 = AiService.getAiPredictionWithFallback(payloadCritical);
    console.log(JSON.stringify(result1, null, 2));

    console.log("\n--- TESTING HEALTHY ASSET ---");
    const result2 = AiService.getAiPredictionWithFallback(payloadHealthy);
    console.log(JSON.stringify(result2, null, 2));

    if (result1.predictionScore === result2.predictionScore) {
        console.error("\n❌ FAILED: Both assets have the same score!");
    } else {
        console.log("\n✅ SUCCESS: Assets have different scores.");
    }
}

// Since getAiPredictionWithFallback is now async but I'm testing the fallback part which is sync,
// but the function itself is async. Let's handle the promise.
async function run() {
    try {
        const AiService = require('./service-layer/services/AiService');
        
        const payloadCritical = {
            serialNumber: "SN-CRITICAL-999",
            ageInMonths: 60,
            repairCount: 4,
            status: "Under Repair"
        };

        const payloadHealthy = {
            serialNumber: "SN-HEALTHY-001",
            ageInMonths: 6,
            repairCount: 0,
            status: "Available"
        };

        // Note: The function tries Gemini/Groq first. I want to test the rules engine inside it.
        // I'll just run it.
        const res1 = await AiService.getAiPredictionWithFallback(payloadCritical);
        const res2 = await AiService.getAiPredictionWithFallback(payloadHealthy);
        
        console.log("Result 1 (Critical):", res1.predictionScore, res1.riskLevel);
        console.log("Result 2 (Healthy):", res2.predictionScore, res2.riskLevel);
        
    } catch (e) {
        console.error(e);
    }
}

run();

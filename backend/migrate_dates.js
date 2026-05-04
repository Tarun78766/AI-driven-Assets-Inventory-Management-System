
const mongoose = require('mongoose');
const IndividualSoftwareLicenseModel = require('./service-layer/models/IndividualSoftwareLicenseModel');
const SoftwareModel = require('./service-layer/models/SoftwareModel');
require('dotenv').config();

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const seats = await IndividualSoftwareLicenseModel.find({
    $or: [
      { activationDate: { $exists: false } },
      { activationDate: "" },
      { expiryDate: { $exists: false } },
      { expiryDate: "" }
    ]
  });

  console.log(`Found ${seats.length} seats to update.`);

  for (const seat of seats) {
    const parent = await SoftwareModel.findById(seat.softwareModelId);
    if (parent) {
      const update = {};
      if (!seat.activationDate && parent.activationDate) {
        update.activationDate = parent.activationDate.toISOString().split('T')[0];
      }
      if (!seat.expiryDate && parent.expiryDate) {
        update.expiryDate = parent.expiryDate.toISOString().split('T')[0];
      }
      
      if (Object.keys(update).length > 0) {
        await IndividualSoftwareLicenseModel.findByIdAndUpdate(seat._id, update);
      }
    }
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

migrate().catch(console.error);

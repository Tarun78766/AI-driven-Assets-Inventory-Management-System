
const mongoose = require('mongoose');
const IndividualSoftwareLicenseModel = require('./service-layer/models/IndividualSoftwareLicenseModel');
const SoftwareModel = require('./service-layer/models/SoftwareModel');
require('dotenv').config();

async function checkData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const seats = await IndividualSoftwareLicenseModel.find().limit(5);
  console.log('Recent Seats:', JSON.stringify(seats, null, 2));

  const softwares = await SoftwareModel.find().limit(5);
  console.log('Recent Softwares:', JSON.stringify(softwares, null, 2));

  await mongoose.disconnect();
}

checkData().catch(console.error);

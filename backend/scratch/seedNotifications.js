const mongoose = require("mongoose");
const Notification = require("../service-layer/models/Notification");
const User = require("../service-layer/models/User");
require("dotenv").config();

const seedNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ role: "admin" });
    if (!user) {
      console.log("No admin user found. Please create one first.");
      process.exit(1);
    }

    const notifications = [
      {
        userId: user._id,
        type: "critical",
        category: "Software",
        title: "License Expired — AutoCAD 2024",
        message: "AutoCAD 2024 license has expired for 15 seats in the Engineering department. Immediate renewal required.",
        action: "Renew Now",
        dept: "Engineering",
        read: false,
      },
      {
        userId: user._id,
        type: "warning",
        category: "Laptop",
        title: "MacBook Pro End-of-Life Alert",
        message: "14 MacBook Pro units assigned to the Finance team have reached their lifecycle end date.",
        action: "Schedule Replacement",
        dept: "Finance",
        read: false,
      },
      {
        userId: user._id,
        type: "info",
        category: "Assignment",
        title: "Dell XPS 15 Assigned to John Smith",
        message: "Dell XPS 15 successfully assigned to John Smith in Engineering.",
        action: "View Assignment",
        dept: "Engineering",
        read: false,
      },
      {
        userId: user._id,
        type: "success",
        category: "Software",
        title: "Microsoft Office 365 Renewed",
        message: "Microsoft Office 365 has been successfully renewed.",
        action: "View Details",
        dept: "All",
        read: true,
      }
    ];

    await Notification.deleteMany({ userId: user._id });
    await Notification.insertMany(notifications);

    console.log("Notifications seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding notifications:", error.message);
    process.exit(1);
  }
};

seedNotifications();

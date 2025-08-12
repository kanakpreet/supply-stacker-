import { storage } from "./storage";
import dotenv from "dotenv";

dotenv.config();

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Create a test user
    const existingUser = await storage.getUserByUsername("admin");
    if (!existingUser) {
      const user = await storage.createUser({
        username: "admin",
        password: "admin123", // In production, this should be hashed
        name: "Admin User",
        employeeId: "EMP001"
      });
      console.log("✅ Created test user:", user.username);
    } else {
      console.log("✅ Test user already exists");
    }

    // Create current payroll period
    const currentPeriod = await storage.getCurrentPayrollPeriod();
    if (!currentPeriod) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (startDate.getDay() + 6) % 7); // Last Monday
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 13); // Two weeks later

      await storage.createPayrollPeriod({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: "active",
        reserveStartDate: null,
        reserveEndDate: null
      });
      console.log("✅ Created current payroll period");
    } else {
      console.log("✅ Payroll period already exists");
    }

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
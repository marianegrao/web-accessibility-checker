import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI as string;

if (!mongoUri) {
  throw new Error("MONGODB_URI não definida");
}

export async function connectMongo() {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado ao MongoDB");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
}

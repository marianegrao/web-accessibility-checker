import { Schema, model, Document } from "mongoose";

export interface IWebsite extends Document {
  url: string;
  score: number;
  createdAt: Date;
}

const WebsiteSchema = new Schema<IWebsite>(
  {
    url: { type: String, required: true, index: true },
    score: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const WebsiteModel = model<IWebsite>("websites", WebsiteSchema);

import mongoose, { Schema, Types } from 'mongoose';

interface ProfileDocument {
  userId: Types.ObjectId;
  position: string;
  skills: string[];
  experience: number | null;
}

const profileSchema = new Schema<ProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    position: { type: String, required: true, trim: true },
    skills: {
      type: [String],
      default: [],
      set: (skills: string[]) =>
        skills.map((s) => s.trim()).filter((s) => s.length > 0),
    },
    experience: { type: Number, default: null, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Profile ||
  mongoose.model<ProfileDocument>('Profile', profileSchema);

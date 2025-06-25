import mongoose, { Document, Schema } from "mongoose";

export enum PomodoroType {
  WORK = "work",
  SHORT_BREAK = "short-break",
  LONG_BREAK = "long-break",
}

export interface IPomodoro extends Document {
  user: mongoose.Types.ObjectId;
  type: PomodoroType;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  completed: boolean;
  todo?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pomodoroSchema = new Schema<IPomodoro>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PomodoroType),
      default: PomodoroType.WORK,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 second"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    todo: {
      type: Schema.Types.ObjectId,
      ref: "Todo",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indices for efficient queries
pomodoroSchema.index({ user: 1, startTime: -1 });
pomodoroSchema.index({ user: 1, type: 1 });
pomodoroSchema.index({ user: 1, completed: 1 });

export const Pomodoro = mongoose.model<IPomodoro>("Pomodoro", pomodoroSchema);

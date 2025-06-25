import mongoose, { Document, Schema } from "mongoose";

export enum EventType {
  MEETING = "meeting",
  TASK = "task",
  REMINDER = "reminder",
  OTHER = "other",
}

export interface ICalendarEvent extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  allDay: boolean;
  eventType: EventType;
  location?: string;
  isRecurring: boolean;
  recurringPattern?: string; // RRULE format
  color?: string; // HEX color code for UI
  todo?: mongoose.Types.ObjectId; // Optional link to a todo item
  externalId?: string; // For Google Calendar sync
  createdAt: Date;
  updatedAt: Date;
}

const calendarEventSchema = new Schema<ICalendarEvent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    eventType: {
      type: String,
      enum: Object.values(EventType),
      default: EventType.OTHER,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot be more than 200 characters"],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
    },
    color: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please enter a valid hex color"],
    },
    todo: {
      type: Schema.Types.ObjectId,
      ref: "Todo",
    },
    externalId: {
      type: String, // For sync with external calendars
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indices for efficient date-range queries
calendarEventSchema.index({ user: 1, startTime: 1 });
calendarEventSchema.index({ user: 1, eventType: 1 });
calendarEventSchema.index({ user: 1, isRecurring: 1 });

export const CalendarEvent = mongoose.model<ICalendarEvent>("CalendarEvent", calendarEventSchema);

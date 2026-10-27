import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

export const remindersRouter = Router();

export interface ReminderItem {
  id: string;
  title: string;
  type: "medication" | "appointment" | "wellness" | "general";
  categoryNote?: string;
  dateTime: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  completed: boolean;
  createdAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const REMINDERS_FILE = path.join(DATA_DIR, "reminders.json");

// Ensure data directory and initial seed exist
function initRemindersStore(): ReminderItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(REMINDERS_FILE)) {
      const data = fs.readFileSync(REMINDERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading reminders file, initializing fallback:", err);
  }

  // Seed sample demonstration data
  const initialData: ReminderItem[] = [
    {
      id: "rem-1",
      title: "Morning Blood Pressure Log",
      type: "wellness",
      categoryNote: "Record sitting BP after 5 mins rest",
      dateTime: new Date(Date.now() + 3600 * 1000 * 3).toISOString().slice(0, 16),
      recurrence: "daily",
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "rem-2",
      title: "Prescribed Vitamin D3 (1000 IU)",
      type: "medication",
      categoryNote: "Take with breakfast as directed by Dr. Patel",
      dateTime: new Date(Date.now() + 3600 * 1000 * 4).toISOString().slice(0, 16),
      recurrence: "daily",
      completed: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "rem-3",
      title: "Annual Preventive Health Checkup",
      type: "appointment",
      categoryNote: "Main Campus Clinic, Room 302",
      dateTime: new Date(Date.now() + 86400 * 1000 * 5).toISOString().slice(0, 16),
      recurrence: "none",
      completed: false,
      createdAt: new Date().toISOString()
    }
  ];

  try {
    fs.writeFileSync(REMINDERS_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial reminders seed:", err);
  }

  return initialData;
}

let inMemoryReminders = initRemindersStore();

function persistReminders() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REMINDERS_FILE, JSON.stringify(inMemoryReminders, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist reminders to disk:", err);
  }
}

// GET all reminders
remindersRouter.get("/", (_req: Request, res: Response) => {
  return res.json(inMemoryReminders);
});

// POST create reminder
remindersRouter.post("/", (req: Request, res: Response) => {
  const { title, type, categoryNote, dateTime, recurrence } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Title is required." });
  }

  if (!dateTime || typeof dateTime !== "string") {
    return res.status(400).json({ error: "Date and time are required." });
  }

  const newReminder: ReminderItem = {
    id: "rem-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
    title: title.trim(),
    type: type || "general",
    categoryNote: typeof categoryNote === "string" ? categoryNote.trim() : "",
    dateTime,
    recurrence: recurrence || "none",
    completed: false,
    createdAt: new Date().toISOString(),
  };

  inMemoryReminders.unshift(newReminder);
  persistReminders();

  return res.status(201).json(newReminder);
});

// PUT update reminder
remindersRouter.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = inMemoryReminders.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Reminder not found." });
  }

  const existing = inMemoryReminders[index];
  const { title, type, categoryNote, dateTime, recurrence, completed } = req.body;

  inMemoryReminders[index] = {
    ...existing,
    title: typeof title === "string" ? title.trim() : existing.title,
    type: type || existing.type,
    categoryNote: categoryNote !== undefined ? categoryNote : existing.categoryNote,
    dateTime: dateTime || existing.dateTime,
    recurrence: recurrence !== undefined ? recurrence : existing.recurrence,
    completed: typeof completed === "boolean" ? completed : existing.completed,
  };

  persistReminders();
  return res.json(inMemoryReminders[index]);
});

// DELETE reminder
remindersRouter.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = inMemoryReminders.length;
  inMemoryReminders = inMemoryReminders.filter((r) => r.id !== id);

  if (inMemoryReminders.length === initialLength) {
    return res.status(404).json({ error: "Reminder not found." });
  }

  persistReminders();
  return res.json({ success: true, message: "Reminder deleted successfully." });
});

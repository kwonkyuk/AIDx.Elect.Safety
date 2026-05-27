export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface Quiz {
  question: string;
  answer: string;
  explanation: string;
}

export interface Checklist {
  title: string;
  items: string[];
}

export interface WeekChapter {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  theme: string; // Tailwind color theme like "blue", "yellow", "red", "green", "indigo", etc.
  description: string;
  learningObjectives: string[];
  lectureNotebook: string[]; // Highly rich academic content blocks
  equations?: {
    latex: string;
    description: string;
  }[];
  isSpecialFeature?: boolean; // Week 13 vision, Week 8 Interactive, etc.
}

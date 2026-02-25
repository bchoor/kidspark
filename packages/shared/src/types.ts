export interface Course {
  id: number;
  title: string;
  description: string;
  slug: string;
  cover_image_key: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  age_min: number;
  age_max: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: number;
  name: string;
  icon_key: string | null;
  color_palette: string; // JSON string
  description: string;
  created_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  topic_id: number;
  theme_id: number;
  title: string;
  slug: string;
  sort_order: number;
  status: string;
  activity_type: string;
  content_json: string;
  hints_json: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Media {
  id: number;
  lesson_id: number;
  filename: string;
  r2_key: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface Kid {
  id: number;
  name: string;
  avatar: string | null;
  age: number;
  created_at: string;
}

export interface Progress {
  id: number;
  kid_id: number;
  lesson_id: number;
  status: string;
  score: number | null;
  time_spent_seconds: number;
  answers_json: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface AccessPassword {
  id: number;
  label: string;
  password_hash: string;
  salt: string;
  iterations: number;
  created_at: string;
  last_used_at: string | null;
}

export interface Session {
  id: string;
  kid_id: number;
  password_id: number;
  created_at: string;
  expires_at: string;
}

export interface AdminSession {
  id: string;
  created_at: string;
  expires_at: string;
}

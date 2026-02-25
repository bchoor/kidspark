export interface Character {
  name: string;
  avatar_key: string;
  personality: string;
}

export interface AgeVariants {
  '3-5'?: { narration: string };
  '6-8'?: { narration: string };
  '9-12'?: { narration: string };
}

export interface StoryChoice {
  label: string;
  next_page_id: string;
  feedback: string;
}

export interface StoryPage {
  id: string;
  narration: string;
  character_dialogue?: string;
  image_key?: string;
  choices?: StoryChoice[];
  age_variants?: AgeVariants;
}

export interface StoryContent {
  type: 'story';
  character: Character;
  pages: StoryPage[];
}

export interface QuizOption {
  id: string;
  text: string;
  image_key?: string;
}

export interface AgeHints {
  '3-5'?: string;
  '6-8'?: string;
  '9-12'?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  question_type: string;
  options: QuizOption[];
  correct_answer: string;
  explanation: string;
  hints: AgeHints;
  points: number;
}

export interface QuizContent {
  type: 'quiz';
  character: Character;
  questions: QuizQuestion[];
  passing_score?: number;
  completion_message?: string;
}

export interface SandboxItem {
  id: string;
  label: string;
  image_key?: string;
  category?: string;
  correct_zone_id?: string;
}

export interface SandboxZone {
  id: string;
  label: string;
  accepts: string[];
}

export interface SandboxContent {
  type: 'sandbox';
  character: Character;
  sandbox_type: 'drag_and_drop' | 'sorting' | 'matching';
  items: SandboxItem[];
  zones?: SandboxZone[];
  completion_criteria: {
    type: string;
    value?: number;
  };
  hints: AgeHints;
}

export type LessonContent = StoryContent | QuizContent | SandboxContent;

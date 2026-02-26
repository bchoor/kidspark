import type { LessonContent, StoryContent, QuizContent, SandboxContent } from '@kidspark/shared';
import { StoryEditor } from './StoryEditor';
import { QuizEditor } from './QuizEditor';
import { SandboxEditor } from './SandboxEditor';

interface Props {
    activityType: string;
    content: LessonContent | null;
    onChange: (c: LessonContent) => void;
}

function defaultContent(type: string): LessonContent {
    const character = { name: '', avatar_key: '', personality: '' };
    if (type === 'quiz') return { type: 'quiz', character, questions: [], passing_score: 70, completion_message: 'Great job!' };
    if (type === 'sandbox') return { type: 'sandbox', character, sandbox_type: 'drag_and_drop', items: [], zones: [], completion_criteria: { type: 'all_placed' }, hints: {} };
    return { type: 'story', character, pages: [] };
}

export function ActivityEditor({ activityType, content, onChange }: Props) {
    // Initialize with default if null or type mismatch
    const activeContent = (!content || content.type !== activityType)
        ? defaultContent(activityType)
        : content;

    if (activityType === 'story') {
        return <StoryEditor content={activeContent as StoryContent} onChange={onChange} />;
    }
    if (activityType === 'quiz') {
        return <QuizEditor content={activeContent as QuizContent} onChange={onChange} />;
    }
    if (activityType === 'sandbox') {
        return <SandboxEditor content={activeContent as SandboxContent} onChange={onChange} />;
    }
    if (activityType === 'mixed') {
        // Mixed: show story tab + quiz tab
        const storyContent = content?.type === 'story' ? content as StoryContent : defaultContent('story') as StoryContent;
        const quizContent = content?.type === 'quiz' ? content as QuizContent : defaultContent('quiz') as QuizContent;
        return (
            <div role="tablist" className="tabs tabs-bordered">
                <input type="radio" name="mixed-tabs" role="tab" className="tab" aria-label="Story" defaultChecked />
                <div role="tabpanel" className="tab-content pt-4">
                    <StoryEditor content={storyContent} onChange={onChange} />
                </div>
                <input type="radio" name="mixed-tabs" role="tab" className="tab" aria-label="Quiz" />
                <div role="tabpanel" className="tab-content pt-4">
                    <QuizEditor content={quizContent} onChange={onChange} />
                </div>
            </div>
        );
    }
    return <p className="text-base-content/50 text-sm">Select an activity type to build content.</p>;
}

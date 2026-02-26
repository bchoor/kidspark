import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Course } from '@kidspark/shared';

const COURSE_GRADIENTS = [
    'from-amber-400 to-orange-400',
    'from-teal-400 to-cyan-400',
    'from-violet-400 to-purple-400',
    'from-rose-400 to-pink-400',
    'from-emerald-400 to-green-400',
    'from-blue-400 to-indigo-400',
];

const COURSE_EMOJIS = ['🦕', '🚀', '🌊', '🎨', '🌿', '⭐'];

export function CourseSelector() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.courses.list()
            .then(setCourses)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <span className="loading loading-dots loading-lg text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-10">
                <div className="alert alert-error"><span>{error}</span></div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                <span className="text-7xl animate-float inline-block">📚</span>
                <h2 className="text-3xl font-bold font-display">No courses yet!</h2>
                <p className="text-base-content/60 font-medium">Check back soon for new adventures.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center animate-fade-up">
                <h1 className="text-4xl font-bold font-display">What do you want to learn? 🌟</h1>
                <p className="text-base-content/60 mt-2 font-medium text-lg">Pick an adventure to start!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course, i) => (
                    <Link
                        key={course.id}
                        to={`/courses/${course.slug}`}
                        className={`card bg-base-100 shadow-lg hover:shadow-2xl hover:-translate-y-2
                                    transition-all duration-300 border-2 border-transparent
                                    hover:border-primary cursor-pointer animate-bounce-in delay-${i + 1}`}
                    >
                        {course.cover_image_key ? (
                            <figure className="aspect-video overflow-hidden rounded-t-2xl">
                                <img
                                    src={api.media.url(course.cover_image_key)}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            </figure>
                        ) : (
                            <div className={`aspect-video bg-gradient-to-br ${COURSE_GRADIENTS[i % COURSE_GRADIENTS.length]} rounded-t-2xl flex items-center justify-center`}>
                                <span className="text-7xl animate-float inline-block" style={{ animationDelay: `${i * 0.5}s` }}>
                                    {COURSE_EMOJIS[i % COURSE_EMOJIS.length]}
                                </span>
                            </div>
                        )}
                        <div className="card-body p-5 gap-2">
                            <h2 className="card-title text-xl font-display">{course.title}</h2>
                            {course.description && (
                                <p className="text-sm text-base-content/60 line-clamp-2 font-medium">{course.description}</p>
                            )}
                            <div className="card-actions mt-2">
                                <span className="badge badge-primary badge-sm font-medium">Start →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

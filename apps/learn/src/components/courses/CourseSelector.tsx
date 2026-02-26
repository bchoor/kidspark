import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Course } from '@kidspark/shared';

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
                <span className="loading loading-spinner loading-lg text-primary" />
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
                <span className="text-6xl">📚</span>
                <h2 className="text-2xl font-bold">No courses yet!</h2>
                <p className="text-base-content/60">Check back soon for new adventures.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">What do you want to learn? 🌟</h1>
                <p className="text-base-content/60 mt-1">Pick an adventure to start!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                    <Link
                        key={course.id}
                        to={`/courses/${course.slug}`}
                        className="card bg-base-100 shadow hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-primary"
                    >
                        {course.cover_image_key ? (
                            <figure className="aspect-video overflow-hidden rounded-t-xl">
                                <img
                                    src={api.media.url(course.cover_image_key)}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            </figure>
                        ) : (
                            <div className="aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 rounded-t-xl flex items-center justify-center">
                                <span className="text-5xl">📚</span>
                            </div>
                        )}
                        <div className="card-body p-4 gap-1">
                            <h2 className="card-title text-lg">{course.title}</h2>
                            {course.description && (
                                <p className="text-sm text-base-content/60 line-clamp-2">{course.description}</p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

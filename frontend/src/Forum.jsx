import React, { useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    addDoc,
    setDoc,
    onSnapshot,
    query,
    Timestamp,
    runTransaction,
    where
} from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';

const appId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'default-forum-app';

export default function Forum() {
    const [view, setView] = useState('list'); // 'list', 'ask', 'question'
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const { isAuthReady, db } = useFirebase();

    const navigate = (newView, questionId = null) => {
        setView(newView);
        setSelectedQuestionId(questionId);
    };

    const renderContent = () => {
        if (!isAuthReady) return <LoadingSpinner />;
        if (!db) return <div className="text-center text-red-500 p-8">Firebase is not configured. The forum cannot be loaded.</div>;

        switch (view) {
            case 'ask': return <QuestionForm navigate={navigate} />;
            case 'question': return <QuestionDetail questionId={selectedQuestionId} navigate={navigate} />;
            case 'list': default: return <QuestionList navigate={navigate} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl">
                <Header navigate={navigate} />
                <main className="mt-6">{renderContent()}</main>
                <Footer />
            </div>
        </div>
    );
}

// --- UI Components ---

const Header = ({ navigate }) => {
    const { userId } = useFirebase();
    return (
        <header className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
                <h1
                    className="text-2xl md:text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate('list')}
                >
                    Community Forum
                </h1>
                <p className="text-sm text-gray-500">Discuss, share, and learn together.</p>
            </div>
            <div className="flex items-center space-x-4">
                {userId && <span className="text-xs text-gray-400 hidden sm:block">UID: {userId}</span>}
                <button
                    onClick={() => navigate('ask')}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                    Ask Question
                </button>
            </div>
        </header>
    );
};

const Footer = () => (
    <footer className="text-center mt-12 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Community Forum. All rights reserved.</p>
    </footer>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-10">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

// --- Question Components ---

const QuestionList = ({ navigate }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { db } = useFirebase();

    useEffect(() => {
        if (!db) return;
        const questionsCollection = collection(db, `artifacts/${appId}/public/data/questions`);
        const q = query(questionsCollection);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const questionsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            questionsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setQuestions(questionsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching questions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">All Questions</h2>
            </div>
            {questions.length === 0 ? (
                <p className="p-6 text-gray-500">No questions have been asked yet. Be the first!</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {questions.map(q => (
                        <QuestionListItem key={q.id} question={q} navigate={navigate} />
                    ))}
                </ul>
            )}
        </div>
    );
};

const QuestionListItem = ({ question, navigate }) => (
    <li
        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => navigate('question', question.id)}
    >
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-semibold text-blue-700">{question.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                    Asked by <span className="font-medium truncate max-w-[100px] inline-block align-middle">{question.userId}</span> on {question.createdAt ? new Date(question.createdAt.seconds * 1000).toLocaleDateString() : 'a while ago'}
                </p>
            </div>
            <div className="text-center ml-4 flex-shrink-0">
                <div className="text-2xl font-bold">{question.votes || 0}</div>
                <div className="text-sm text-gray-500">votes</div>
            </div>
        </div>
    </li>
);

const QuestionForm = ({ navigate }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { db, userId } = useFirebase();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            setError('Both title and body are required.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            const questionsCollection = collection(db, `artifacts/${appId}/public/data/questions`);
            await addDoc(questionsCollection, {
                title,
                body,
                userId,
                createdAt: Timestamp.now(),
                votes: 0,
            });
            navigate('list');
        } catch (err) {
            console.error("Error submitting question:", err);
            setError('Failed to submit question. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Ask a Public Question</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., How do I implement real-time updates?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                    <textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows="8"
                        placeholder="Include all the information someone would need to answer your question."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex items-center space-x-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Your Question'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('list')}
                        className="bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

const QuestionDetail = ({ questionId, navigate }) => {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { db, userId } = useFirebase();

    useEffect(() => {
        if (!questionId || !db) return;

        const questionDocRef = doc(db, `artifacts/${appId}/public/data/questions`, questionId);
        const unsubscribeQuestion = onSnapshot(questionDocRef, (doc) => {
            if (doc.exists()) {
                setQuestion({ id: doc.id, ...doc.data() });
            } else {
                console.error("Question not found");
            }
            setLoading(false);
        });

        const answersCollection = collection(db, `artifacts/${appId}/public/data/answers`);
        const q = query(answersCollection, where("questionId", "==", questionId));

        const unsubscribeAnswers = onSnapshot(q, (snapshot) => {
            const answersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            answersData.sort((a, b) => (b.votes || 0) - (a.votes || 0));
            setAnswers(answersData);
        });

        return () => {
            unsubscribeQuestion();
            unsubscribeAnswers();
        };
    }, [questionId, db]);

    const handleVote = useCallback(async (postId, postType, value) => {
        if (!userId || !db) {
            console.error("User must be logged in to vote.");
            return;
        }

        const voteDocRef = doc(db, `artifacts/${appId}/public/data/votes`, `${userId}_${postId}`);
        const postDocRef = doc(db, `artifacts/${appId}/public/data/${postType}`, postId);

        try {
            await runTransaction(db, async (transaction) => {
                const voteDoc = await transaction.get(voteDocRef);
                const postDoc = await transaction.get(postDocRef);

                if (!postDoc.exists()) {
                    throw "Document does not exist!";
                }

                let newVote = postDoc.data().votes || 0;
                let voteChange = 0;

                if (voteDoc.exists()) {
                    const existingVote = voteDoc.data().value;
                    if (existingVote === value) {
                        voteChange = -value;
                        transaction.delete(voteDocRef);
                    } else {
                        voteChange = value - existingVote;
                        transaction.set(voteDocRef, { userId, postId, value });
                    }
                } else {
                    voteChange = value;
                    transaction.set(voteDocRef, { userId, postId, value });
                }

                newVote += voteChange;
                transaction.update(postDocRef, { votes: newVote });
            });
        } catch (error) {
            console.error("Vote transaction failed: ", error);
        }
    }, [userId, db]);

    if (loading) return <LoadingSpinner />;
    if (!question) return <div className="text-center p-8">Question not found. It may have been deleted.</div>;

    return (
        <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-start space-x-4">
                    <VoteControl item={question} onVote={(value) => handleVote(question.id, 'questions', value)} />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2">{question.title}</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Asked by <span className="font-medium">{question.userId}</span>
                        </p>
                        <div className="prose max-w-none">
                            <p>{question.body}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 border-b pb-3">{answers.length} Answer{answers.length !== 1 && 's'}</h3>
                {answers.map(answer => (
                    <Answer key={answer.id} answer={answer} onVote={(value) => handleVote(answer.id, 'answers', value)} />
                ))}
            </div>

            <AnswerForm questionId={questionId} />
        </div>
    );
};

// --- Answer Components ---

const Answer = ({ answer, onVote }) => (
    <div className="py-4 border-b last:border-b-0">
        <div className="flex items-start space-x-4">
            <VoteControl item={answer} onVote={onVote} />
            <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">
                    Answered by <span className="font-medium">{answer.userId}</span>
                </p>
                <div className="prose max-w-none">
                    <p>{answer.body}</p>
                </div>
            </div>
        </div>
    </div>
);

const AnswerForm = ({ questionId }) => {
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { db, userId } = useFirebase();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!body.trim()) {
            setError('Your answer cannot be empty.');
            return;
        }
        if (!userId) {
            setError('You must be logged in to answer.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            const answersCollection = collection(db, `artifacts/${appId}/public/data/answers`);
            await addDoc(answersCollection, {
                questionId,
                body,
                userId,
                createdAt: Timestamp.now(),
                votes: 0
            });
            setBody('');
        } catch (err) {
            console.error("Error submitting answer:", err);
            setError('Failed to submit answer. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Your Answer</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide a detailed answer..."
                ></textarea>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                    {isSubmitting ? 'Submitting...' : 'Post Your Answer'}
                </button>
            </form>
        </div>
    );
};

// --- Vote Component ---
const VoteControl = ({ item, onVote }) => {
    const [userVote, setUserVote] = useState(0);
    const { userId, db } = useFirebase();

    useEffect(() => {
        if (!userId || !db) return;
        const voteDocRef = doc(db, `artifacts/${appId}/public/data/votes`, `${userId}_${item.id}`);
        const unsubscribe = onSnapshot(voteDocRef, (doc) => {
            if (doc.exists()) {
                setUserVote(doc.data().value);
            } else {
                setUserVote(0);
            }
        });
        return () => unsubscribe();
    }, [item.id, userId, db]);

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={() => onVote(1)}
                className={`p-1 rounded-full transition-colors ${userVote === 1 ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:bg-gray-200'}`}
                aria-label="Upvote"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>
            <span className="text-xl font-bold my-1 text-gray-800">{item.votes || 0}</span>
            <button
                onClick={() => onVote(-1)}
                className={`p-1 rounded-full transition-colors ${userVote === -1 ? 'text-red-600 bg-red-100' : 'text-gray-500 hover:bg-gray-200'}`}
                aria-label="Downvote"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>
    );
};


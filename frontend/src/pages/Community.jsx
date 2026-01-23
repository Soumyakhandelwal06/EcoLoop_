import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import Header from '../components/common/Header';


const Community = () => {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/community-feed`);
                setFeed(res.data);
            } catch (err) {
                console.error("Failed to fetch community feed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 flex flex-col">
            <Header />
            <main className="max-w-4xl mx-auto px-4 flex-1 w-full py-6 sm:py-8">
                <h1 className="text-2xl sm:text-3xl font-black text-green-800 mb-6 tracking-tight">Community Events 🌍</h1>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">Loading events...</div>
                ) : feed.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No events found nearby. Check back later!</div>
                ) : (
                    <div className="grid gap-6">
                        {feed.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.category === 'Energy' ? 'bg-yellow-100 text-yellow-700' :
                                            item.category === 'Waste' ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-100 text-green-700'
                                        }`}>
                                        {item.category}
                                    </span>
                                    <span className="text-slate-400 text-sm flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h2>
                                <p className="text-slate-600 mb-4">{item.description}</p>

                                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {item.location}
                                    </div>
                                    <a
                                        href={item.external_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 font-bold text-sm flex items-center gap-1 hover:underline"
                                    >
                                        View Details <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

        </div>
    );
};

export default Community;

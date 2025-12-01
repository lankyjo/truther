'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TestScrapePage() {
    const [url, setUrl] = useState('https://example.com');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const testScrape = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Scrape failed');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Scrape API Test</h1>

            <div className="mb-4">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full p-3 border-2 border-black"
                    placeholder="Enter URL to scrape"
                />
            </div>

            <button
                onClick={testScrape}
                disabled={loading}
                className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-400"
            >
                {loading ? 'Scraping...' : 'Test Scrape'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-100 border-2 border-red-600 text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 bg-green-100 border-2 border-green-600">
                        <strong>✓ Success!</strong>
                    </div>

                    <div className="p-4 border-2 border-black">
                        <h3 className="font-bold text-lg mb-2">Metadata:</h3>
                        <pre className="text-sm bg-gray-50 p-3 overflow-auto">
                            {JSON.stringify(result.metadata, null, 2)}
                        </pre>
                    </div>

                    <div className="p-4 border-2 border-black">
                        <h3 className="font-bold text-lg mb-2">Text Content (first 500 chars):</h3>
                        <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3">
                            {result.text?.substring(0, 500)}...
                        </p>
                    </div>
                    <Link href="/">
                        <button className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 mt-6">Go Home</button>
                    </Link>
                </div>


            )}
        </div>
    );
}
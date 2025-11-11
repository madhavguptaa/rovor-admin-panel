import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Error 404',
};

const NotFound = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-black">
            <div className="rounded-full bg-primary/10 px-6 py-2 text-sm font-semibold text-primary">404</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">
                The page you’re looking for doesn’t exist or was moved. Use the button below to return to the dashboard.
            </p>
            <Link href="/" className="btn btn-primary">
                Go back home
            </Link>
        </div>
    );
};

export default NotFound;

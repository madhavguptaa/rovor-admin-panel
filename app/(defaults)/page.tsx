import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Rovor Admin',
};

const Sales = () => {
    return (
        <div className="space-y-4 p-6">
            <h1 className="text-3xl font-bold text-primary">Welcome to the Rovor Admin Panel</h1>
            <p className="text-sm text-slate-600">Select a section from the sidebar to get started.</p>
        </div>
    );
};

export default Sales;

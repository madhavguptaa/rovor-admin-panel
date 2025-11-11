'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import IconX from '@/components/icon/icon-x';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'normal' | 'medium' | 'high' | 'critical';
type TicketChannel = 'email' | 'chat' | 'phone' | 'web';

interface TicketNote {
    text: string;
    createdAt: string;
}

interface TicketMessage {
    sender: 'customer' | 'support' | 'system';
    text: string;
    createdAt: string;
}

interface Ticket {
    id: string;
    customer: string;
    email?: string;
    phone?: string;
    country?: string;
    category?: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    channel: TicketChannel;
    assignee?: string;
    createdAt: string;
    updatedAt: string;
    notes: TicketNote[];
    messages: TicketMessage[];
}

const statusBadge: Record<TicketStatus, string> = {
    open: 'bg-danger/10 text-danger',
    in_progress: 'bg-warning/10 text-warning',
    resolved: 'bg-success/10 text-success',
    closed: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const priorityBadge: Record<TicketPriority, string> = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    normal: 'bg-primary/10 text-primary',
    medium: 'bg-primary/10 text-primary',
    high: 'bg-warning/10 text-warning',
    critical: 'bg-danger/10 text-danger',
};

const channelBadge: Record<TicketChannel, string> = {
    email: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-200',
    chat: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-200',
    phone: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200',
    web: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-200',
};

const statusOptions: { label: string; value: TicketStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
];

const priorityOptions: { label: string; value: TicketPriority | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Low', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
];

const channelOptions: { label: string; value: TicketChannel | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Email', value: 'email' },
    { label: 'Chat', value: 'chat' },
    { label: 'Phone', value: 'phone' },
    { label: 'Web', value: 'web' },
];

const statusSummaryOrder: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
    const [channelFilter, setChannelFilter] = useState<TicketChannel | 'all'>('all');

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [statusInput, setStatusInput] = useState<TicketStatus>('open');
    const [assigneeInput, setAssigneeInput] = useState<string>('');
    const [noteInput, setNoteInput] = useState<string>('');
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [openChats, setOpenChats] = useState<string[]>([]);
    const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
    const [chatLoading, setChatLoading] = useState<Record<string, boolean>>({});
    const [chatStatus, setChatStatus] = useState<Record<string, string | null>>({});

    const loadTickets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/tickets', { cache: 'no-store' });
            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message || 'Failed to load tickets');
            }
            const mapped: Ticket[] = (json.data || []).map((ticket: any) => {
                const statusRaw = (ticket.status || 'open').toLowerCase();
                const status: TicketStatus = ['open', 'in_progress', 'resolved', 'closed'].includes(statusRaw) ? statusRaw : 'open';

                const priorityRaw = (ticket.priority || 'medium').toLowerCase();
                const priority: TicketPriority = ['low', 'normal', 'medium', 'high', 'critical'].includes(priorityRaw)
                    ? (priorityRaw as TicketPriority)
                    : 'medium';

                const channelRaw = (ticket.channel || 'web').toLowerCase();
                const channel: TicketChannel = ['email', 'chat', 'phone', 'web'].includes(channelRaw) ? (channelRaw as TicketChannel) : 'web';

                const notesArray: TicketNote[] = Array.isArray(ticket.notes)
                    ? ticket.notes.map((note: any) => ({
                          text: String(note.text ?? ''),
                          createdAt: note.createdAt ?? new Date().toISOString(),
                      }))
                    : [];

                const messagesArray: TicketMessage[] = Array.isArray(ticket.messages)
                    ? ticket.messages.map((msg: any) => ({
                          sender: ['customer', 'support'].includes(msg.sender) ? msg.sender : 'customer',
                          text: String(msg.text ?? ''),
                          createdAt: msg.createdAt ?? new Date().toISOString(),
                      }))
                    : [];

                return {
                    id: ticket.ticketId || ticket.id || ticket._id?.toString() || 'UNDEFINED',
                    customer: ticket.customer || ticket.customerName || ticket.fullName || 'Unknown customer',
                    email: ticket.email,
                    phone: ticket.phone || ticket.phoneNumber || ticket.contactNumber,
                    country: ticket.country,
                    category: ticket.category,
                    subject: ticket.subject || ticket.title || 'No subject provided',
                    description: ticket.description || ticket.details || 'No description provided.',
                    status,
                    priority,
                    channel,
                    assignee: ticket.assignee || ticket.owner,
                    createdAt: ticket.createdAt || ticket.created_at || new Date().toISOString(),
                    updatedAt: ticket.updatedAt || ticket.updated_at || ticket.createdAt || new Date().toISOString(),
                    notes: notesArray,
                    messages: messagesArray,
                };
            });
            setTickets(mapped);
        } catch (err: any) {
            console.error('Failed to load tickets', err);
            setError(err.message ?? 'Failed to load tickets');
            setTickets([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    useEffect(() => {
        setOpenChats((prev) => prev.filter((id) => tickets.some((ticket) => ticket.id === id)));
    }, [tickets]);

    useEffect(() => {
        setMessageDrafts((prev) => {
            const next: Record<string, string> = {};
            for (const id of openChats) {
                next[id] = prev[id] ?? '';
            }
            return next;
        });
        setChatStatus((prev) => {
            const next: Record<string, string | null> = {};
            for (const id of openChats) {
                next[id] = prev[id] ?? null;
            }
            return next;
        });
        setChatLoading((prev) => {
            const next: Record<string, boolean> = {};
            for (const id of openChats) {
                next[id] = prev[id] ?? false;
            }
            return next;
        });
    }, [openChats]);

    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const matchesSearch =
                ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ticket.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ticket.phone ?? '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
            const matchesChannel = channelFilter === 'all' || ticket.channel === channelFilter;

            return matchesSearch && matchesStatus && matchesPriority && matchesChannel;
        });
    }, [searchTerm, statusFilter, priorityFilter, channelFilter, tickets]);

    const statusSummary = useMemo(() => {
        const summary: Record<TicketStatus, number> = {
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0,
        };

        for (const ticket of tickets) {
            summary[ticket.status] += 1;
        }

        return summary;
    }, [tickets]);

    const selectedTicket = useMemo(() => (selectedTicketId ? tickets.find((ticket) => ticket.id === selectedTicketId) ?? null : null), [tickets, selectedTicketId]);

    useEffect(() => {
        if (selectedTicket) {
            setStatusInput(selectedTicket.status);
            setAssigneeInput(selectedTicket.assignee ?? '');
            setNoteInput('');
        } else {
            setStatusInput('open');
            setAssigneeInput('');
            setNoteInput('');
        }
    }, [selectedTicket]);

    const openChatWindow = useCallback((ticketId: string) => {
        setOpenChats((prev) => (prev.includes(ticketId) ? prev : [...prev, ticketId]));
    }, []);

    const closeChatWindow = useCallback((ticketId: string) => {
        setOpenChats((prev) => prev.filter((id) => id !== ticketId));
        setMessageDrafts((prev) => {
            if (!(ticketId in prev)) {
                return prev;
            }
            const { [ticketId]: _discard, ...rest } = prev;
            return rest;
        });
        setChatStatus((prev) => {
            if (!(ticketId in prev)) {
                return prev;
            }
            const { [ticketId]: _discard, ...rest } = prev;
            return rest;
        });
        setChatLoading((prev) => {
            if (!(ticketId in prev)) {
                return prev;
            }
            const { [ticketId]: _discard, ...rest } = prev;
            return rest;
        });
    }, []);

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const handleUpdateTicket = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedTicketId) return;

        setActionLoading(true);
        setActionMessage(null);
        try {
            const response = await fetch(`/api/tickets/${selectedTicketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: statusInput,
                    assignee: assigneeInput.trim() || null,
                }),
            });
            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message || 'Failed to update ticket');
            }
            setActionMessage('Ticket updated successfully.');
            await loadTickets();
        } catch (err: any) {
            setActionMessage(err.message ?? 'Failed to update ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddNote = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedTicketId || !noteInput.trim()) return;

        setActionLoading(true);
        setActionMessage(null);
        try {
            const response = await fetch(`/api/tickets/${selectedTicketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    note: noteInput.trim(),
                }),
            });
            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message || 'Failed to add note');
            }
            setNoteInput('');
            setActionMessage('Note added.');
            await loadTickets();
        } catch (err: any) {
            setActionMessage(err.message ?? 'Failed to add note');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChatSubmit = async (event: FormEvent<HTMLFormElement>, ticketId: string) => {
        event.preventDefault();
        const draft = (messageDrafts[ticketId] ?? '').trim();
        if (!ticketId || !draft) {
            return;
        }

        setChatLoading((prev) => ({ ...prev, [ticketId]: true }));
        setChatStatus((prev) => ({ ...prev, [ticketId]: null }));
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: draft,
                    sender: 'support',
                }),
            });
            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message || 'Failed to send message');
            }
            setMessageDrafts((prev) => ({ ...prev, [ticketId]: '' }));
            setChatStatus((prev) => ({ ...prev, [ticketId]: 'Message sent.' }));
            await loadTickets();
        } catch (err: any) {
            setChatStatus((prev) => ({ ...prev, [ticketId]: err?.message ?? 'Failed to send message' }));
        } finally {
            setChatLoading((prev) => ({ ...prev, [ticketId]: false }));
        }
    };

    const handleDeleteTicket = async () => {
        if (!selectedTicketId) return;
        const confirmDelete = window.confirm('Delete this ticket permanently?');
        if (!confirmDelete) return;

        setActionLoading(true);
        setActionMessage(null);
        try {
            const response = await fetch(`/api/tickets/${selectedTicketId}`, {
                method: 'DELETE',
            });
            const json = await response.json();
            if (!response.ok || !json.success) {
                throw new Error(json.message || 'Failed to delete ticket');
            }
            setActionMessage('Ticket deleted.');
            setSelectedTicketId(null);
            await loadTickets();
        } catch (err: any) {
            setActionMessage(err.message ?? 'Failed to delete ticket');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-5 p-6">
            <div>
                <h1 className="text-3xl font-bold text-primary">Tickets / Queries</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                    Monitor customer-reported issues. Click any row to view details, update status, assign team members, or add internal notes.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {statusSummaryOrder.map((status) => (
                    <div key={status} className="rounded-lg border border-white-light bg-white p-4 shadow-sm dark:border-[#1b2e4b] dark:bg-black/40">
                        <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">{status.replace('_', ' ')}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{statusSummary[status]}</p>
                        <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadge[status]}`}>
                            {status.replace('_', ' ')}
                        </span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="rounded-lg border border-dashed border-primary/40 bg-white p-6 shadow-sm dark:border-[#1b2e4b] dark:bg-black/40">
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Search tickets</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by customer, email, phone, ticket ID..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Status</label>
                        <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TicketStatus | 'all')}>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Priority</label>
                        <select className="form-select" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as TicketPriority | 'all')}>
                            {priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Channel</label>
                        <select className="form-select" value={channelFilter} onChange={(event) => setChannelFilter(event.target.value as TicketChannel | 'all')}>
                            {channelOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="overflow-hidden rounded-lg border border-white-light bg-white shadow-sm dark:border-[#1b2e4b] dark:bg-black/40">
                {error && (
                    <div className="border-b border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                        {error} — check your MongoDB connection or verify the collection exists.
                    </div>
                )}
                {isLoading && (
                    <div className="grid place-content-center px-4 py-10 text-sm text-slate-500 dark:text-slate-300">Loading tickets...</div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white-light dark:divide-[#1b2e4b]">
                        <thead className="bg-[#fff1f3] text-slate-700 dark:bg-[#1b2e4b]/40 dark:text-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Subject</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Assignee</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Last Updated</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Chat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white-light bg-white text-sm dark:divide-[#1b2e4b] dark:bg-transparent">
                            {!isLoading && filteredTickets.length === 0 && (
                                <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-300">
                                        No tickets matched your filters. Try adjusting the search or filter selections.
                                    </td>
                                </tr>
                            )}

                            {filteredTickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    className="cursor-pointer hover:bg-rose-50/70 dark:hover:bg-white/5"
                                    onClick={() => {
                                        setSelectedTicketId(ticket.id);
                                    }}
                                >
                                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                                        <div className="font-semibold">{ticket.customer}</div>
                                        <div className="text-[10px] font-mono uppercase tracking-wide text-primary">{ticket.id}</div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500">{formatDate(ticket.createdAt)}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                                        {ticket.email && <div className="text-xs text-slate-600 dark:text-slate-300">{ticket.email}</div>}
                                        {ticket.phone && (
                                            <div className="text-xs text-slate-600 dark:text-slate-300">
                                                {ticket.country && `${ticket.country} `}
                                                {ticket.phone}
                                            </div>
                                        )}
                                        {!ticket.email && !ticket.phone && <span className="text-xs text-slate-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                                        <div className="font-semibold">{ticket.subject}</div>
                                        {ticket.category && (
                                            <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                                {ticket.category}
                                            </span>
                                        )}
                                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{ticket.description}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadge[ticket.status]}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${priorityBadge[ticket.priority]}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                                        {ticket.assignee ?? <span className="text-xs text-slate-400">Unassigned</span>}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(ticket.updatedAt)}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                openChatWindow(ticket.id);
                                            }}
                                        >
                                            Chat
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4"
                    onClick={() => {
                        setSelectedTicketId(null);
                    }}
                >
                    <div
                        className="relative w-full max-w-3xl rounded-lg border border-white-light bg-white shadow-lg dark:border-[#1b2e4b] dark:bg-black"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-white-light px-6 py-4 dark:border-[#1b2e4b]">
                            <div>
                                <h2 className="text-xl font-bold text-primary">Ticket Details</h2>
                                <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">Ticket #{selectedTicket.id}</p>
                            </div>
                            <button
                                type="button"
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                onClick={() => {
                                    setSelectedTicketId(null);
                                }}
                            >
                                <IconX className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto p-6">
                            <div className="space-y-4">
                                {/* Ticket Info */}
                                <div className="rounded-lg border border-white-light bg-slate-50 p-4 dark:border-[#1b2e4b] dark:bg-[#0e1726]">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Ticket ID</span>
                                        <span className="font-mono text-sm font-bold text-primary">{selectedTicket.id}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Customer</span>
                                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedTicket.customer}</p>
                                    </div>
                                    {selectedTicket.email && (
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Email</span>
                                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{selectedTicket.email}</p>
                                        </div>
                                    )}
                                    {selectedTicket.phone && (
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Phone</span>
                                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                                                {selectedTicket.country && `${selectedTicket.country} `}
                                                {selectedTicket.phone}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mb-2">
                                        <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Subject</span>
                                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedTicket.subject}</p>
                                    </div>
                                    {selectedTicket.category && (
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Category</span>
                                            <p className="mt-1 text-sm capitalize text-slate-700 dark:text-slate-200">{selectedTicket.category}</p>
                                        </div>
                                    )}
                                    <div className="mb-2">
                                        <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Description</span>
                                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{selectedTicket.description}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</span>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadge[selectedTicket.status]}`}>
                                                    {selectedTicket.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Priority</span>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${priorityBadge[selectedTicket.priority]}`}>
                                                    {selectedTicket.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Channel</span>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${channelBadge[selectedTicket.channel]}`}>
                                                    {selectedTicket.channel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                        <span>Created: {formatDate(selectedTicket.createdAt)}</span>
                                        <span>Updated: {formatDate(selectedTicket.updatedAt)}</span>
                                    </div>
                                </div>

                                {/* Update Status & Assignee */}
                                <div className="rounded-lg border border-white-light bg-white p-4 dark:border-[#1b2e4b] dark:bg-[#0e1726]">
                                    <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Update Ticket</h3>
                                    <form onSubmit={handleUpdateTicket} className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Status</label>
                                            <select className="form-select" value={statusInput} onChange={(e) => setStatusInput(e.target.value as TicketStatus)}>
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Assignee</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter team member name"
                                                value={assigneeInput}
                                                onChange={(e) => setAssigneeInput(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full" disabled={actionLoading}>
                                            {actionLoading ? 'Updating...' : 'Update Ticket'}
                                        </button>
                                    </form>
                                </div>

                                {/* Notes Section */}
                                <div className="rounded-lg border border-white-light bg-white p-4 dark:border-[#1b2e4b] dark:bg-[#0e1726]">
                                    <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Internal Notes</h3>
                                    {selectedTicket.notes.length > 0 ? (
                                        <div className="mb-4 max-h-[200px] space-y-2 overflow-y-auto rounded border border-white-light p-3 dark:border-[#1b2e4b]">
                                            {selectedTicket.notes.map((note, idx) => (
                                                <div key={idx} className="rounded bg-slate-50 p-2 text-xs dark:bg-[#060818]">
                                                    <p className="text-slate-700 dark:text-slate-200">{note.text}</p>
                                                    <span className="mt-1 block text-[10px] text-slate-400">{formatDate(note.createdAt)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mb-4 text-xs text-slate-400">No notes yet.</p>
                                    )}
                                    <form onSubmit={handleAddNote} className="space-y-2">
                                        <textarea
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="Add an internal note..."
                                            value={noteInput}
                                            onChange={(e) => setNoteInput(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-outline-primary w-full" disabled={actionLoading || !noteInput.trim()}>
                                            {actionLoading ? 'Adding...' : 'Add Note'}
                                        </button>
                                    </form>
                                </div>

                                {/* Delete Button */}
                                <div className="rounded-lg border border-danger/40 bg-danger/5 p-4 dark:border-danger/30 dark:bg-danger/10">
                                    <h3 className="mb-2 text-sm font-bold text-danger">Danger Zone</h3>
                                    <p className="mb-3 text-xs text-slate-600 dark:text-slate-300">
                                        Deleting a ticket is permanent and cannot be undone. All notes and history will be lost.
                                    </p>
                                    <button type="button" className="btn btn-danger w-full" onClick={handleDeleteTicket} disabled={actionLoading}>
                                        {actionLoading ? 'Deleting...' : 'Delete Ticket'}
                                    </button>
                                </div>
                                {actionMessage && (
                                    <div
                                        className={`rounded-lg px-4 py-3 text-sm ${
                                            actionMessage.includes('success') || actionMessage.includes('added') || actionMessage.includes('deleted')
                                                ? 'bg-success/10 text-success'
                                                : 'bg-danger/10 text-danger'
                                        }`}
                                    >
                                        {actionMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {openChats.length > 0 && (
            <div className="pointer-events-none fixed bottom-4 right-4 z-[998] flex flex-col items-end gap-4">
                {openChats.map((ticketId) => {
                    const chatTicket = tickets.find((ticket) => ticket.id === ticketId);
                    if (!chatTicket) {
                        return null;
                    }
                    const draft = messageDrafts[ticketId] ?? '';
                    const status = chatStatus[ticketId];
                    const isSending = chatLoading[ticketId] ?? false;

                    return (
                        <div
                            key={ticketId}
                            className="pointer-events-auto flex w-80 flex-col overflow-hidden rounded-lg border border-white-light bg-white shadow-xl dark:border-[#1b2e4b] dark:bg-[#0e1726]"
                        >
                            <div className="flex items-center justify-between border-b border-white-light bg-[#fff1f3] px-4 py-3 dark:border-[#1b2e4b] dark:bg-[#1b2e4b]/40">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Chatting with</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{chatTicket.customer}</p>
                                    <p className="text-[10px] font-mono uppercase tracking-wide text-primary">{chatTicket.id}</p>
                                </div>
                                <button type="button" className="text-slate-400 hover:text-danger" onClick={() => closeChatWindow(ticketId)}>
                                    <IconX className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex flex-1 flex-col gap-3 p-3">
                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {chatTicket.messages.length > 0 ? (
                                        chatTicket.messages.map((message, idx) => (
                                            <div key={`${ticketId}-message-${idx}`} className={`flex ${message.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                                                        message.sender === 'support'
                                                            ? 'bg-primary/90 text-white'
                                                            : 'bg-slate-100 text-slate-700 dark:bg-[#060818] dark:text-slate-200'
                                                    }`}
                                                >
                                                    <p>{message.text}</p>
                                                    <span className="mt-1 block text-[10px] opacity-80">
                                                        {message.sender === 'support' ? 'You' : 'Customer'} · {formatDate(message.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="rounded border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-slate-500 dark:border-primary/20 dark:text-slate-300">
                                            No messages yet. Start the conversation below.
                                        </p>
                                    )}
                                </div>
                                <form onSubmit={(event) => handleChatSubmit(event, ticketId)} className="space-y-2 border-t border-white-light pt-2 dark:border-[#1b2e4b]">
                                    <textarea
                                        className="form-textarea resize-none"
                                        rows={2}
                                        placeholder={`Message ${chatTicket.customer}...`}
                                        value={draft}
                                        onChange={(event) =>
                                            setMessageDrafts((prev) => ({
                                                ...prev,
                                                [ticketId]: event.target.value,
                                            }))
                                        }
                                    />
                                    <button type="submit" className="btn btn-outline-primary w-full" disabled={isSending || !draft.trim()}>
                                        {isSending ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                                {status && (
                                    <p
                                        className={`text-[11px] ${
                                            status.toLowerCase().includes('fail') || status.toLowerCase().includes('error') ? 'text-danger' : 'text-success'
                                        }`}
                                    >
                                        {status}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
        </>
    );
}


'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Dialog as ConfirmDialog,
    DialogContent as ConfirmDialogContent,
    DialogHeader as ConfirmDialogHeader,
    DialogTitle as ConfirmDialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Loader2, CheckCircle2, RefreshCw, FileSpreadsheet,
    FileText, Plus, Trash2, Search, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from "@/lib/session_api";
import { useOrganization, useUser } from '@clerk/nextjs';
import { storeData, getData, deleteData, DB_KEYS } from "@/lib/indexedDB";
import { useIntegrations, GoogleData } from '@/components/hooks/useIntegrations';
import Image from 'next/image';


interface ConnectedSheet {
    sheet_id: string;
    sheet_name: string;
    last_synced_at: string | null;
    last_sync_rows: number;
    polling_enabled: boolean;
    last_processed_row_number: number;
}

interface AvailableSheet {
    sheet_id: string;
    sheet_name: string;
    modified_at: string | null;
    is_connected: boolean;
}


const GoogleLoginDialog = () => {
    const [connected, setConnected] = useState(false);
    const [accountInfo, setAccountInfo] = useState<GoogleData | null>(null);
    const [connectedSheets, setConnectedSheets] = useState<ConnectedSheet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [syncingSheetId, setSyncingSheetId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
    const [disconnectingSheetId, setDisconnectingSheetId] = useState<string | null>(null);

    // Sheet picker state
    const [showSheetPicker, setShowSheetPicker] = useState(false);
    const [availableSheets, setAvailableSheets] = useState<AvailableSheet[]>([]);
    const [loadingSheets, setLoadingSheets] = useState(false);
    const [connectingSheetId, setConnectingSheetId] = useState<string | null>(null);
    const [sheetSearch, setSheetSearch] = useState('');

    const api = useApi();
    const { organization } = useOrganization();
    const { user } = useUser();
    const { integrations, loading: integrationsLoading, refreshIntegrations } = useIntegrations();

    // Admin check
    useEffect(() => {
        const checkRole = async () => {
            if (organization && user) {
                const memberships = await organization.getMemberships();
                const membership = memberships.data.find(
                    (m) => m.publicUserData?.userId === user.id
                );
                setIsAdmin(membership?.roleName === "Admin");
            }
        };
        checkRole();
    }, [organization, user]);

    // Sync connected state from useIntegrations
    useEffect(() => {
        if (!integrationsLoading) {
            if (integrations.google && integrations.google.status) {
                setConnected(true);
                setAccountInfo(integrations.google);
            } else {
                setConnected(false);
                setAccountInfo(null);
            }
        }
    }, [integrations, integrationsLoading]);

    // ── Handle OAuth code when Google redirects back to /dashboard ─────────────
    // Uses cookie instead of sessionStorage — sessionStorage is wiped on full redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const returnedState = params.get('state');

        if (!code || !returnedState) return;

        // Read state from cookie (survives full page redirect)
        const savedState = document.cookie
            .split('; ')
            .find(row => row.startsWith('google_oauth_state='))
            ?.split('=')[1];

        if (!savedState || returnedState !== savedState) return;

        // Clean URL immediately so refresh doesn't re-trigger
        window.history.replaceState({}, '', window.location.pathname + window.location.hash);
        // Clear the cookie
        document.cookie = 'google_oauth_state=; Max-Age=0; path=/; SameSite=Lax';

        const redirectUri = `${window.location.origin}/dashboard`;
        handleGoogleCallback(code, redirectUri);
    }, []);

    // Fetch connected sheets list
    const fetchConnectedSheets = useCallback(async () => {
        try {
            const res = await api.get('/api/google-sheets/connections');
            const sheets: ConnectedSheet[] = res.data?.connections ?? [];
            setConnectedSheets(sheets);
            await storeData("integrations", (DB_KEYS.INTEGRATIONS as any).GOOGLE_SHEETS, sheets);
        } catch (err) {
            console.error('Failed to fetch connected sheets:', err);
        }
    }, [api]);

    // Fetch available sheets from Google Drive
    const fetchAvailableSheets = useCallback(async () => {
        setLoadingSheets(true);
        try {
            const res = await api.get('/api/google-sheets/available');
            setAvailableSheets(res.data?.sheets ?? []);
        } catch (err: any) {
            toast.error('Failed to load sheets', {
                description: err?.response?.data?.detail || 'Could not fetch your Google Sheets.'
            });
        } finally {
            setLoadingSheets(false);
        }
    }, [api]);

    const openSheetPicker = useCallback(async () => {
        setShowSheetPicker(true);
        setSheetSearch('');
        await fetchAvailableSheets();
    }, [fetchAvailableSheets]);

    // Load sheets from cache on dialog open
    const onDialogOpen = useCallback(async (open: boolean) => {
        if (open && connected) {
            try {
                const cached = await getData<ConnectedSheet[]>(
                    "integrations",
                    (DB_KEYS.INTEGRATIONS as any).GOOGLE_SHEETS
                );
                if (cached) setConnectedSheets(cached);
            } catch { /* no cache yet */ }
            await fetchConnectedSheets();
        }
        if (!open) {
            setShowSheetPicker(false);
            setSheetSearch('');
        }
    }, [connected, fetchConnectedSheets]);

    // ── Initiate OAuth ─────────────────────────────────────────────────────────
    const handleGoogleLogin = useCallback(() => {
        if (!isAdmin) return;
        setIsLoading(true);

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
        const redirectUri = `${window.location.origin}/dashboard`;

        // Store CSRF state in cookie (survives full-page redirect, unlike sessionStorage)
        const state = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
        document.cookie = `google_oauth_state=${state}; Max-Age=300; path=/; SameSite=Lax`;

        const scopes = [
            'https://www.googleapis.com/auth/spreadsheets.readonly',
            'https://www.googleapis.com/auth/forms.responses.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ].join(' ');

        const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth` +
            `?client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scopes)}` +
            `&access_type=offline` +
            `&prompt=consent` +
            `&state=${encodeURIComponent(state)}`;

        window.location.assign(authUrl);
    }, [isAdmin]);

    // ── Exchange code for tokens ───────────────────────────────────────────────
    const handleGoogleCallback = async (code: string, redirectUri: string) => {
        try {
            setIsLoading(true);
            const res = await api.post('/api/google/auth', { code, redirect_uri: redirectUri });

            if (res.status !== 200) {
                throw new Error(res.data?.message || 'Failed to connect Google account');
            }

            const profile: GoogleData = {
                status: true,
                email: res.data.email,
                name: res.data.name,
                picture: res.data.picture,
                scopes: res.data.scopes ?? [],
                lastUpdated: Date.now(),
            };

            await storeData("integrations", (DB_KEYS.INTEGRATIONS as any).GOOGLE, profile);
            setAccountInfo(profile);
            setConnected(true);
            refreshIntegrations();
            await fetchConnectedSheets();

            toast.success('Google account connected!', {
                description: `Signed in as ${profile.email}`,
            });
        } catch (err: any) {
            console.error('Google auth error:', err);
            toast.error('Connection failed', {
                description: err?.response?.data?.detail || err?.message || 'Could not connect Google account.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ── Connect a sheet from picker ────────────────────────────────────────────
    const handleConnectSheet = async (sheet: AvailableSheet) => {
        setConnectingSheetId(sheet.sheet_id);
        try {
            await api.post('/api/google-sheets/connect', {
                sheet_id: sheet.sheet_id,
                sheet_name: sheet.sheet_name,
                tab_name: 'Sheet1',
            });
            toast.success(`"${sheet.sheet_name}" connected!`);
            setAvailableSheets(prev =>
                prev.map(s => s.sheet_id === sheet.sheet_id ? { ...s, is_connected: true } : s)
            );
            await fetchConnectedSheets();
        } catch (err: any) {
            toast.error('Failed to connect sheet', {
                description: err?.response?.data?.detail || err?.message
            });
        } finally {
            setConnectingSheetId(null);
        }
    };

    // ── Remove a connected sheet ───────────────────────────────────────────────
    const handleDisconnectSheet = async (sheetId: string, sheetName: string) => {
        setDisconnectingSheetId(sheetId);
        try {
            await api.delete(`/api/google-sheets/connections/${sheetId}`);
            toast.success(`"${sheetName}" removed`);
            await fetchConnectedSheets();
            setAvailableSheets(prev =>
                prev.map(s => s.sheet_id === sheetId ? { ...s, is_connected: false } : s)
            );
        } catch (err: any) {
            toast.error('Failed to remove sheet', {
                description: err?.response?.data?.detail || err?.message
            });
        } finally {
            setDisconnectingSheetId(null);
        }
    };

    // ── Disconnect Google account ──────────────────────────────────────────────
    const handleDisconnect = async () => {
        setShowDisconnectConfirm(false);
        setIsLoading(true);
        try {
            await api.post('/api/google/disconnect', {});
            await deleteData("integrations", (DB_KEYS.INTEGRATIONS as any).GOOGLE);
            await deleteData("integrations", (DB_KEYS.INTEGRATIONS as any).GOOGLE_SHEETS);
            setConnected(false);
            setAccountInfo(null);
            setConnectedSheets([]);
            setShowSheetPicker(false);
            refreshIntegrations();
            toast.success('Google account disconnected');
        } catch (err: any) {
            toast.error('Disconnect failed', { description: err?.message || 'Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    // ── Manual sync ────────────────────────────────────────────────────────────
    const handleManualSync = async (sheetId: string) => {
        setSyncingSheetId(sheetId);
        try {
            const res = await api.post('/api/google-sheets/manual-sync', { sheet_id: sheetId });
            if (res.data.status === 'no_new_data') {
                toast.info('No new rows', { description: 'Sheet is already up to date.' });
            } else {
                const count = res.data.rows_processed;
                toast.success(`Synced ${count} new row${count !== 1 ? 's' : ''}!`);
            }
            await fetchConnectedSheets();
        } catch (err: any) {
            toast.error('Sync failed', { description: err?.message || 'Could not sync sheet.' });
        } finally {
            setSyncingSheetId(null);
        }
    };

    // ── Toggle polling ─────────────────────────────────────────────────────────
    const handleTogglePolling = async (sheetId: string) => {
        try {
            const res = await api.patch(`/api/google-sheets/connections/${sheetId}/toggle-polling`);
            toast.success(res.data.polling_enabled ? 'Auto-sync enabled' : 'Auto-sync paused');
            await fetchConnectedSheets();
        } catch {
            toast.error('Failed to toggle polling');
        }
    };

    const filteredAvailable = availableSheets.filter(s =>
        s.sheet_name.toLowerCase().includes(sheetSearch.toLowerCase())
    );

    // ──────────────────────────────────────────────────────────────────────────

    return (
        <Dialog onOpenChange={onDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm">
                    {isLoading || integrationsLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Checking...
                        </span>
                    ) : connected ? 'Manage' : 'Connect'}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-black flex items-center gap-2">
                        {showSheetPicker && (
                            <button
                                onClick={() => setShowSheetPicker(false)}
                                className="text-gray-400 hover:text-gray-600 mr-1"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        )}
                        {showSheetPicker
                            ? 'Select a Google Sheet'
                            : connected
                                ? 'Manage Google Connection'
                                : 'Connect Google Account'
                        }
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-500">Connecting to Google...</p>
                    </div>

                ) : showSheetPicker ? (
                    /* ── SHEET PICKER ──────────────────────────────────────── */
                    <div className="py-2 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search your sheets..."
                                value={sheetSearch}
                                onChange={e => setSheetSearch(e.target.value)}
                                className="pl-9 text-sm"
                                autoFocus
                            />
                        </div>

                        {loadingSheets ? (
                            <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p className="text-sm">Loading your Google Sheets...</p>
                            </div>
                        ) : filteredAvailable.length === 0 ? (
                            <div className="py-10 text-center">
                                <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">
                                    {sheetSearch ? 'No sheets match your search.' : 'No Google Sheets found in your account.'}
                                </p>
                                {!sheetSearch && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Make sure you have sheets in Google Drive at drive.google.com
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                                {filteredAvailable.map(sheet => (
                                    <div
                                        key={sheet.sheet_id}
                                        className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{sheet.sheet_name}</p>
                                                {sheet.modified_at && (
                                                    <p className="text-xs text-gray-400">
                                                        Modified {new Date(sheet.modified_at).toLocaleDateString('en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {sheet.is_connected ? (
                                            <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5 flex-shrink-0 flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Connected
                                            </Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                                                onClick={() => handleConnectSheet(sheet)}
                                                disabled={connectingSheetId === sheet.sheet_id}
                                            >
                                                {connectingSheetId === sheet.sheet_id
                                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                                    : <><Plus className="h-3 w-3 mr-1" />Connect</>
                                                }
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-center pt-1">
                            <button
                                onClick={fetchAvailableSheets}
                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mx-auto"
                            >
                                <RefreshCw className="h-3 w-3" /> Refresh list
                            </button>
                        </div>
                    </div>

                ) : connected && accountInfo ? (
                    /* ── CONNECTED STATE ───────────────────────────────────── */
                    <div className="py-4 space-y-5">

                        {/* Profile header */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                {accountInfo.picture ? (
                                    <Image
                                        src={accountInfo.picture}
                                        alt={accountInfo.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover border border-gray-200"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                        <GoogleIcon className="h-5 w-5" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{accountInfo.name}</p>
                                    <p className="text-xs text-gray-500">{accountInfo.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Connected
                            </div>
                        </div>

                        {/* Permissions */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Permissions Granted
                            </p>
                            <ul className="space-y-1.5">
                                {[
                                    { icon: FileSpreadsheet, label: 'Read Google Sheets (new rows only)' },
                                    { icon: FileText, label: 'Read Google Forms responses' },
                                ].map(({ icon: Icon, label }) => (
                                    <li key={label} className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <Icon className="h-3.5 w-3.5 text-gray-400" />
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Connected sheets */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Connected Sheets ({connectedSheets.length})
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={fetchConnectedSheets}
                                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <RefreshCw className="h-3 w-3" /> Refresh
                                    </button>
                                    <button
                                        onClick={openSheetPicker}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-50"
                                    >
                                        <Plus className="h-3 w-3" /> Add Sheet
                                    </button>
                                </div>
                            </div>

                            {connectedSheets.length === 0 ? (
                                <div
                                    onClick={openSheetPicker}
                                    className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                                >
                                    <FileSpreadsheet className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-blue-600">Connect a Google Sheet</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Click to browse and select from your Google Drive
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {connectedSheets.map((sheet) => (
                                        <SheetRow
                                            key={sheet.sheet_id}
                                            sheet={sheet}
                                            isSyncing={syncingSheetId === sheet.sheet_id}
                                            isDisconnecting={disconnectingSheetId === sheet.sheet_id}
                                            onSync={() => handleManualSync(sheet.sheet_id)}
                                            onTogglePolling={() => handleTogglePolling(sheet.sheet_id)}
                                            onDisconnect={() => handleDisconnectSheet(sheet.sheet_id, sheet.sheet_name)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Disconnect account */}
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => setShowDisconnectConfirm(true)}
                            disabled={isLoading || !isAdmin}
                            title={!isAdmin ? "Only admins can disconnect integrations" : ""}
                        >
                            {!isAdmin ? 'Admin permission required' : 'Disconnect Account'}
                        </Button>

                        {!isAdmin && connected && (
                            <p className="text-sm text-amber-600">
                                Only administrators can disconnect integrations.
                            </p>
                        )}
                    </div>

                ) : (
                    /* ── DISCONNECTED STATE ────────────────────────────────── */
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-gray-600">
                            Connect your Google account to sync data from Sheets and Forms directly into your automations.
                        </p>

                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm rounded">
                            Your Google credentials are never stored on our servers. We use secure OAuth 2.0 authentication directly with Google. You are always in control and can disconnect at any time.
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-black">This will allow HeidelAI to:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <FileSpreadsheet className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    Read new rows from Google Sheets
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    Read responses from Google Forms
                                </li>
                            </ul>
                        </div>

                        <Button
                            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 shadow-sm"
                            onClick={handleGoogleLogin}
                            disabled={isLoading || !isAdmin}
                            title={!isAdmin ? "Only admins can connect integrations" : ""}
                        >
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</>
                            ) : !isAdmin ? (
                                'Admin permission required'
                            ) : (
                                <><GoogleIcon className="h-4 w-4" /> Continue with Google</>
                            )}
                        </Button>

                        {!isAdmin && !connected && (
                            <p className="text-sm text-amber-600">
                                Only administrators can connect integrations.
                            </p>
                        )}
                    </div>
                )}
            </DialogContent>

            {/* Disconnect confirmation */}
            <ConfirmDialog open={showDisconnectConfirm} onOpenChange={setShowDisconnectConfirm}>
                <ConfirmDialogContent>
                    <ConfirmDialogHeader>
                        <ConfirmDialogTitle>Disconnect Google Account?</ConfirmDialogTitle>
                    </ConfirmDialogHeader>
                    <div className="py-4 text-gray-700 text-sm">
                        This will stop all active Google Sheets polling. Automations that depend on Google Sheets or Forms data will be paused until you reconnect. Reconnecting later will resume from the last synced row — no data will be skipped or duplicated.
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowDisconnectConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disconnect'}
                        </Button>
                    </div>
                </ConfirmDialogContent>
            </ConfirmDialog>
        </Dialog>
    );
};

// ─── Sheet Row ────────────────────────────────────────────────────────────────

const SheetRow = ({
    sheet, isSyncing, isDisconnecting, onSync, onTogglePolling, onDisconnect
}: {
    sheet: ConnectedSheet;
    isSyncing: boolean;
    isDisconnecting: boolean;
    onSync: () => void;
    onTogglePolling: () => void;
    onDisconnect: () => void;
}) => {
    const formattedDate = sheet.last_synced_at
        ? new Date(sheet.last_synced_at).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        })
        : 'Never synced';

    return (
        <div className="border border-gray-200 rounded-lg p-3 bg-white hover:border-blue-200 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{sheet.sheet_name}</p>
                        <p className="text-xs text-gray-400">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge
                        className={`text-xs px-1.5 py-0.5 cursor-pointer select-none ${
                            sheet.polling_enabled
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        onClick={onTogglePolling}
                    >
                        {sheet.polling_enabled ? 'Auto' : 'Paused'}
                    </Badge>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={onSync}
                        disabled={isSyncing}
                        title="Sync now"
                    >
                        {isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={onDisconnect}
                        disabled={isDisconnecting}
                        title="Remove sheet"
                    >
                        {isDisconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </Button>
                </div>
            </div>
            {sheet.last_sync_rows > 0 && (
                <p className="text-xs text-gray-400 mt-1.5 pl-6">
                    {sheet.last_sync_rows} row{sheet.last_sync_rows !== 1 ? 's' : ''} in last sync
                </p>
            )}
        </div>
    );
};

// ─── Google Icon ──────────────────────────────────────────────────────────────

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default GoogleLoginDialog;

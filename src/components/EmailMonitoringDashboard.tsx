import { useState } from 'react';
import { Mail, CheckCircle, XCircle, Clock, RefreshCw, Send, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Email types that are tracked in the system
const EMAIL_TYPES = [
  { type: 'welcome', label: 'Welcome Email', description: 'Sent to new users after registration' },
  { type: 'password_reset', label: 'Password Reset', description: 'Sent when user requests password reset' },
  { type: 'verification', label: 'Email Verification', description: 'Resent verification emails' },
  { type: 'investment_confirmation', label: 'Investment Confirmation', description: 'Sent after investment submission' },
  { type: 'investment_activation', label: 'Investment Activation', description: 'Sent when investment is approved' },
  { type: 'withdrawal_request', label: 'Withdrawal Request', description: 'Sent when user requests withdrawal' },
  { type: 'withdrawal_status', label: 'Withdrawal Status', description: 'Sent when withdrawal status changes' },
  { type: 'withdrawal_confirmation', label: 'Withdrawal Confirmation', description: 'Sent when withdrawal is completed' },
  { type: 'profit_notification', label: 'Profit Notification', description: 'Sent when profit is added to investment' },
];

interface EmailLog {
  id: string;
  timestamp: string;
  email: string;
  type: string;
  status: 'sent' | 'failed' | 'pending';
  resendId?: string;
}

// Sample data to show the format - in production, this would come from a database table
const SAMPLE_LOGS: EmailLog[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    email: 'user@example.com',
    type: 'password_reset',
    status: 'sent',
    resendId: '0beb1c18-29a2-4f38-8c93-4ed25209da4e',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    email: 'investor@example.com',
    type: 'investment_activation',
    status: 'sent',
    resendId: 'abc123-def456-ghi789',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    email: 'newuser@example.com',
    type: 'welcome',
    status: 'sent',
    resendId: 'xyz789-abc123-def456',
  },
];

const EmailMonitoringDashboard = () => {
  const [logs] = useState<EmailLog[]>(SAMPLE_LOGS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real implementation, this would fetch from a database table
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeLabel = (type: string) => {
    const emailType = EMAIL_TYPES.find(t => t.type === type);
    return emailType?.label || type;
  };

  // Calculate statistics
  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === 'sent').length,
    failed: logs.filter(l => l.status === 'failed').length,
    pending: logs.filter(l => l.status === 'pending').length,
  };

  const successRate = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <Mail className="w-5 h-5 text-electric-blue" />
            Email Delivery Monitor
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track email delivery status and Resend IDs
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-electric-blue" />
            <span className="text-sm text-slate-400">Total Sent</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-slate-400">Delivered</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.sent}</p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-slate-400">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-electric-blue" />
            <span className="text-sm text-slate-400">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-electric-blue">{successRate}%</p>
        </div>
      </div>

      {/* Email Types Reference */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          Tracked Email Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {EMAIL_TYPES.map((type) => (
            <div key={type.type} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-electric-blue" />
              <span className="text-white font-medium">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Format Info */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          📋 Log Format in Backend Functions
        </h3>
        <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
          [EMAIL_MONITOR] SENT | To: email@example.com | Type: password_reset | Resend_ID: abc123-xyz789 | Time: 1767537424803
        </div>
        <p className="text-xs text-slate-400 mt-2">
          View these logs in the Backend → Edge Function Logs section. Each email send is logged with the recipient, type, Resend tracking ID, and timestamp.
        </p>
      </div>

      {/* Recent Emails Table */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-white">Recent Email Activity (Sample)</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Recipient</TableHead>
                <TableHead className="text-slate-400">Resend ID</TableHead>
                <TableHead className="text-slate-400">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow className="border-slate-700">
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    No email logs available. Email activity will appear here once emails are sent.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-slate-700 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadge(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {getTypeLabel(log.type)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {log.email}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {log.resendId || '-'}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-electric-blue mb-2">💡 How to Monitor Email Delivery</h4>
        <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
          <li>Open the Backend panel (click "View Backend" button)</li>
          <li>Navigate to Edge Function Logs</li>
          <li>Select the specific function (e.g., request-password-reset)</li>
          <li>Look for logs starting with <code className="bg-slate-700 px-1 rounded">[EMAIL_MONITOR]</code></li>
          <li>Use the Resend ID to track delivery status in your Resend dashboard</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailMonitoringDashboard;

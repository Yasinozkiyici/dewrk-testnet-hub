'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TestnetListRow } from './types';

interface ExportButtonProps {
  data: TestnetListRow[];
  disabled?: boolean;
}

export function ExportButton({ data, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data.length) return;
    
    setIsExporting(true);
    try {
      const headers = [
        'Name',
        'Network',
        'Status',
        'Difficulty',
        'Est. Time (min)',
        'Reward Type',
        'Reward Note',
        'KYC Required',
        'Wallet Required',
        'Tasks',
        'Total Raised (USD)',
        'Updated At',
        'Website',
        'Dashboard'
      ];

      const rows = data.map((item) => [
        item.name || '',
        item.network || '',
        item.status || '',
        item.difficulty || '',
        item.estTimeMinutes?.toString() || '',
        item.rewardType || '',
        item.rewardNote || '',
        item.kycRequired ? 'Yes' : 'No',
        item.requiresWallet ? 'Yes' : 'No',
        item.tasksCount?.toString() || '0',
        item.totalRaisedUSD?.toString() || '',
        item.updatedAt || '',
        item.websiteUrl || '',
        item.dashboardUrl || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dewrk-testnets-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting || !data.length}
      className="gap-1.5 text-xs"
      title="Export table to CSV"
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
}


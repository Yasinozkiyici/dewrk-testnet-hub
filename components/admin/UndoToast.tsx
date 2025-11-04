'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Undo Toast Component
 * 
 * Shows undo action after successful save.
 * Usage:
 * ```tsx
 * <UndoToast
 *   onUndo={() => restorePreviousState()}
 *   onDismiss={() => setShowUndo(false)}
 * />
 * ```
 */

interface UndoToastProps {
  onUndo: () => void | Promise<void>;
  onDismiss?: () => void;
  message?: string;
  timeout?: number;
}

export function UndoToast({ onUndo, onDismiss, message = 'Changes saved', timeout = 5000 }: UndoToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleUndo = async () => {
    await onUndo();
    setIsVisible(false);
    onDismiss?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Auto-dismiss after timeout
  useState(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, timeout);

    return () => clearTimeout(timer);
  });

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--ink-1)]">{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          className="h-8 gap-1 text-xs"
        >
          <RotateCcw className="h-3 w-3" />
          Undo
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 px-2">
          ×
        </Button>
      </div>
    </div>
  );
}


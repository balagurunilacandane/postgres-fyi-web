"use client";

import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  target?: HTMLElement | Document | Window;
  enabled?: boolean;
  requireFocus?: HTMLElement | null;
}

export function useKeyboardShortcut(
  callback: () => void,
  options: KeyboardShortcutOptions
) {
  const callbackRef = useRef(callback);
  const optionsRef = useRef(options);

  // Update refs when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
    optionsRef.current = options;
  }, [callback, options]);

  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    const opts = optionsRef.current;
    
    // Check if shortcut is enabled
    if (opts.enabled === false) return;

    // Check if specific element needs focus
    if (opts.requireFocus) {
      const activeElement = document.activeElement;
      const hasFocus = opts.requireFocus === activeElement || 
                      opts.requireFocus.contains(activeElement as Node);
      if (!hasFocus) return;
    }

    // Normalize key for cross-browser compatibility
    const normalizedKey = keyboardEvent.key.toLowerCase();
    const targetKey = opts.key.toLowerCase();
    
    // Handle Enter key variations
    const isEnterKey = targetKey === 'enter' && 
                      (normalizedKey === 'enter' || keyboardEvent.keyCode === 13 || keyboardEvent.which === 13);
    
    // Check key match
    if (!isEnterKey && normalizedKey !== targetKey) return;

    // Check modifier keys with cross-platform support
    const needsCtrlOrCmd = opts.ctrlKey || opts.metaKey;
    const hasCtrlOrCmd = keyboardEvent.ctrlKey || keyboardEvent.metaKey;
    
    if (needsCtrlOrCmd && !hasCtrlOrCmd) return;
    if (opts.shiftKey && !keyboardEvent.shiftKey) return;
    if (opts.altKey && !keyboardEvent.altKey) return;

    // Prevent default browser behavior
    if (opts.preventDefault !== false) {
      keyboardEvent.preventDefault();
    }
    
    if (opts.stopPropagation !== false) {
      keyboardEvent.stopPropagation();
    }

    // Execute callback
    callbackRef.current();
  }, []);

  useEffect(() => {
    const target = options.target || document;
    
    // Use capture phase to ensure we catch the event before other handlers
    target.addEventListener('keydown', handleKeyDown, true);

    return () => {
      target.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown, options.target]);
}

// Specialized hook for Ctrl+Enter with cross-platform support
export function useCtrlEnter(
  callback: () => void, 
  enabled: boolean = true,
  requireFocus?: HTMLElement | null
) {
  return useKeyboardShortcut(callback, {
    key: 'Enter',
    ctrlKey: true,
    metaKey: true, // This handles Cmd+Enter on Mac
    enabled,
    preventDefault: true,
    stopPropagation: true,
    requireFocus,
  });
}

// Hook for checking if an element is focused
export function useElementFocus(elementRef: React.RefObject<HTMLElement>) {
  const isFocused = useCallback(() => {
    if (!elementRef.current) return false;
    
    const activeElement = document.activeElement;
    return elementRef.current === activeElement || 
           elementRef.current.contains(activeElement);
  }, [elementRef]);

  return isFocused;
}

// Cross-browser key detection utilities
export const KeyUtils = {
  isEnterKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Enter' || 
           event.keyCode === 13 || 
           event.which === 13;
  },
  
  isCtrlOrCmd: (event: KeyboardEvent): boolean => {
    return event.ctrlKey || event.metaKey;
  },
  
  isMac: (): boolean => {
    return typeof navigator !== 'undefined' && 
           /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  },
  
  getShortcutText: (key: string, useCtrl: boolean = true): string => {
    const isMac = KeyUtils.isMac();
    const modifier = useCtrl ? (isMac ? '⌘' : 'Ctrl') : '';
    return `${modifier}${modifier ? '+' : ''}${key}`;
  }
};
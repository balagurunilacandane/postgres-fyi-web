import { useEffect, useCallback, useRef } from 'react';

export function useKeyboardShortcut(callback, options) {
  const callbackRef = useRef(callback);
  const optionsRef = useRef(options);

  // Update refs when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
    optionsRef.current = options;
  }, [callback, options]);

  const handleKeyDown = useCallback((event) => {
    const opts = optionsRef.current;
    
    // Check if shortcut is enabled
    if (opts.enabled === false) return;

    // Check if specific element needs focus
    if (opts.requireFocus) {
      const activeElement = document.activeElement;
      const hasFocus = opts.requireFocus === activeElement || 
                      opts.requireFocus.contains(activeElement);
      if (!hasFocus) return;
    }

    // Normalize key for cross-browser compatibility
    const normalizedKey = event.key.toLowerCase();
    const targetKey = opts.key.toLowerCase();
    
    // Handle Enter key variations
    const isEnterKey = targetKey === 'enter' && 
                      (normalizedKey === 'enter' || event.keyCode === 13 || event.which === 13);
    
    // Check key match
    if (!isEnterKey && normalizedKey !== targetKey) return;

    // Check modifier keys with cross-platform support
    const needsCtrlOrCmd = opts.ctrlKey || opts.metaKey;
    const hasCtrlOrCmd = event.ctrlKey || event.metaKey;
    
    if (needsCtrlOrCmd && !hasCtrlOrCmd) return;
    if (opts.shiftKey && !event.shiftKey) return;
    if (opts.altKey && !event.altKey) return;

    // Prevent default browser behavior
    if (opts.preventDefault !== false) {
      event.preventDefault();
    }
    
    if (opts.stopPropagation !== false) {
      event.stopPropagation();
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
export function useCtrlEnter(callback, enabled = true, requireFocus) {
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

// Cross-browser key detection utilities
export const KeyUtils = {
  isEnterKey: (event) => {
    return event.key === 'Enter' || 
           event.keyCode === 13 || 
           event.which === 13;
  },
  
  isCtrlOrCmd: (event) => {
    return event.ctrlKey || event.metaKey;
  },
  
  isMac: () => {
    return typeof navigator !== 'undefined' && 
           /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  },
  
  getShortcutText: (key, useCtrl = true) => {
    const isMac = KeyUtils.isMac();
    const modifier = useCtrl ? (isMac ? '⌘' : 'Ctrl') : '';
    return `${modifier}${modifier ? '+' : ''}${key}`;
  }
};
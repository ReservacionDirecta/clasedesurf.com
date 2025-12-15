'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseFormPersistenceOptions {
    /** Whether to show browser warning before unload when dirty */
    warnOnUnload?: boolean;
    /** Whether to prevent data refetch when dirty */
    preventRefetchWhenDirty?: boolean;
}

interface UseFormPersistenceReturn<T> {
    /** Current form data */
    data: T;
    /** Set new form data */
    setData: React.Dispatch<React.SetStateAction<T>>;
    /** Whether the form has unsaved changes */
    isDirty: boolean;
    /** Manually set dirty state */
    setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
    /** Mark form as clean (e.g., after save) */
    markAsClean: () => void;
    /** Mark form as dirty (e.g., when user edits) */
    markAsDirty: () => void;
    /** Update a single field and mark as dirty */
    updateField: <K extends keyof T>(field: K, value: T[K]) => void;
    /** Whether initial data has been loaded */
    isInitialized: boolean;
    /** Mark as initialized (prevents refetches) */
    setInitialized: () => void;
    /** Check if should refetch (not initialized and not dirty) */
    shouldRefetch: boolean;
    /** Original data for comparison/reset */
    originalData: T | null;
    /** Reset to original data */
    resetToOriginal: () => void;
    /** Reference to store original data */
    setOriginalData: (data: T) => void;
}

/**
 * Hook to prevent data loss when switching browser tabs or closing the page.
 * 
 * Features:
 * - Tracks dirty state when form data changes
 * - Shows browser warning before unload when there are unsaved changes
 * - Prevents data refetch when form has unsaved changes
 * - Provides utilities to reset form to original state
 * 
 * @param initialData Initial form data
 * @param options Configuration options
 * @returns Form persistence utilities
 */
export function useFormPersistence<T>(
    initialData: T,
    options: UseFormPersistenceOptions = {}
): UseFormPersistenceReturn<T> {
    const { warnOnUnload = true, preventRefetchWhenDirty = true } = options;

    const [data, setData] = useState<T>(initialData);
    const [isDirty, setIsDirty] = useState(false);
    const [isInitialized, setIsInitializedState] = useState(false);
    const originalDataRef = useRef<T | null>(null);

    // Mark as clean (e.g., after successful save)
    const markAsClean = useCallback(() => {
        setIsDirty(false);
    }, []);

    // Mark as dirty (e.g., when user edits)
    const markAsDirty = useCallback(() => {
        setIsDirty(true);
    }, []);

    // Update a single field and mark as dirty
    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    }, []);

    // Mark as initialized
    const setInitialized = useCallback(() => {
        setIsInitializedState(true);
    }, []);

    // Store original data for comparison/reset
    const setOriginalData = useCallback((newData: T) => {
        originalDataRef.current = JSON.parse(JSON.stringify(newData));
        setData(newData);
        setIsDirty(false);
        setIsInitializedState(true);
    }, []);

    // Reset to original data
    const resetToOriginal = useCallback(() => {
        if (originalDataRef.current) {
            setData(JSON.parse(JSON.stringify(originalDataRef.current)));
            setIsDirty(false);
        }
    }, []);

    // Compute should refetch
    const shouldRefetch = !isInitialized && (!preventRefetchWhenDirty || !isDirty);

    // Warn user before leaving if there are unsaved changes
    useEffect(() => {
        if (!warnOnUnload) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome
                return ''; // Required for other browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, warnOnUnload]);

    return {
        data,
        setData,
        isDirty,
        setIsDirty,
        markAsClean,
        markAsDirty,
        updateField,
        isInitialized,
        setInitialized,
        shouldRefetch,
        originalData: originalDataRef.current,
        resetToOriginal,
        setOriginalData,
    };
}

/**
 * Simple hook that just tracks dirty state and warns on unload.
 * Use this for simpler forms where you don't need full persistence.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
}

export default useFormPersistence;

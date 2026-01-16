import { useState, useEffect } from 'react'

export function useFormPersistence<T>(key: string, initialValues: T) {
    const [data, setData] = useState<T>(initialValues)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(key)
            if (saved) {
                setData(JSON.parse(saved))
            }
        } catch (e) {
            console.error('Error loading persisted form data:', e)
        } finally {
            setIsLoaded(true)
        }
    }, [key])

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (isLoaded) {
            const timeoutId = setTimeout(() => {
                try {
                    localStorage.setItem(key, JSON.stringify(data))
                } catch (e) {
                    console.error('Error saving form data:', e)
                }
            }, 500) // Debounce 500ms

            return () => clearTimeout(timeoutId)
        }
    }, [data, key, isLoaded])

    const clearPersistence = () => {
        try {
            localStorage.removeItem(key)
        } catch (e) {
            console.error('Error clearing persisted form data:', e)
        }
    }

    return { data, setData, isLoaded, clearPersistence }
}

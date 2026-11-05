import { useEffect, useRef, useCallback } from 'react'

export function useReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const observe = useCallback((element: HTMLElement | null) => {
    if (!element) return

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
            }
          })
        },
        { threshold: 0.15 }
      )
    }

    observerRef.current.observe(element)
  }, [])

  useEffect(() => {
    return () => observerRef.current?.disconnect()
  }, [])

  return observe
}

export function useRevealAll(deps: unknown[] = []) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

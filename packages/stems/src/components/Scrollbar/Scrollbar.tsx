import { useEffect, useRef, forwardRef, Ref, useCallback, useId } from 'react'

import { ResizeObserver } from '@juggle/resize-observer'
import cn from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import useMeasure from 'react-use-measure'

import styles from './Scrollbar.module.css'
import { ScrollbarProps } from './types'

/**
 * @deprecated use `@audius/harmony` Scrollbar instead
 */
export const Scrollbar = forwardRef(
  (
    { children, className, id, forward, isHidden, ...props }: ScrollbarProps,
    forwardedRef: Ref<PerfectScrollbar>
  ) => {
    // Do not remove:
    // useMeasure ref is required for infinite scrolling to work
    const [ref] = useMeasure({ polyfill: ResizeObserver })
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const reactId = useId()
    const elementId = id || reactId

    useEffect(() => {
      return () => {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current)
        }
      }
    }, [])

    const hideScrollbar = useCallback(() => {
      const element = document.getElementById(elementId)
      if (element) {
        element.classList.remove('scrollbar--hovered-visible')
      }
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }, [elementId, timerRef])

    const showScrollbar = useCallback(() => {
      if (isHidden) return
      const element = document.getElementById(elementId)
      if (element) {
        element.classList.add('scrollbar--hovered-visible')
      }
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        const element = document.getElementById(elementId)
        if (element) {
          element.classList.remove('scrollbar--hovered-visible')
        }
      }, 1400)
    }, [elementId, timerRef, isHidden])

    useEffect(() => {
      if (isHidden) {
        hideScrollbar()
      }
    }, [isHidden, hideScrollbar])

    const content = forward ? children : <div ref={ref}>{children}</div>

    return (
      <PerfectScrollbar
        {...props}
        ref={forwardedRef}
        id={elementId}
        className={cn(styles.scrollbar, className)}
        onMouseEnter={showScrollbar}
        onMouseLeave={hideScrollbar}
      >
        {content}
      </PerfectScrollbar>
    )
  }
)

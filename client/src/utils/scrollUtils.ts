/**
 * Enhanced smooth scrolling utility functions
 */

/**
 * Smoothly scrolls an element to the bottom with animation
 * @param element The DOM element to scroll (typically a chat container)
 * @param duration Animation duration in milliseconds
 */
export const smoothScrollToBottom = (
    element: HTMLElement | null,
    duration: number = 300
): void => {
    if ( !element ) return;

    const targetPosition = element.scrollHeight - element.clientHeight;
    const startPosition = element.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    // Don't animate if already at bottom or very close
    if ( Math.abs( distance ) < 10 ) {
        element.scrollTop = targetPosition;
        return;
    }
    function animation( currentTime: number ) {
        if ( startTime === null ) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min( timeElapsed / duration, 1 );
        const easeInOut = ( progress: number ): number => progress < 0.5 ? 2 * progress * progress : 1 - Math.pow( -2 * progress + 2, 2 ) / 2;

        if ( element ) {
            element.scrollTop = startPosition + distance * easeInOut( progress );
        }

        if ( timeElapsed < duration ) {
            requestAnimationFrame( animation );
        }
    }

    requestAnimationFrame( animation );
};

/**
 * Smoothly scrolls to a specific element within a container
 * @param container The scrollable container
 * @param targetElement The element to scroll to
 * @param options Configuration options
 */
export const smoothScrollToElement = (
    container: HTMLElement | null,
    targetElement: HTMLElement | null,
    options: {
        offset?: number; // Offset from the top of the container
        duration?: number; // Animation duration in ms
        alignment?: 'start' | 'center' | 'end' | 'nearest'; // Where to position the element
    } = {}
): void => {
    if ( !container || !targetElement ) return;

    const { offset = 0, duration = 300, alignment = 'center' } = options;

    // Use native scrollIntoView for simplicity when possible
    if ( duration <= 0 || typeof window === 'undefined' ) {
        targetElement.scrollIntoView( { behavior: 'smooth', block: alignment } );
        return;
    }

    // Calculate target position
    const containerRect = container.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    let targetPosition;

    switch ( alignment ) {
        case 'start':
            targetPosition = targetRect.top - containerRect.top + container.scrollTop - offset;
            break;
        case 'end':
            targetPosition = targetRect.bottom - containerRect.bottom + container.scrollTop + offset;
            break;
        case 'center':
            targetPosition = targetRect.top - containerRect.top + container.scrollTop -
                ( containerRect.height - targetRect.height ) / 2;
            break;
        case 'nearest':
        default:
            // Only scroll if the element is not fully visible
            if ( targetRect.top < containerRect.top ) {
                targetPosition = targetRect.top - containerRect.top + container.scrollTop - offset;
            } else if ( targetRect.bottom > containerRect.bottom ) {
                targetPosition = targetRect.bottom - containerRect.bottom + container.scrollTop + offset;
            } else {
                return; // Element already visible
            }
    }

    const startPosition = container.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;
    function animation( currentTime: number ) {
        if ( startTime === null ) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min( timeElapsed / duration, 1 );

        // Easing function (ease-in-out)
        const easeInOut = ( progress: number ): number => progress < 0.5 ? 2 * progress * progress : 1 - Math.pow( -2 * progress + 2, 2 ) / 2;

        if ( container ) {
            container.scrollTop = startPosition + distance * easeInOut( progress );
        }

        if ( timeElapsed < duration ) {
            requestAnimationFrame( animation );
        }
    }

    requestAnimationFrame( animation );
};

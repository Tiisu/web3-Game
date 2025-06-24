// Mobile interactions hook for touch gestures and mobile-specific features

import { useEffect, useCallback, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
}

interface MobileInteractionsOptions {
  enableSwipe?: boolean;
  enableHaptic?: boolean;
  swipeThreshold?: number;
  element?: HTMLElement | null;
}

export const useMobileInteractions = (options: MobileInteractionsOptions = {}) => {
  const {
    enableSwipe = true,
    enableHaptic = true,
    swipeThreshold = 50,
    element
  } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [touchSupported, setTouchSupported] = useState(false);
  
  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchTimeRef = useRef<number>(0);
  const swipeCallbackRef = useRef<((gesture: SwipeGesture) => void) | null>(null);

  // Detect mobile device and touch support
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(isMobileDevice);
      setTouchSupported(hasTouch);
    };

    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkMobile();
    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptic || !navigator.vibrate) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };

    navigator.vibrate(patterns[type]);
  }, [enableHaptic]);

  // Touch event handlers
  const handleTouchStart = useCallback((event: Event) => {
    const touchEvent = event as TouchEvent;
    if (!enableSwipe) return;

    const touch = touchEvent.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    touchTimeRef.current = Date.now();
  }, [enableSwipe]);

  const handleTouchEnd = useCallback((event: Event) => {
    const touchEvent = event as TouchEvent;
    if (!enableSwipe || !touchStartRef.current) return;

    const touch = touchEvent.changedTouches[0];
    const touchEnd = {
      x: touch.clientX,
      y: touch.clientY
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - touchTimeRef.current;

    if (distance >= swipeThreshold && duration < 500) {
      let direction: SwipeGesture['direction'];

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gesture: SwipeGesture = {
        direction,
        distance,
        duration
      };

      if (swipeCallbackRef.current) {
        swipeCallbackRef.current(gesture);
      }

      triggerHaptic('light');
    }

    touchStartRef.current = null;
  }, [enableSwipe, swipeThreshold, triggerHaptic]);

  // Set up touch event listeners
  useEffect(() => {
    const targetElement = element || document;

    if (enableSwipe && touchSupported) {
      targetElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      targetElement.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        targetElement.removeEventListener('touchstart', handleTouchStart);
        targetElement.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [element, enableSwipe, touchSupported, handleTouchStart, handleTouchEnd]);

  // Register swipe callback
  const onSwipe = useCallback((callback: (gesture: SwipeGesture) => void) => {
    swipeCallbackRef.current = callback;
  }, []);

  // Add touch feedback to element
  const addTouchFeedback = useCallback((targetElement: HTMLElement) => {
    if (!touchSupported) return;

    targetElement.classList.add('touch-feedback', 'mobile-haptic-feedback');

    const handleTouchStart = () => {
      triggerHaptic('light');
    };

    targetElement.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      targetElement.removeEventListener('touchstart', handleTouchStart);
      targetElement.classList.remove('touch-feedback', 'mobile-haptic-feedback');
    };
  }, [touchSupported, triggerHaptic]);

  // Optimize element for touch
  const optimizeForTouch = useCallback((targetElement: HTMLElement) => {
    if (!touchSupported) return;

    targetElement.classList.add('touch-optimized', 'touch-target');
    targetElement.style.touchAction = 'manipulation';
    (targetElement.style as any).webkitTapHighlightColor = 'transparent';

    return () => {
      targetElement.classList.remove('touch-optimized', 'touch-target');
    };
  }, [touchSupported]);

  // Prevent zoom on double tap
  const preventZoom = useCallback((targetElement: HTMLElement) => {
    if (!touchSupported) return;

    let lastTouchEnd = 0;

    const handleTouchEnd = (event: Event) => {
      const touchEvent = event as TouchEvent;
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        touchEvent.preventDefault();
      }
      lastTouchEnd = now;
    };

    targetElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      targetElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchSupported]);

  // Add mobile-specific CSS classes
  const addMobileClasses = useCallback((targetElement: HTMLElement) => {
    if (isMobile) {
      targetElement.classList.add('mobile-optimized');
    }
    if (isLandscape) {
      targetElement.classList.add('landscape-mode');
    } else {
      targetElement.classList.add('portrait-mode');
    }

    return () => {
      targetElement.classList.remove('mobile-optimized', 'landscape-mode', 'portrait-mode');
    };
  }, [isMobile, isLandscape]);

  // Enhanced click handler for mobile
  const createMobileClickHandler = useCallback((
    callback: (event: Event) => void,
    options: { haptic?: boolean; feedback?: boolean } = {}
  ) => {
    const { haptic = true, feedback = true } = options;

    return (event: Event) => {
      if (haptic) {
        triggerHaptic('light');
      }

      if (feedback && event.target instanceof HTMLElement) {
        const target = event.target as HTMLElement;
        target.classList.add('mobile-bounce');
        setTimeout(() => {
          target.classList.remove('mobile-bounce');
        }, 400);
      }

      callback(event);
    };
  }, [triggerHaptic]);

  // Scroll to element with mobile-friendly behavior
  const scrollToElement = useCallback((
    targetElement: HTMLElement,
    options: ScrollIntoViewOptions = {}
  ) => {
    const defaultOptions: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    };

    targetElement.scrollIntoView({ ...defaultOptions, ...options });
  }, []);

  // Check if element is in viewport (useful for mobile)
  const isInViewport = useCallback((targetElement: HTMLElement) => {
    const rect = targetElement.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, []);

  // Get safe area insets for mobile devices with notches
  const getSafeAreaInsets = useCallback(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    };
  }, []);

  return {
    // Device detection
    isMobile,
    isLandscape,
    touchSupported,
    
    // Gesture handling
    onSwipe,
    triggerHaptic,
    
    // Element enhancement
    addTouchFeedback,
    optimizeForTouch,
    preventZoom,
    addMobileClasses,
    
    // Interaction helpers
    createMobileClickHandler,
    scrollToElement,
    isInViewport,
    getSafeAreaInsets
  };
};

import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(ref, active = true) {
  useEffect(() => {
    if (!active || !ref.current) return undefined;

    const node = ref.current;
    const previouslyFocused = document.activeElement;
    const firstFocusable = node.querySelector(FOCUSABLE);
    firstFocusable?.focus();

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [ref, active]);
}

import { useEffect, useRef } from 'react';

const updateProperties = (elem: HTMLElement, state: any) => {
	elem.style.setProperty('--x', `${state.x}px`)
	elem.style.setProperty('--y', `${state.y}px`)
	elem.style.setProperty('--width', `${state.width}px`)
	elem.style.setProperty('--height', `${state.height}px`)
	elem.style.setProperty('--radius', state.radius)
	elem.style.setProperty('--scale', state.scale)
}

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let onElement: Element | undefined;

    const createState = (e: MouseEvent) => {
      const defaultState = {
        x: e.clientX,
        y: e.clientY,
        width: 42,
        height: 42,
        radius: '100px',
        scale: 1
      }

      const computedState: any = {}
      
      if (onElement) {
        const { top, left, width, height } = onElement.getBoundingClientRect()
        const radius = window.getComputedStyle(onElement).borderRadius
        
        computedState.x = left + width / 2
        computedState.y = top + height / 2
        computedState.width = width
        computedState.height = height
        computedState.radius = radius
        computedState.scale = 1.05
      }

      return {
        ...defaultState,
        ...computedState
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      const state = createState(e)
      updateProperties(cursor, state)
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a, button, input, [role="button"]');
      if (target) {
        onElement = target;
      } else {
        onElement = undefined;
      }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return (
    <>
      <style>{`
        .custom-cursor {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: var(--width, 42px);
          height: var(--height, 42px);
          transform: translate(calc(var(--x, 0) - var(--width, 42px) / 2), calc(var(--y, 0) - var(--height, 42px) / 2));
          transition: 
            width 0.2s cubic-bezier(0.23, 1, 0.32, 1),
            height 0.2s cubic-bezier(0.23, 1, 0.32, 1),
            transform 0.1s cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 9999;
          pointer-events: none;
          will-change: transform;
        }

        @media (pointer: fine) {
          .custom-cursor { display: block; }
          body { cursor: none !important; }
          a, button, [role="button"], input, select { cursor: none !important; }
        }

        .custom-cursor::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: var(--radius, 100px);
          border: 2px solid #00f3ff;
          opacity: var(--scale, 1);
          transform: scale(var(--scale, 1));
          transition:
            .3s cubic-bezier(.25, .25, .42, 1) opacity,
            .3s cubic-bezier(.25, .25, .42, 1) transform,
            .1s cubic-bezier(.25, .25, .42, 1) border-radius;
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.4), inset 0 0 10px rgba(0, 243, 255, 0.2);
        }

        body:not(:hover) .custom-cursor::after {
          opacity: 0;
          transform: scale(0);
        }
      `}</style>
      <div ref={cursorRef} className="custom-cursor" />
    </>
  );
}

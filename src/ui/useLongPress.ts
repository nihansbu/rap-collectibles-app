import { useRef, type MouseEvent, type PointerEvent } from "react";

export function useLongPress({
  onPress,
  onLongPress,
  delay = 450,
}: {
  onPress: () => void;
  onLongPress: () => void;
  delay?: number;
}) {
  const timeoutRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  function clearTimer() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function start(event: PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    clearTimer();
    longPressTriggeredRef.current = false;
    timeoutRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      onLongPress();
    }, delay);
  }

  function finish() {
    clearTimer();
  }

  function cancel() {
    clearTimer();
    longPressTriggeredRef.current = false;
  }

  function preventContextMenu(event: MouseEvent) {
    event.preventDefault();
    onLongPress();
  }

  function click() {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    onPress();
  }

  return {
    onPointerDown: start,
    onPointerUp: finish,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onContextMenu: preventContextMenu,
    onClick: click,
  };
}

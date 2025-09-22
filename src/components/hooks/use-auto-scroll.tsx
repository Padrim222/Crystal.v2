import { useRef, useEffect, useState } from "react";

interface UseAutoScrollProps {
  smooth?: boolean;
  content?: React.ReactNode;
}

export function useAutoScroll({ smooth = false, content }: UseAutoScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const behavior = smooth ? "smooth" : "auto";
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: behavior as ScrollBehavior,
      });
    }
  };

  const checkIfAtBottom = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 50; // pixels from bottom
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold);
    }
  };

  const disableAutoScroll = () => {
    setAutoScrollEnabled(false);
  };

  useEffect(() => {
    if (autoScrollEnabled && isAtBottom) {
      scrollToBottom();
    }
  }, [content, autoScrollEnabled, isAtBottom]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      checkIfAtBottom();
      // Re-enable auto scroll when user scrolls to bottom
      if (scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 50) {
        setAutoScrollEnabled(true);
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    scrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
    disableAutoScroll,
  };
}
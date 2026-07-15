import { useState, useCallback } from 'react';

export default function useTypingAnimation(delayMin = 1500, delayMax = 2500) {
  const [isTyping, setIsTyping] = useState(false);

  const showTyping = useCallback(() => {
    return new Promise((resolve) => {
      setIsTyping(true);
      const delay = delayMin + Math.random() * (delayMax - delayMin);
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, delay);
    });
  }, [delayMin, delayMax]);

  return { isTyping, showTyping, setIsTyping };
}

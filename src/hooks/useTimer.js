import { useEffect, useState } from "react";

export function useTimer(isRunning, initialTime = 0) {
  const [elapsedTime, setElapsedTime] = useState(initialTime);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return elapsedTime;
}

import { useState, useEffect } from "react";
import { useTimer } from "./hooks/useTimer.js";

export default function Card({
  id,
  description,
  created,
  isRunning,
  time,
  stopped,
  deleteCard,
  getTime,
}) {
  const [isTimerRunning, setIsTimerRunning] = useState(isRunning);
  const elapsedTime = useTimer(isTimerRunning, time);
  const [stop, setStop] = useState(stopped);

  const seconds = Math.floor(elapsedTime % 60);
  const minutes = Math.floor((elapsedTime / 60) % 60);
  const hours = Math.floor(elapsedTime / 3600);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  const handleRunning = () => {
    setIsTimerRunning(!isTimerRunning);
    if (isTimerRunning) handleTime();
  };

  const updateStoppedStatus = async (stopped) => {
    try {
      await fetch(import.meta.env.VITE_DATABASE_HTTP + "/api/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          stopped,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleStop = () => {
    setIsTimerRunning(false);
    setStop(true);
    handleTime();
    updateStoppedStatus(true);
  };

  const handleDelete = async () => {
    const url = import.meta.env.VITE_DATABASE_HTTP + `/api/delete/${id}`;

    try {
      await fetch(url, { method: "DELETE" });
      deleteCard(id);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  function handleTime() {
    getTime(id, elapsedTime);
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTimerRunning) {
        handleTime();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isTimerRunning, elapsedTime]);

  const buttonClass = isTimerRunning
    ? "w-20 bg-gray-500 text-white px-2 py-1.5 shadow-md rounded hover:bg-gray-600"
    : "w-20 bg-blue-500 text-white px-2 py-1.5 shadow-md rounded hover:bg-blue-600";

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="border border-gray-300 p-3">
          <p className="font-bold text-xl break-all">{description}</p>
        </td>
        <td className="border border-gray-300 text-red-400 font-semibold p-3">
          High
        </td>
        <td className="border border-gray-300 p-3">
          <span className="flex-grow text-center text-md sm:text-2xl md:text-3xl lg:text-4xl">
            {hours > 0
              ? `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(
                  seconds
                )}`
              : `${formatTime(minutes)}:${formatTime(seconds)}`}
          </span>
        </td>
        <td className="border border-gray-300 p-3">{created}</td>
        <td className="border border-gray-300 p-3 w-[200px]">
          <div className="w-full flex justify-start">
            {stop ? (
              <button
                onClick={handleDelete}
                className="font-semibold bg-red-500 text-white px-2 py-1.5 shadow-md rounded hover:bg-red-600 min-w-[80px] max-w-[120px]"
              >
                Delete
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 max-w-[250px]">
                <button
                  className={`font-semibold ${buttonClass} min-w-[80px] w-full`}
                  onClick={handleRunning}
                >
                  {isTimerRunning ? "Pause" : "Start"}
                </button>
                <button
                  className="font-semibold bg-red-500 text-white px-2 py-1.5 shadow-md rounded hover:bg-red-600 min-w-[80px] w-full"
                  onClick={handleStop}
                >
                  Stop
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

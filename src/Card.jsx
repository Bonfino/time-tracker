import { useState, useEffect } from "react";
import { useTimer } from "./hooks/useTimer.js";
import axios from "axios";

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
      await axios.put(import.meta.env.VITE_DATABASE_HTTP + "/api/update", {
        id,
        stopped,
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

    /*
    try {
      await axios.delete(
        `${import.meta.env.VITE_DATABASE_HTTP}/api/delete/${id}`
      );

      deleteCard(id);
    } catch (error) {
      console.error("Errore nell'eliminazione della card:", error);
    }
    */
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
    ? "w-24 bg-gray-500 text-white p-2 shadow-md rounded hover:bg-gray-600"
    : "w-24 bg-blue-500 text-white p-2 shadow-md rounded hover:bg-blue-600";

  return (
    <div className="border-2 border-black rounded-xl shadow-lg w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6 h-[14rem] flex flex-col relative bg-gray-100">
      <button
        className="absolute flex justify-center items-center top-0 right-0 -mt-2.5 -mr-2.5 w-6 h-6 bg-red-500 text-white shadow-md rounded-full hover:bg-red-600"
        onClick={handleDelete}
      >
        <span className="text-xs font-bold">X</span>
      </button>
      <p className={`text-center font-bold text-md break-all`}>{description}</p>
      <span className="flex-grow text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl">
        {hours > 0
          ? `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`
          : `${formatTime(minutes)}:${formatTime(seconds)}`}
      </span>
      {!stop && (
        <button
          className={`absolute bottom-0 right-0 mb-2 mr-2 font-semibold ${buttonClass}`}
          onClick={handleRunning}
        >
          {isTimerRunning ? "PAUSE" : "START"}
        </button>
      )}

      {!stop && (
        <button
          className="absolute bottom-0 left-0 mb-2 ml-2 font-semibold w-24 bg-red-500 text-white p-2 shadow-md rounded hover:bg-red-600"
          onClick={handleStop}
        >
          STOP
        </button>
      )}

      {stop && (
        <p className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 text-sm text-gray-500">
          {created}
        </p>
      )}
    </div>
  );
}

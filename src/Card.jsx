import { useState, useEffect, useRef } from "react";
import { useTimer } from "./hooks/useTimer.js";

export default function Card({
  deleteCard,
  getTime,
  card,
  activeCardId,
  setActiveCardId,
}) {
  const { id, description, created, isRunning, time, stopped, urgency } = card;

  const [isTimerRunning, setIsTimerRunning] = useState(isRunning);
  const elapsedTime = useTimer(isTimerRunning, time);
  const [stop, setStop] = useState(stopped);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState(urgency);

  const dropdownRef = useRef(null);

  const seconds = Math.floor(elapsedTime % 60);
  const minutes = Math.floor((elapsedTime / 60) % 60);
  const hours = Math.floor(elapsedTime / 3600);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  const handleRunning = () => {
    if (!isTimerRunning) {
      if (activeCardId && activeCardId !== id) {
        return;
      }
      setActiveCardId(id);
    } else {
      handleTime();
      setActiveCardId(null);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const updateStoppedStatus = async (stopped) => {
    try {
      await fetch(import.meta.env.VITE_DATABASE_HTTP + "/api/updateStatus", {
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

  const handleUrgencyChange = async (newUrgency) => {
    const url = import.meta.env.VITE_DATABASE_HTTP + `/api/updateUrgency`;
    const data = { id, urgency: newUrgency };
    setSelectedUrgency(newUrgency);
    setIsDropdownOpen(false);

    try {
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(error);
    }
  };

  function handleTime() {
    getTime(id, elapsedTime, false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const buttonClass =
    activeCardId && activeCardId !== id
      ? "w-20 bg-gray-300 text-white px-2 py-1.5 shadow-md rounded cursor-not-allowed"
      : isTimerRunning
      ? "w-20 bg-gray-500 text-white px-2 py-1.5 shadow-md rounded hover:bg-gray-600"
      : "w-20 bg-blue-500 text-white px-2 py-1.5 shadow-md rounded hover:bg-blue-600";

  const urgencyClass =
    selectedUrgency === "Low"
      ? "bg-green-300 text-green-800"
      : selectedUrgency === "Normal"
      ? "bg-yellow-300 text-yellow-800"
      : "bg-red-300 text-red-800";

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="border border-gray-300 p-3">
          <p className="font-bold text-xl break-all">{description}</p>
        </td>
        <td className="border border-gray-300 font-semibold p-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`text-md ${urgencyClass} rounded-xl py-0.5 px-1.5`}
            >
              {selectedUrgency}
            </button>
            {isDropdownOpen && !stop && (
              <div className="absolute mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleUrgencyChange("Low")}
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Low
                  </button>
                  <button
                    onClick={() => handleUrgencyChange("Normal")}
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => handleUrgencyChange("High")}
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    High
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
        <td className="border border-gray-300 p-3">
          <span className="flex-grow text-center text-md sm:text-xl md:text-2xl lg:text-3xl">
            {hours > 0
              ? `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(
                  seconds
                )}`
              : `${formatTime(minutes)}:${formatTime(seconds)}`}
          </span>
        </td>
        <td className="border border-gray-300 p-3 font-semibold">{created}</td>
        <td className="border border-gray-300 p-3 w-[200px]">
          <div className="w-full flex justify-center">
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
                  Finish
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

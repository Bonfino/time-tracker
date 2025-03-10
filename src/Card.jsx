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
    if (activeCardId && activeCardId !== id) {
      return;
    }
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

  const urgencyClass =
    selectedUrgency === "Low"
      ? "bg-green-300 text-green-800"
      : selectedUrgency === "Normal"
      ? "bg-yellow-300 text-yellow-800"
      : "bg-red-300 text-red-800";

  const activeClass =
    activeCardId && activeCardId === id ? "border-2 border-blue-500" : "";

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors duration-150 ${activeClass}`}
    >
      <td className="px-6 py-4">
        <p className="font-medium text-gray-900 break-all">{description}</p>
      </td>
      <td className="px-6 py-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`text-sm font-medium ${urgencyClass} rounded-full py-1 px-3 transition-colors duration-200`}
          >
            {selectedUrgency}
          </button>
          {isDropdownOpen && !stop && (
            <div
              className="fixed transform -translate-x-1/2 mt-2 w-32 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100]"
              style={{
                top: dropdownRef.current?.getBoundingClientRect().bottom + 5,
                left:
                  dropdownRef.current?.getBoundingClientRect().left +
                  dropdownRef.current?.offsetWidth / 2,
              }}
            >
              <div className="py-1">
                <button
                  onClick={() => handleUrgencyChange("Low")}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 text-left first:rounded-t-lg"
                >
                  Low
                </button>
                <button
                  onClick={() => handleUrgencyChange("Normal")}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 text-left"
                >
                  Normal
                </button>
                <button
                  onClick={() => handleUrgencyChange("High")}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 text-left last:rounded-b-lg"
                >
                  High
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-lg font-mono font-medium text-gray-900">
          {hours > 0
            ? `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(
                seconds
              )}`
            : `${formatTime(minutes)}:${formatTime(seconds)}`}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{created}</td>
      <td className="px-6 py-4">
        <div className="flex justify-start gap-2">
          {stop ? (
            <button
              onClick={handleDelete}
              className="px-4 py-1.5 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition-colors duration-200"
            >
              Delete
            </button>
          ) : (
            <>
              <button
                className={`px-4 py-1.5 rounded-md shadow-sm transition-colors duration-200 ${
                  activeCardId && activeCardId !== id
                    ? "bg-gray-300 cursor-not-allowed"
                    : isTimerRunning
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                onClick={handleRunning}
              >
                {isTimerRunning ? "Pause" : "Start"}
              </button>
              <button
                className={`px-4 py-1.5 rounded-md shadow-sm transition-colors duration-200 ${
                  activeCardId && activeCardId !== id
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
                onClick={handleStop}
              >
                Finish
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

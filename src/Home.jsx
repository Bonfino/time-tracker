import { useEffect, useState } from "react";
import Card from "./Card.jsx";

export default function Home() {
  const [inputDesc, setInputDesc] = useState("");
  const [cards, setCards] = useState([]);
  const [activeCardId, setActiveCardId] = useState(null);

  const handleSubmitted = (e) => {
    e.preventDefault();
    const date = new Date();
    const formattedDate = `${date.toLocaleDateString()}  ${date.getHours()}:${date.getMinutes()}`;
    if (inputDesc.trim().length !== 0) {
      const newCard = {
        id: Date.now(),
        description: inputDesc,
        created: formattedDate,
        isRunning: false,
        urgency: "Low",
        time: 0,
        stopped: false,
      };
      addCard(newCard);
      setInputDesc("");
    }
  };

  async function fetchCards() {
    const url = import.meta.env.VITE_DATABASE_HTTP + "/api/getcards";

    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) {
        const json = await response.json();

        if (Array.isArray(json)) {
          const sortedCards = json.sort(
            (a, b) => new Date(b.created) - new Date(a.created)
          );
          setCards(sortedCards);
        } else {
          console.error("Expected an array but got:", json);
          setCards([]);
        }
      } else {
        console.error("Response not OK:", response.status);
        setCards([]);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      setCards([]);
    }
  }

  const getTime = async (id, elapsedTime, isRunning) => {
    const url = import.meta.env.VITE_DATABASE_HTTP + "/api/updateStatus";
    const data = { id, time: elapsedTime, isRunning };

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, time: elapsedTime, isRunning } : card
      )
    );

    if (!isRunning) {
      setActiveCardId(null);
    }

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addCard = async (newCard) => {
    const url = import.meta.env.VITE_DATABASE_HTTP + "/api/add";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCard),
      });
      if (!response.ok) {
        console.error("Error while adding the card: ", error);
      } else {
        setCards((prevCards) => {
          const updatedCards = [...prevCards, newCard];
          return updatedCards.sort(
            (a, b) => new Date(b.created) - new Date(a.created)
          );
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteCard = (id) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const sortedCards = [...cards].sort((a, b) => {
    if (a.id === activeCardId) return -1;
    if (b.id === activeCardId) return 1;

    return new Date(b.created) - new Date(a.created);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Task Timer
          </h1>
          <form
            className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg"
            onSubmit={handleSubmitted}
          >
            <div className="flex gap-4">
              <input
                type="text"
                onChange={(e) => setInputDesc(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What are you working on?"
                value={inputDesc}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors duration-200"
              >
                Create
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Task
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Urgency
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Time spent
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedCards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  deleteCard={deleteCard}
                  getTime={getTime}
                  activeCardId={activeCardId}
                  setActiveCardId={setActiveCardId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

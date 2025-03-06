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

  return (
    <>
      <div className="flex justify-center mt-5">
        <form
          className="border border-black p-5 rounded shadow-md w-1/2 flex justify-between align-center relative"
          onSubmit={handleSubmitted}
        >
          <input
            type="text"
            onChange={(e) => setInputDesc(e.target.value)}
            className="pl-2 w-4/5 focus:outline-none"
            placeholder="What are you working on?"
            value={inputDesc}
          />
          <div>
            <button
              type="submit"
              className="w-24 bg-green-500 text-white p-2 shadow-md rounded hover:bg-green-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-center mt-5">
        <table className="w-4/5 border-collapse border border-gray-300 rounded shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-3 text-left">Task</th>
              <th className="border border-gray-300 p-3 text-left">Urgency</th>
              <th className="border border-gray-300 p-3 text-left">
                Time spent
              </th>
              <th className="border border-gray-300 p-3 text-left">Date</th>
              <th className="border border-gray-300 p-3 text-left">Manage</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
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
    </>
  );
}

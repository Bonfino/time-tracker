import { useEffect, useState } from "react";
import Card from "./Card.jsx";

export default function Home() {
  const [inputDesc, setInputDesc] = useState("");
  const [cards, setCards] = useState([]);

  const handleSubmitted = (e) => {
    e.preventDefault();
    const date = new Date();
    const formattedDate = date.toLocaleDateString();
    if (inputDesc.trim().length !== 0) {
      const newCard = {
        id: Date.now(),
        description: inputDesc,
        created: formattedDate,
        isRunning: true,
        time: 0,
        stopped: false,
      };
      setCards((prevCards) => [...prevCards, newCard]);
      addCard(newCard);
      setInputDesc("");
    }
  };

  /*
  const fetchCards = async () => {
    axios
      .get(import.meta.env.VITE_DATABASE_HTTP + "/api/getcards")
      .then((response) => {
        if (response.data.message !== "No cards found") {
          setCards(response.data);
        } else console.log(response.data);
      })
      .catch((error) => console.error(error));
  };
  */

  async function fetchCards() {
    const url = import.meta.env.VITE_DATABASE_HTTP + "/api/getcards";

    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) {
        const json = await response.json();

        if (Array.isArray(json)) {
          setCards(json);
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

  const getTime = async (id, elapsedTime) => {
    const url = import.meta.env.VITE_DATABASE_HTTP + "/api/update";
    const data = { id, time: elapsedTime };

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, time: elapsedTime } : card
      )
    );

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

      const result = await response.json();
      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error);
    }

    /*
    try {
      await axios.put(import.meta.env.VITE_DATABASE_HTTP + "/api/update", {
        id,
        time: elapsedTime,
      });
    } catch (error) {
      console.error(error);
    }
    */
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
      }
    } catch (error) {
      console.error("Error:", error);
    }

    /*
    try {
      await axios.post(
        import.meta.env.VITE_DATABASE_HTTP + "/api/add",
        newCard
      );
    } catch (error) {
      console.error("Errore nell'aggiunta della card:", error);
    }
    */
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
          className="border border-black p-5 rounded shadow-md w-3/5 flex justify-between align-center relative"
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
              CREATE
            </button>
          </div>
        </form>
      </div>
      <div className="flex justify-center items-start mt-10 p-10 flex-wrap gap-4">
        {cards.map((card, index) => (
          <Card
            key={index}
            id={card.id}
            description={card.description}
            created={card.created}
            isRunning={card.isRunning}
            time={card.time}
            stopped={card.stopped}
            deleteCard={deleteCard}
            getTime={getTime}
          />
        ))}
      </div>
    </>
  );
}

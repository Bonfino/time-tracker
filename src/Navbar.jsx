import "./Navbar.css";

export default function Navbar() {
  let date = new Date();

  return (
    <header className="p-6 bg-[#1b263b] relative bg-gradient-to-r from-[#1D2D44] to-[#0D1321]">
      <ul className="list-none flex flex-row justify-between">
        <li className="item-list font-semibold text-xl">Trackify</li>
        <li className="item-list">{date.toLocaleDateString()}</li>
      </ul>
    </header>
  );
}

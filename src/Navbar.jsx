import "./Navbar.css";

export default function Navbar() {

  return (
    <header className="navbar">
      <div className="item-list">
        <a href="#" className="nav-brand">
          <img src=".\src\assets\hourglass.png" alt="Logo" /> Trackify
        </a>
        <nav className="nav-menu">
          <a href="#" className="nav-link">
            Home
          </a>
          <a href="#" className="nav-link">
            About
          </a>
        </nav>
      </div>
    </header>
  );
}

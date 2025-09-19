import React from "react";
import "../styles/floating-icon.css";

const FloatingIcon = () => {
  // Root link to your homepage
  const homepage = "https://shar23d.github.io/portfolio/"; // works for React SPA

  return (
    <>
      <a
        href={homepage}
        target="_blank"
        className="floating-icon"
        aria-describedby="homeTooltip"
      >
        <img src="./public/floating-icon.jpeg" alt="Portfolio Home" />
      </a>
      <div role="tooltip" id="homeTooltip" className="floating-tooltip">
        Explore more projects
      </div>
    </>
  );
};

export default FloatingIcon;

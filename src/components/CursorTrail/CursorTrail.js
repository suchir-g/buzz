import React, { useEffect } from "react";
import "./CursorTrail.css";
const FlyingLettersComponent = () => {
  useEffect(() => {
    const createFlyingLetter = (posX, posY) => {
      const letter = String.fromCharCode(
        Math.random() < 0.5
          ? Math.floor(Math.random() * 26) + 97
          : Math.floor(Math.random() * 26) + 65
      );
      const flyingLetter = document.createElement("span");
      flyingLetter.innerText = letter;

      const colors = ["#710000", "#a63c06", "#c36f09", "#eeba0b", "#f4e409"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      flyingLetter.classList.add("flying-letter");
      flyingLetter.style.left = `${posX}px`;
      flyingLetter.style.top = `${posY}px`;
      flyingLetter.style.color = randomColor;

      const rotation = Math.random() * 360;
      flyingLetter.style.transform = `rotate(${rotation}deg)`;

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const endX = posX + distance * Math.cos(angle);
      const endY = posY + distance * Math.sin(angle);

      flyingLetter.animate(
        [
          { transform: "translate(0, 0)", opacity: 1 },
          {
            transform: `translate(${endX - posX}px, ${
              endY - posY
            }px) rotate(${rotation}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1000,
          easing: "ease-out",
          fill: "forwards",
        }
      );

      document.body.appendChild(flyingLetter);

      flyingLetter.onanimationend = () => flyingLetter.remove();
    };

    const handleMouseMove = (event) => {
      const posX = event.clientX;
      const posY = event.clientY;
      createFlyingLetter(posX, posY);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return null;
};

export default FlyingLettersComponent;

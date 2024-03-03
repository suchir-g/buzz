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
      flyingLetter.style.color = randomColor; // Apply the random color

      // Random rotation
      const rotation = Math.random() * 360; // Random angle between 0 and 360 degrees
      flyingLetter.style.transform = `rotate(${rotation}deg)`;

      const angle = Math.random() * Math.PI * 2; // Random angle
      const distance = Math.random() * 100 + 50; // Random distance
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
          duration: 1000, // Animation duration
          easing: "ease-out",
          fill: "forwards", // Keep the final state after animation
        }
      );

      document.body.appendChild(flyingLetter);

      // Remove the element after animation
      flyingLetter.onanimationend = () => flyingLetter.remove();
    };

    const handleMouseMove = (event) => {
      const posX = event.clientX;
      const posY = event.clientY;
      createFlyingLetter(posX, posY); // Replace 'A' with the desired letter
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []); // Empty dependency array ensures this effect only runs once

  return null; // Since this component only deals with side effects, return null
};

export default FlyingLettersComponent;

import React, { useState, useEffect } from "react";
import "./SpellingBeeComponent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

const SpellingBeeComponent = () => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentDefinition, setCurrentDefinition] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [inputClass, setInputClass] = useState("");
  const [showCorrectSpelling, setShowCorrectSpelling] = useState(false);
  const [mode, setMode] = useState("hardWords");

  const modeOptions = [
    { value: "hardWords", text: "Hard Words", fileUrl: "/hardWords.txt" },
    { value: "SATWords", text: "SAT Words", fileUrl: "/wordsSAT.txt" },
    { value: "easyWords", text: "Easy Words", fileUrl: "/easyWords.txt" },
  ];

  useEffect(() => {
    fetchWords();
  }, [mode]);

  const fetchWords = async () => {
    const modeSetting = modeOptions.find((option) => option.value === mode);
    try {
      const response = await fetch(modeSetting.fileUrl);
      const text = await response.text();
      const wordList = text.split("\n").filter(Boolean);
      setWords(wordList);
      selectRandomWordAndFetchDetails(wordList);
    } catch (error) {
      console.error("Error fetching word list:", error);
    }
  };

  const selectRandomWordAndFetchDetails = async (wordList) => {
    if (wordList.length > 0) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      let selectedWord, definition;

      if (mode === "SATWords") {
        const line = wordList[randomIndex];
        const firstSpaceIndex = line.indexOf(" ");
        selectedWord = line.substring(0, firstSpaceIndex).trim();
        definition = line.substring(line.indexOf("-") + 1).trim();
        setCurrentWord(selectedWord);
        setCurrentDefinition(definition);
      } else {
        selectedWord = wordList[randomIndex];
        setCurrentWord(selectedWord);
        setCurrentDefinition("");
      }

      await fetchAudioAndDefinitionFromAPI(selectedWord);
    }
  };

  const fetchAudioAndDefinitionFromAPI = async (word) => {
    console.log(word);

    const apiKey = "7fba8d8c-03a2-486e-87d8-0fcfac59cc87";
    const apiUrl = `https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data && data.length > 0 && data[0].hwi) {
        if (mode !== "SATWords" && data[0].shortdef) {
          const definition = data[0].shortdef[0];
          setCurrentDefinition(definition);
        }

        const prsWithAudio = data[0].hwi.prs.find(
          (pr) => pr.sound && pr.sound.audio
        );
        if (prsWithAudio) {
          const audioFileName = prsWithAudio.sound.audio;
          const subdirectory = audioFileName.startsWith("bix")
            ? "bix"
            : audioFileName.startsWith("gg")
            ? "gg"
            : audioFileName.match(/^[0-9]/)
            ? "number"
            : audioFileName.charAt(0);
          const newAudioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdirectory}/${audioFileName}.mp3`;
          setAudioUrl(newAudioUrl);
        } else {
          console.error("No audio file found for the selected word.");
          setAudioUrl("");
        }
      } else {
        console.error("No data found for the selected word.");
        setAudioUrl("");
        if (mode !== "SATWords") {
          setCurrentDefinition("No definition found.");
        }
      }
    } catch (error) {
      console.error("Error fetching details from API:", error);
      setAudioUrl("");
      if (mode !== "SATWords") {
        setCurrentDefinition("Error fetching definition.");
      }
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkWord();
  };

  const checkWord = () => {
    const trimmedUserInput = userInput.trim().toLowerCase();
    const trimmedCurrentWord = currentWord.trim().toLowerCase();

    const isWordCorrect = trimmedUserInput === trimmedCurrentWord;
    setIsCorrect(isWordCorrect);
    setInputClass(isWordCorrect ? "inputFlashGreen" : "inputShake");

    setTimeout(() => setInputClass(""), isWordCorrect ? 2000 : 500);
    setShowCorrectSpelling(!isWordCorrect);
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      // Set a delay of 1000 milliseconds (1 second) before playing the audio
      setTimeout(() => {
        audio.play().catch((e) => console.error("Error playing audio:", e));
      }, 1000); // You can adjust the delay time as needed
    }
  };

  const handleNextWord = () => {
    setUserInput("");
    setIsCorrect(null);
    setShowCorrectSpelling(false);
    selectRandomWordAndFetchDetails(words);
  };

  return (
    <div
      className="spelling-bee-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
      id="honeycomb"
    >
      <img src="/largerbee.png" alt="Bee icon" className="icon" />
      <h1 className="title">Spelling Bee Practice</h1>
      <div>
        <label htmlFor="mode-select">Choose a mode:</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="select-style"
        >
          {modeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={playAudio}
        disabled={!audioUrl}
        style={{ margin: "10px 0" }}
      >
        🔊 Listen
      </button>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Type the spelling here"
          className={inputClass}
        />
        <br />
      </form>
      {isCorrect === false && (
        <>
          <button onClick={handleNextWord} style={{ margin: "10px 0" }}>
            Try Next Word
          </button>
          {showCorrectSpelling && (
            <p style={{ marginTop: "20px" }}>Correct spelling: {currentWord}</p>
          )}
        </>
      )}
      {isCorrect && (
        <button onClick={handleNextWord} style={{ margin: "10px 0" }}>
          Next Word
        </button>
      )}
      <p style={{ marginTop: "20px" }}>Definition: {currentDefinition}</p>
      <div
        style={{ position: "absolute", bottom: "20px", textAlign: "center" }}
      >
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "24px" }}>
          Contact me
        </p>
        <a
          href="https://www.instagram.com/suchir.gup/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faInstagram}
            size="2x"
            style={{ margin: "0 10px" }}
            color="grey"
            className="iconBottom"
          />
        </a>
        <a href="mailto:18sgupta@heckgrammar.co.uk">
          <FontAwesomeIcon
            icon={faEnvelope}
            size="2x"
            style={{ margin: "0 10px" }}
            color="grey"
            className="iconBottom"
          />
        </a>
      </div>
    </div>
  );
};

export default SpellingBeeComponent;

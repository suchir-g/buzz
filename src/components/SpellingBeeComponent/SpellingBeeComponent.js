import React, { useState, useEffect } from "react";
import "./SpellingBeeComponent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // In SAT mode, each line is "word - definition"
        const line = wordList[randomIndex];
        const firstSpaceIndex = line.indexOf(" ");
        selectedWord = line.substring(0, firstSpaceIndex).trim();
        definition = line.substring(line.indexOf("-") + 1).trim();
        setCurrentWord(selectedWord);
        setCurrentDefinition(definition);
      } else {
        // Hard/easy words only have the word in the file
        selectedWord = wordList[randomIndex];
        setCurrentWord(selectedWord);
        setCurrentDefinition("");
      }

      await fetchAudioAndDefinitionFromAPI(selectedWord);
    }
  };

  const fetchAudioAndDefinitionFromAPI = async (word) => {
    console.log("Fetching definition for:", word);

    const apiKey = "7fba8d8c-03a2-486e-87d8-0fcfac59cc87";
    const apiUrl = `https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      // If we got a valid response with "hwi", attempt to gather definition/audio
      if (data && data.length > 0 && data[0].hwi) {
        // For non-SAT modes, we rely on the dictionary definition
        if (mode !== "SATWords") {
          // If there's no shortdef, treat as "no definition found" => pick new word
          if (!data[0].shortdef || data[0].shortdef.length === 0) {
            console.error("No definition found, auto-loading next word...");
            selectRandomWordAndFetchDetails(words);
            return;
          } else {
            setCurrentDefinition(data[0].shortdef[0]);
          }
        }

        // Audio
        const prsWithAudio = data[0].hwi.prs?.find(
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
        // If we didn't get the data we need, auto-load another
        console.error("Invalid data, auto-loading next word...");
        selectRandomWordAndFetchDetails(words);
      }
    } catch (error) {
      console.error("Error fetching details from API:", error);
      // Also auto-load another word on error
      selectRandomWordAndFetchDetails(words);
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

    // Show the shaking/green animation briefly
    setTimeout(() => setInputClass(""), isWordCorrect ? 2000 : 500);

    // If incorrect, show the correct spelling
    setShowCorrectSpelling(!isWordCorrect);
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      // Optional short delay
      setTimeout(() => {
        audio.play().catch((err) => console.error("Error playing audio:", err));
      }, 500);
    }
  };

  const handleNextWord = () => {
    setUserInput("");
    setIsCorrect(null);
    setShowCorrectSpelling(false);
    selectRandomWordAndFetchDetails(words);
  };

  return (
    <div className="spelling-bee-container" id="honeycomb">
      <img src="/largerbee.png" alt="Bee icon" className="icon" />
      <h1 className="title">Spelling Bee Practice</h1>

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

      <button onClick={playAudio} disabled={!audioUrl}>
        🔊 Listen
      </button>

      <form onSubmit={handleSubmit} className="form-style">
        <div className="input-row">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type the spelling here"
            className={inputClass}
          />

          {/* Bright yellow icon button for submit (paper plane) */}
          <button type="submit" className="submit-button">
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </form>

      {isCorrect === false && (
        <>
          <button onClick={handleNextWord}>Try Next Word</button>
          {showCorrectSpelling && (
            <p className="definition-style">
              Correct spelling: <strong>{currentWord}</strong>
            </p>
          )}
        </>
      )}

      {isCorrect && <button onClick={handleNextWord}>Next Word</button>}

      <p className="definition-style">Definition: {currentDefinition}</p>

      <div className="contact-section">
        <p className="contact-text">Contact me</p>
        <a
          href="https://www.instagram.com/suchir.gup/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faInstagram}
            size="2x"
            className="iconBottom"
          />
        </a>
        <a href="mailto:18sgupta@heckgrammar.co.uk">
          <FontAwesomeIcon icon={faEnvelope} size="2x" className="iconBottom" />
        </a>
      </div>
    </div>
  );
};

export default SpellingBeeComponent;

"use client";
import { Coming_Soon } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";

const WORD_LIST_API_URL = 'https://api.frontendexpert.io/api/fe/wordle-words';

export default function Home() {
  const [todaysWord, setTodaysWord] = useState("");
  const [wordMap, setWordMap] = useState(new Map())
  const [guesses, addGuess] = useState([]);
  const [numberOfGuesses, incrementGuess] = useState(0);
  const [currentGuess, changeGuess] = useState("");
  const [currentLineIndex, incrementIndex] = useState(0);
  const [currentCharIndex, incrementCharIndex] = useState(0);
  const [board, editBoard] = useState([[]]);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    setTodaysWord("audio");
    var letterMap = new Map();

    for (let i = 0; i < todaysWord.length; i++) {
      letterMap.set(todaysWord[i], true);
    }
    setWordMap(letterMap);
  }, [todaysWord]);

  useEffect(() => {

    const blankBoard = []

    for (let i = 0; i < 6; i++) {
      var line = []
      for (let j = 0; j < 5; j++) {
        line.push({ letter: "", className: "", innerDiv: "" });
      }
      blankBoard.push(line);
    }

    editBoard(blankBoard);
  }, [])

  useEffect(() => {
    document.addEventListener("keyup", handleKeyDown);
    return () => {
      document.removeEventListener("keyup", handleKeyDown);
    };
  }, [currentGuess]);

  function handleKeyDown(event) {

    if (gameFinished) { return; }

    if (
      !/^[a-zA-Z]+$/.test(event.key) ||
      ["CapsLock", " ", "Escape", "Shift", "Control", "ContextMenu", "Alt", "MediaPlayPause", "MediaTrackNext", "MediaTrackPrevious", "MediaStop", "AudioVolumeUp", "AudioVolumeDown"].includes(event.key)
    ) {
      console.log("Illegal character");
      return;
    }

    if (event.key === "Backspace") {

      if (currentCharIndex == 0) { return; }

      editBoard(prevBoard => {
        const newBoard = [...prevBoard];
        newBoard[currentLineIndex][currentCharIndex - 1].letter = "";
        return newBoard;
      });
      incrementCharIndex(prevCharIndex => prevCharIndex - 1);
      changeGuess(oldGuess => oldGuess.slice(0, -1));


      return;
    }

    if (event.key === "Enter") {
      if (currentGuess.length != 5)
        return;

      submitGuess();
      incrementIndex(prevIndex => prevIndex + 1);
      console.log("Currrent line: ", currentLineIndex)
      incrementCharIndex(0);
      changeGuess("");
      return;
    }

    if (currentGuess.length >= 5) {
      console.log("Length greater than 5");
      return;
    }

    editBoard(prevBoard => {
      const newBoard = [...prevBoard];
      newBoard[currentLineIndex][currentCharIndex].letter = event.key;
      return newBoard;
    });
    incrementCharIndex(prevCharIndex => prevCharIndex + 1);
    changeGuess(oldGuess => oldGuess + event.key);
  }

  function submitGuess() {

    if (numberOfGuesses == 6) {
      console.log("Maximum number of guesses reached");
      return;
    }

    incrementGuess(prevNumGuesses => prevNumGuesses + 1)
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        editBoard(prevBoard => {
          const newBoard = [...prevBoard];
          newBoard[currentLineIndex][i].innerDiv = "tile-content";
          var correctness = "incorrect";

          if (wordMap.has(newBoard[currentLineIndex][i].letter.toLowerCase())) {
            console.log("Letter is in map");
            correctness = "almost-correct"
          }

          if (newBoard[currentLineIndex][i].letter === todaysWord[i]) {
            correctness = "correct"
          }

          newBoard[currentLineIndex][i].className = ` ${correctness} flip`;

          return newBoard;
        });
      }, 400 * i);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 text-white bg-black">
      <div>
        {board.map((line, lineIndex) => (
          <div key={lineIndex} className="board-line">
            {line.map((tile, charIndex) => (
              <div key={charIndex} className={`tile ${tile.className}`}>
                <div className={tile.innerDiv}>
                  {tile.letter}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

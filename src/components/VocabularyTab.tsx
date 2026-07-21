/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { VocabularyWord, SYLLABUS_DATA } from "../types";
import { speakBritish, stopAllSpeech } from "../lib/speech";
import { Volume2, HelpCircle, Check, AlertCircle, Sparkles, Trophy, ArrowRight, RefreshCw, Gamepad2, Award, BookOpen, CheckCircle2 } from "lucide-react";

interface VocabularyTabProps {
  vocabulary: VocabularyWord[];
  unitId: string;
  onAwardStars: (count: number) => void;
  onSaveAssessment: (score: number) => void;
}

type TabMode = "flashcards" | "practice_quiz" | "test_challenge" | "memory_match";
type QuizType = "whats_missing" | "scrambled" | "listening";

interface MemoryCard {
  id: string;
  content: string;
  type: "word" | "emoji";
  wordValue: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const VocabularyTab: React.FC<VocabularyTabProps> = ({
  vocabulary,
  unitId,
  onAwardStars,
  onSaveAssessment
}) => {
  const currentUnitObj = SYLLABUS_DATA.find((u) => u.id === unitId);

  // Navigation Mode state
  const [mode, setMode] = useState<TabMode>("flashcards");

  // 1. FLASHCARDS STATE
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Reset card index when unit or vocabulary changes to prevent out of bounds crashes
  useEffect(() => {
    setCardIndex(0);
    setRevealed(false);
  }, [unitId, vocabulary]);

  // Cancel any active speech when switching tabs or study modes
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, [mode, unitId]);

  // 2. QUIZ/PRACTICE STATE
  const [quizType, setQuizType] = useState<QuizType>("whats_missing");
  const [quizWord, setQuizWord] = useState<VocabularyWord | null>(null);
  const [missingChar, setMissingChar] = useState("");
  const [whatsMissingWord, setWhatsMissingWord] = useState("");
  const [whatsMissingOptions, setWhatsMissingOptions] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [scrambledSelected, setScrambledSelected] = useState<string[]>([]);
  const [listeningOptions, setListeningOptions] = useState<VocabularyWord[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 3. TEST CHALLENGE STATE (5 QUESTIONS)
  const [testActive, setTestActive] = useState(false);
  const [testQuestionIndex, setTestQuestionIndex] = useState(0);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [testCorrectCount, setTestCorrectCount] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedMatchWord, setSelectedMatchWord] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [failedMatchAttempt, setFailedMatchAttempt] = useState(false);

  // 4. MEMORY MATCH STATE
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchPairsFound, setMatchPairsFound] = useState(0);
  const [matchTimer, setMatchTimer] = useState(30);
  const [matchActive, setMatchActive] = useState(false);
  const [matchCompleted, setMatchCompleted] = useState(false);
  const [matchVictory, setMatchVictory] = useState(false);
  const timerRef = useRef<any>(null);

  // Speech Helper
  const playAudio = (text: string) => {
    speakBritish(text, 0.82);
  };

  const playSuccessSound = () => speakBritish("Great job!", 1.1);
  const playTryAgainSound = () => speakBritish("Try again!", 0.95);

  // Auto clean speech synthesis
  useEffect(() => {
    return () => {
      stopAllSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Set up quiz word when vocabulary or quiz type changes
  useEffect(() => {
    generateNewQuizQuestion();
  }, [quizType, vocabulary, unitId, mode]);

  const generateNewQuizQuestion = () => {
    if (!vocabulary || vocabulary.length === 0) return;
    setIsAnswered(false);
    setIsCorrect(false);
    
    const randWordObj = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    setQuizWord(randWordObj);

    setupQuizDataForWord(randWordObj, quizType);
  };

  const setupQuizDataForWord = (wordObj: VocabularyWord, type: QuizType) => {
    const word = wordObj.word.toLowerCase();
    
    if (type === "whats_missing") {
      let replaceIdx = -1;
      const validIndices: number[] = [];
      for (let i = 0; i < word.length; i++) {
        if (word[i] >= "a" && word[i] <= "z") validIndices.push(i);
      }
      if (validIndices.length > 0) {
        replaceIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
      }

      if (replaceIdx !== -1) {
        const char = word[replaceIdx];
        setMissingChar(char);
        const masked = word.substring(0, replaceIdx) + "_" + word.substring(replaceIdx + 1);
        setWhatsMissingWord(masked);

        const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
        const wrongOpts = alphabet.filter(c => c !== char);
        const selectedWrong = wrongOpts.sort(() => 0.5 - Math.random()).slice(0, 3);
        const allOpts = [...selectedWrong, char].sort(() => 0.5 - Math.random());
        setWhatsMissingOptions(allOpts);
      }
    } else if (type === "scrambled") {
      const strippedWord = word.replace(/\s+/g, "");
      const letters = strippedWord.split("").sort(() => 0.5 - Math.random());
      setScrambledLetters(letters);
      setScrambledSelected([]);
    } else if (type === "listening") {
      const wrongOpts = vocabulary.filter(v => v.word !== wordObj.word);
      const shuffledWrong = wrongOpts.sort(() => 0.5 - Math.random()).slice(0, 2);
      const opts = [...shuffledWrong, wordObj].sort(() => 0.5 - Math.random());
      setListeningOptions(opts);
    }
  };

  // QUIZ PRACTICE HANDLERS
  const handleMissingOptionClick = (char: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    if (char === missingChar) {
      setIsCorrect(true);
      onAwardStars(1);
      playSuccessSound();
    } else {
      setIsCorrect(false);
      playTryAgainSound();
    }
  };

  const handleScrambleTileClick = (letter: string, index: number) => {
    if (isAnswered) return;
    
    const newSelected = [...scrambledSelected, letter];
    setScrambledSelected(newSelected);
    
    const newChoices = [...scrambledLetters];
    newChoices.splice(index, 1);
    setScrambledLetters(newChoices);

    if (newChoices.length === 0 && quizWord) {
      const targetWord = quizWord.word.toLowerCase().replace(/\s+/g, "");
      const finalWord = newSelected.join("");
      const isWordCorrect = finalWord === targetWord;
      
      if (testActive) {
        handleTestAnswerClick(isWordCorrect);
      } else {
        setIsAnswered(true);
        setIsCorrect(isWordCorrect);
        if (isWordCorrect) {
          onAwardStars(2);
          playSuccessSound();
        } else {
          playTryAgainSound();
        }
      }
    }
  };

  const handleResetScramble = () => {
    if (!quizWord) return;
    setIsAnswered(false);
    setIsCorrect(false);
    setupQuizDataForWord(quizWord, "scrambled");
  };

  const handleListeningMatchClick = (option: VocabularyWord) => {
    if (isAnswered) return;
    setIsAnswered(true);
    if (option.word === quizWord?.word) {
      setIsCorrect(true);
      onAwardStars(1);
      playSuccessSound();
    } else {
      setIsCorrect(false);
      playTryAgainSound();
    }
  };

  // ===================== 3. TEST CHALLENGE LOGIC =====================
  const startTestChallenge = () => {
    if (!vocabulary || vocabulary.length === 0) return;

    // We need to generate 5 random questions using our 5 interactive types
    const questionTypes = [
      "picture_to_word",
      "word_to_picture",
      "odd_one_out",
      "category_grouping",
      "match_pairs"
    ];

    // Get list of other vocabulary words (from other units)
    const currentUnitObj = SYLLABUS_DATA.find((u) => u.id === unitId);
    const otherUnits = SYLLABUS_DATA.filter((u) => u.id !== unitId);
    const otherVocab = otherUnits.flatMap((u) => u.vocabulary);

    const newQuestions: any[] = [];

    // Let's generate 5 questions
    for (let i = 0; i < 5; i++) {
      const type = questionTypes[i % questionTypes.length];
      
      if (type === "picture_to_word" || type === "word_to_picture") {
        // Pick a random word from the current unit
        const targetWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        // Get 3 distractors
        const otherWordsInUnit = vocabulary.filter(w => w.word !== targetWord.word);
        const distractors = otherWordsInUnit.sort(() => 0.5 - Math.random()).slice(0, 3);
        // Fill from other units if not enough words
        while (distractors.length < 3) {
          const randDist = otherVocab[Math.floor(Math.random() * otherVocab.length)];
          if (!distractors.find(d => d.word === randDist.word) && randDist.word !== targetWord.word) {
            distractors.push(randDist);
          }
        }
        const options = [...distractors, targetWord].sort(() => 0.5 - Math.random());
        newQuestions.push({
          type,
          word: targetWord,
          options
        });
      } else if (type === "odd_one_out") {
        // Odd one out: 3 words from current unit, 1 from another unit
        const currentWords = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 3);
        const oddWord = otherVocab.sort(() => 0.5 - Math.random()).find(w => !vocabulary.find(vw => vw.word === w.word));
        
        if (oddWord) {
          const options = [...currentWords, oddWord].sort(() => 0.5 - Math.random());
          newQuestions.push({
            type,
            options,
            word: oddWord // The odd one out is the target (correct answer)
          });
        } else {
          // Fallback to picture_to_word
          const targetWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
          newQuestions.push({
            type: "picture_to_word",
            word: targetWord,
            options: [targetWord]
          });
        }
      } else if (type === "category_grouping") {
        // Category grouping: Identify the word belonging to the current unit category
        const targetWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        const distractors = otherVocab
          .filter(w => !vocabulary.find(vw => vw.word === w.word))
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        const options = [...distractors, targetWord].sort(() => 0.5 - Math.random());
        newQuestions.push({
          type,
          word: targetWord,
          options
        });
      } else if (type === "match_pairs") {
        // Match pairs: 3 words and 3 emojis from the current unit
        const selected = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 3);
        const shuffledWords = [...selected].sort(() => 0.5 - Math.random());
        const shuffledEmojis = [...selected].sort(() => 0.5 - Math.random());
        newQuestions.push({
          type,
          extraData: {
            words: shuffledWords,
            emojis: shuffledEmojis
          }
        });
      }
    }

    setTestQuestions(newQuestions);
    setTestQuestionIndex(0);
    setTestCorrectCount(0);
    setTestCompleted(false);
    setTestActive(true);
    setIsAnswered(false);
    setIsCorrect(false);

    // Reset matching state for Match Pairs
    setSelectedMatchWord(null);
    setMatchedPairs([]);
    setFailedMatchAttempt(false);
  };

  const handleTestAnswerClick = (correct: boolean) => {
    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      setTestCorrectCount((prev) => prev + 1);
      playSuccessSound();
    } else {
      playTryAgainSound();
    }
  };

  const handleNextTestQuestion = () => {
    const nextIdx = testQuestionIndex + 1;
    if (nextIdx < 5) {
      setTestQuestionIndex(nextIdx);
      setIsAnswered(false);
      setIsCorrect(false);
      // Reset matching state for Match Pairs
      setSelectedMatchWord(null);
      setMatchedPairs([]);
      setFailedMatchAttempt(false);
    } else {
      // Complete test
      setTestCompleted(true);
      setTestActive(false);
    }
  };

  const saveTestResult = () => {
    const score = Math.round((testCorrectCount / 5) * 100);
    onSaveAssessment(score);
    // Award bonus motivation stars
    onAwardStars(score >= 80 ? 5 : score >= 60 ? 3 : 1);
    setTestCompleted(false);
    setMode("flashcards");
  };

  const getTestCorrectAnswer = () => {
    const q = testQuestions[testQuestionIndex];
    if (!q) return "";
    if (q.type === "match_pairs") return "Cần nối đúng toàn bộ các cặp từ và tranh.";
    if (q.type === "odd_one_out") return `Từ khác nhóm là "${q.word.word}" (thuộc nhóm bài khác).`;
    if (q.type === "category_grouping") return `Từ thuộc nhóm là "${q.word.word}".`;
    return `Từ đúng là: "${q.word.word}"`;
  };

  // ===================== 4. MEMORY MATCH LOGIC =====================
  const startMemoryMatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Select 4 random words
    const selectedWords = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    // Create card pairs (word & emoji)
    const cardPool: MemoryCard[] = [];
    selectedWords.forEach((item, index) => {
      cardPool.push({
        id: `word-${index}-${item.word}`,
        content: item.word,
        type: "word",
        wordValue: item.word,
        isFlipped: false,
        isMatched: false
      });
      cardPool.push({
        id: `emoji-${index}-${item.word}`,
        content: item.emoji,
        type: "emoji",
        wordValue: item.word,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    const shuffledCards = cardPool.sort(() => 0.5 - Math.random());
    setCards(shuffledCards);
    setSelectedCards([]);
    setMatchPairsFound(0);
    setMatchTimer(30);
    setMatchActive(true);
    setMatchCompleted(false);
    setMatchVictory(false);

    // Start timer
    timerRef.current = setInterval(() => {
      setMatchTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleMatchTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleMatchTimeout = () => {
    setMatchActive(false);
    setMatchCompleted(true);
    setMatchVictory(false);
  };

  const handleCardClick = (cardIndex: number) => {
    if (!matchActive || cards[cardIndex].isMatched || cards[cardIndex].isFlipped) return;
    if (selectedCards.length >= 2) return;

    // Flip card
    const updatedCards = [...cards];
    updatedCards[cardIndex].isFlipped = true;
    setCards(updatedCards);

    const newSelected = [...selectedCards, cardIndex];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const idx1 = newSelected[0];
      const idx2 = newSelected[1];
      const card1 = cards[idx1];
      const card2 = cards[idx2];

      if (card1.wordValue === card2.wordValue && card1.type !== card2.type) {
        // MATCH FOUND
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[idx1].isMatched = true;
          matchedCards[idx2].isMatched = true;
          setCards(matchedCards);
          setSelectedCards([]);
          playAudio(card1.wordValue);

          const newPairs = matchPairsFound + 1;
          setMatchPairsFound(newPairs);

          if (newPairs === 4) {
            // VICTORY!
            clearInterval(timerRef.current);
            setMatchActive(false);
            setMatchCompleted(true);
            setMatchVictory(true);
            onAwardStars(3); // Match victory grants +3 stars!
            playSuccessSound();
          }
        }, 500);
      } else {
        // NO MATCH - FLIP BACK
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[idx1].isFlipped = false;
          resetCards[idx2].isFlipped = false;
          setCards(resetCards);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-6" id="leego-vocabulary-tab">
      
      {/* 1. Mode Selector Buttons */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-2xl">
        {(["flashcards", "practice_quiz", "test_challenge", "memory_match"] as TabMode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setTestActive(false);
              setTestCompleted(false);
              setMatchCompleted(false);
              setMatchActive(false);
              if (timerRef.current) clearInterval(timerRef.current);
            }}
            className={`py-2 px-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer text-center
              ${mode === m
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            {m === "flashcards" && (
              <>
                <span className="hidden sm:inline">🎴 Flashcards</span>
                <span className="sm:hidden">🎴 Thẻ từ</span>
              </>
            )}
            {m === "practice_quiz" && "✍️ Luyện tập"}
            {m === "test_challenge" && "📝 Kiểm tra"}
            {m === "memory_match" && (
              <>
                <span className="hidden sm:inline">🃏 Lật thẻ bài</span>
                <span className="sm:hidden">🃏 Lật thẻ</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* ===================== MODE 1: FLASHCARDS ===================== */}
      {mode === "flashcards" && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-orange-100 p-4 sm:p-6 shadow-sm w-full">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🌟</span>
            <h3 className="font-black text-orange-700 text-sm">Thẻ Từ Vựng Học Tập (Flashcards)</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center w-full">
            <div className="bg-white rounded-3xl border-4 border-orange-200/50 p-4 sm:p-8 shadow-md flex flex-col items-center text-center relative overflow-hidden min-h-[300px] justify-center transition-all duration-300 w-full">
              <div className="absolute top-3 left-3 bg-orange-100 text-orange-700 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                Từ {cardIndex + 1} / {vocabulary.length}
              </div>

              <button
                onClick={() => playAudio(vocabulary[cardIndex].word)}
                className="absolute top-3 right-3 p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-2xl transition-transform hover:scale-115 cursor-pointer"
                title="Đọc từ"
              >
                <Volume2 size={18} />
              </button>

              <div className="text-7xl mb-4 animate-bounce duration-1000">
                {vocabulary[cardIndex].emoji}
              </div>

              <h4 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
                {vocabulary[cardIndex].word}
              </h4>

              <p className="text-xs font-mono text-slate-400 mt-1 font-bold">
                {vocabulary[cardIndex].phonetic}
              </p>

              <div className="mt-6 w-full">
                {revealed ? (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 animate-fade-in">
                    <p className="text-orange-700 font-extrabold text-sm">
                      {vocabulary[cardIndex].meaning}
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-1 font-medium">
                      "{vocabulary[cardIndex].exampleSentence}"
                    </p>
                    <p className="text-[10px] text-orange-600/80 font-semibold mt-0.5">
                      ({vocabulary[cardIndex].exampleMeaning})
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setRevealed(true);
                      playAudio(vocabulary[cardIndex].word);
                    }}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-orange-200 text-xs cursor-pointer"
                  >
                    🔍 Xem nghĩa tiếng Việt
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setRevealed(false);
                    setCardIndex((prev) => (prev > 0 ? prev - 1 : vocabulary.length - 1));
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  ◀ Thẻ trước
                </button>
                <button
                  onClick={() => {
                    setRevealed(false);
                    setCardIndex((prev) => (prev < vocabulary.length - 1 ? prev + 1 : 0));
                  }}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs transition-transform shadow-sm hover:scale-103 cursor-pointer"
                >
                  Thẻ tiếp theo ▶
                </button>
              </div>

              <div className="bg-white/80 rounded-2xl p-3 border border-orange-100/60 max-h-[180px] overflow-y-auto space-y-1">
                <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 mb-2 px-1">
                  Danh sách từ vựng:
                </p>
                {vocabulary.map((vocab, idx) => (
                  <button
                    key={vocab.word}
                    onClick={() => {
                      setRevealed(false);
                      setCardIndex(idx);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer
                      ${idx === cardIndex 
                        ? "bg-orange-100 text-orange-800 font-extrabold" 
                        : "hover:bg-slate-50 text-slate-600 font-semibold"
                      }`}
                  >
                    <span className="truncate">
                      {vocab.emoji} <span className="capitalize ml-1">{vocab.word}</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {vocab.phonetic}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODE 2: PRACTICE QUIZ ===================== */}
      {mode === "practice_quiz" && quizWord && (
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 sm:p-6 shadow-sm w-full">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-sm tracking-tight">Tự luyện tập ngẫu nhiên</h3>
                <p className="text-[10px] text-slate-400">Chọn dạng bài tự ôn luyện dưới đây nhé!</p>
              </div>
            </div>

            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto w-full sm:w-auto">
              {(["whats_missing", "scrambled", "listening"] as QuizType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setQuizType(type)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all whitespace-nowrap cursor-pointer
                    ${quizType === type 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {type === "whats_missing" && "Điền chữ còn thiếu"}
                  {type === "scrambled" && "Sắp xếp từ"}
                  {type === "listening" && "Nghe & Đoán từ"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-100 text-center flex flex-col items-center w-full">
            {quizType === "whats_missing" && (
              <div className="space-y-4 w-full max-w-md">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Điền chữ cái còn thiếu:</p>
                <div className="text-5xl mb-1">{quizWord.emoji}</div>
                <div className="text-3xl font-black tracking-widest text-slate-800 uppercase font-mono bg-white border-2 border-slate-200 py-3 px-5 rounded-2xl inline-block shadow-sm">
                  {whatsMissingWord}
                </div>
                <p className="text-xs text-slate-400">Ý nghĩa: <span className="font-extrabold text-slate-600">{quizWord.meaning}</span></p>
                <div className="grid grid-cols-4 gap-2.5 pt-2">
                  {whatsMissingOptions.map((char, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleMissingOptionClick(char)}
                      disabled={isAnswered}
                      className={`py-2 rounded-xl text-md font-black border-2 uppercase font-mono shadow-sm cursor-pointer
                        ${isAnswered 
                          ? char === missingChar
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white border-slate-200 text-slate-300"
                          : "bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-400 text-slate-700 hover:scale-105 active:scale-95"
                        }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizType === "scrambled" && (
              <div className="space-y-4 w-full max-w-md">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Ghép chữ cái thành từ đúng:</p>
                <div className="text-5xl mb-1">{quizWord.emoji}</div>
                <div className="min-h-[50px] flex items-center justify-center gap-1 flex-wrap bg-white border-2 border-dashed border-slate-200 rounded-2xl px-3 py-1.5">
                  {scrambledSelected.length === 0 && (
                    <span className="text-slate-300 text-xs font-extrabold font-mono italic">Nhấp vào ô chữ cái bên dưới...</span>
                  )}
                  {scrambledSelected.map((letter, idx) => (
                    <span key={idx} className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-300 flex items-center justify-center font-black uppercase font-mono text-orange-700 text-sm">{letter}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Ý nghĩa: <span className="font-extrabold text-slate-600">{quizWord.meaning}</span></p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                  {scrambledLetters.map((letter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleScrambleTileClick(letter, idx)}
                      disabled={isAnswered}
                      className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 hover:border-orange-400 font-black uppercase font-mono text-slate-700 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                    >
                      {letter}
                    </button>
                  ))}
                </div>
                {!isAnswered && scrambledSelected.length > 0 && (
                  <button onClick={handleResetScramble} className="flex items-center gap-1 mx-auto text-[10px] font-extrabold text-slate-400 hover:text-slate-600 cursor-pointer">
                    <RefreshCw size={10} /> <span>Làm lại</span>
                  </button>
                )}
              </div>
            )}

            {quizType === "listening" && (
              <div className="space-y-4 w-full max-w-md">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Nghe âm thanh đoán thẻ:</p>
                <button
                  onClick={() => playAudio(quizWord.word)}
                  className="w-16 h-16 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Volume2 size={28} className="animate-pulse" />
                </button>
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {listeningOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleListeningMatchClick(opt)}
                      disabled={isAnswered}
                      className={`flex flex-col items-center p-2.5 rounded-xl border-2 shadow-sm cursor-pointer
                        ${isAnswered
                          ? opt.word === quizWord.word
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white border-slate-100 text-slate-300"
                          : "bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-400 text-slate-700 hover:scale-103"
                        }`}
                    >
                      <span className="text-3xl mb-1">{opt.emoji}</span>
                      <span className="text-[10px] font-black capitalize truncate max-w-full">{opt.word}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isAnswered && (
              <div className={`mt-5 w-full max-w-md p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 animate-fade-in
                ${isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}
              >
                <div className="text-left text-xs font-bold">
                  {isCorrect ? (
                    <p className="flex items-center gap-1">🏆 Đúng rồi! Quá giỏi! +{quizType === "scrambled" ? "2" : "1"} sao</p>
                  ) : (
                    <p>😢 Sai rồi! Đáp án: <span className="font-black text-rose-600 uppercase font-mono">{quizWord.word}</span></p>
                  )}
                </div>
                <button
                  onClick={generateNewQuizQuestion}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer shadow-sm
                    ${isCorrect ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
                >
                  <span>Tiếp tục</span> <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODE 3: TEST CHALLENGE (5 QUESTIONS) ===================== */}
      {mode === "test_challenge" && (
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 sm:p-6 shadow-sm w-full">
          {!testActive && !testCompleted && (
            <div className="text-center py-6 space-y-4 max-w-md mx-auto w-full">
              <Award size={48} className="text-orange-500 mx-auto animate-bounce" />
              <h3 className="text-md font-black text-slate-800 uppercase">Thử thách từ vựng (Vocabulary Challenge)</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                Bài kiểm tra gồm **5 câu hỏi ngẫu nhiên** để chấm điểm đánh giá phần học từ vựng của bài học này. Làm bài thật tốt để lấy điểm 100 nhé!
              </p>
              <button
                onClick={startTestChallenge}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-2xl shadow-md shadow-orange-100 transition-all active:scale-95 cursor-pointer w-full"
              >
                📝 Bắt đầu kiểm tra từ vựng
              </button>
            </div>
          )}

          {testActive && testQuestions[testQuestionIndex] && (
            <div className="space-y-4 w-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Đang làm bài kiểm tra:</span>
                <span className="text-xs font-black text-orange-600">Câu hỏi {testQuestionIndex + 1} / 5</span>
              </div>
              
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${((testQuestionIndex) / 5) * 100}%` }} />
              </div>

              {/* Quiz question template inside test mode */}
              <div className="bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-2xl text-center flex flex-col items-center w-full">
                {testQuestions[testQuestionIndex].type === "picture_to_word" && (
                  <div className="space-y-4 w-full max-w-md">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Nhìn tranh chọn từ đúng:
                    </p>
                    <div className="text-6xl my-4 animate-scale-up select-none">
                      {testQuestions[testQuestionIndex].word.emoji}
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {testQuestions[testQuestionIndex].options.map((opt: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleTestAnswerClick(opt.word === testQuestions[testQuestionIndex].word.word)}
                          disabled={isAnswered}
                          className={`py-3 px-4 rounded-xl text-xs font-black capitalize border-2 shadow-sm cursor-pointer transition-colors
                            ${isAnswered
                              ? opt.word === testQuestions[testQuestionIndex].word.word
                                ? "bg-emerald-500 border-emerald-500 text-white cursor-default"
                                : "bg-white border-slate-200 text-slate-300 cursor-default"
                              : "bg-white hover:bg-orange-50 border-slate-200 hover:border-orange-400 text-slate-700 hover:scale-103 active:scale-97"
                            }`}
                        >
                          {opt.word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {testQuestions[testQuestionIndex].type === "word_to_picture" && (
                  <div className="space-y-4 w-full max-w-md">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Nhìn từ chọn tranh đúng:
                    </p>
                    <div className="text-3xl font-black tracking-wide text-slate-800 uppercase font-mono bg-white border-2 border-slate-200 py-3 px-6 rounded-2xl inline-block shadow-sm my-3 select-none">
                      {testQuestions[testQuestionIndex].word.word}
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {testQuestions[testQuestionIndex].options.map((opt: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleTestAnswerClick(opt.word === testQuestions[testQuestionIndex].word.word)}
                          disabled={isAnswered}
                          className={`py-2 px-4 rounded-xl text-3xl border-2 shadow-sm cursor-pointer transition-colors
                            ${isAnswered
                              ? opt.word === testQuestions[testQuestionIndex].word.word
                                ? "bg-emerald-500 border-emerald-500 text-white cursor-default"
                                : "bg-white border-slate-200 text-slate-300 cursor-default"
                              : "bg-white hover:bg-orange-50 border-slate-200 hover:border-orange-400 hover:scale-103 active:scale-97"
                            }`}
                        >
                          {opt.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {testQuestions[testQuestionIndex].type === "odd_one_out" && (
                  <div className="space-y-4 w-full max-w-md">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Tìm từ khác nhóm (Odd One Out):
                    </p>
                    <p className="text-xs text-slate-500 font-bold mb-2">
                      Chọn từ KHÔNG thuộc nhóm bài học này:
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {testQuestions[testQuestionIndex].options.map((opt: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleTestAnswerClick(opt.word === testQuestions[testQuestionIndex].word.word)}
                          disabled={isAnswered}
                          className={`py-3 px-4 rounded-xl text-xs font-black capitalize border-2 shadow-sm cursor-pointer transition-colors
                            ${isAnswered
                              ? opt.word === testQuestions[testQuestionIndex].word.word
                                ? "bg-emerald-500 border-emerald-500 text-white cursor-default"
                                : "bg-white border-slate-200 text-slate-300 cursor-default"
                              : "bg-white hover:bg-orange-50 border-slate-200 hover:border-orange-400 text-slate-700 hover:scale-103 active:scale-97"
                            }`}
                        >
                          {opt.word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {testQuestions[testQuestionIndex].type === "category_grouping" && (
                  <div className="space-y-4 w-full max-w-md">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Phân loại nhóm từ vựng (Grouping):
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 my-2">
                      <span className="text-[10px] font-black text-orange-700 uppercase block tracking-wider">Chủ đề bài học</span>
                      <span className="text-sm font-black text-slate-800 mt-0.5 block">{currentUnitObj?.title || "Bài học"}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold mb-2">
                      Từ nào dưới đây thuộc chủ đề này?
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {testQuestions[testQuestionIndex].options.map((opt: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleTestAnswerClick(opt.word === testQuestions[testQuestionIndex].word.word)}
                          disabled={isAnswered}
                          className={`py-3 px-4 rounded-xl text-xs font-black capitalize border-2 shadow-sm cursor-pointer transition-colors
                            ${isAnswered
                              ? opt.word === testQuestions[testQuestionIndex].word.word
                                ? "bg-emerald-500 border-emerald-500 text-white cursor-default"
                                : "bg-white border-slate-200 text-slate-300 cursor-default"
                              : "bg-white hover:bg-orange-50 border-slate-200 hover:border-orange-400 text-slate-700 hover:scale-103 active:scale-97"
                            }`}
                        >
                          {opt.word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {testQuestions[testQuestionIndex].type === "match_pairs" && (
                  <div className="space-y-4 w-full max-w-lg">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Ghép cặp từ và tranh (Match Words & Pictures):
                    </p>
                    <p className="text-xs text-slate-500 font-bold mb-2">
                      Hãy nhấp vào 1 từ và chọn hình ảnh tương ứng:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        {testQuestions[testQuestionIndex].extraData.words.map((item: any) => {
                          const isMatched = matchedPairs.includes(item.word);
                          const isSelected = selectedMatchWord === item.word;
                          return (
                            <button
                              key={item.word}
                              disabled={isMatched || isAnswered}
                              onClick={() => setSelectedMatchWord(item.word)}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-black capitalize border-2 text-center transition-all cursor-pointer
                                ${isMatched
                                  ? "bg-emerald-500 border-emerald-500 text-white cursor-default"
                                  : isSelected
                                    ? "bg-orange-100 border-orange-400 text-orange-800 shadow-sm scale-103"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-orange-200"
                                }`}
                            >
                              {item.word}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        {testQuestions[testQuestionIndex].extraData.emojis.map((item: any) => {
                          const isMatched = matchedPairs.includes(item.word);
                          return (
                            <button
                              key={item.word}
                              disabled={isMatched || isAnswered}
                              onClick={() => {
                                if (!selectedMatchWord) return;
                                if (selectedMatchWord === item.word) {
                                  const nextMatched = [...matchedPairs, item.word];
                                  setMatchedPairs(nextMatched);
                                  setSelectedMatchWord(null);
                                  if (nextMatched.length === 3) {
                                    handleTestAnswerClick(!failedMatchAttempt);
                                  }
                                } else {
                                  setFailedMatchAttempt(true);
                                  playTryAgainSound();
                                }
                              }}
                              className={`w-full py-1 px-3 rounded-xl text-2xl border-2 text-center transition-all cursor-pointer h-[42px] flex items-center justify-center
                                ${isMatched
                                  ? "bg-emerald-500 border-emerald-500 text-white cursor-default"
                                  : "bg-white border-slate-200 hover:border-orange-200"
                                }`}
                            >
                              {item.emoji}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {isAnswered && (
                  <div className={`mt-5 w-full max-w-md p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 animate-fade-in
                    ${isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}
                  >
                    <div className="text-left text-xs font-bold">
                      {isCorrect ? (
                        <p className="flex items-center gap-1">🏆 Chính xác! +1 điểm</p>
                      ) : (
                        <p>😢 Sai mất rồi! {getTestCorrectAnswer()}</p>
                      )}
                    </div>
                    <button
                      onClick={handleNextTestQuestion}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-extrabold text-xs cursor-pointer shadow-sm
                        ${isCorrect ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
                    >
                      <span>{testQuestionIndex === 4 ? "Xem kết quả" : "Câu tiếp theo"}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OFFICIAL VOCABULARY ASSESSMENT REPORT CARD */}
          {testCompleted && (
            <div className="border-2 border-orange-200 rounded-3xl overflow-hidden shadow-lg max-w-md mx-auto animate-scale-up bg-white">
              <div className="bg-orange-500 px-4 py-2.5 text-center text-xs font-black text-white tracking-widest">
                🌟 BẢNG ĐÁNH GIÁ TỪ VỰNG - ANH NGỮ LEEGO 🌟
              </div>
              <div className="p-5 space-y-4 text-center">
                <Trophy size={48} className="text-amber-500 mx-auto fill-amber-100" />
                <div>
                  <h4 className="text-md font-black text-slate-800">Con đã hoàn thành bài kiểm tra!</h4>
                  <p className="text-xs text-slate-400 mt-1">Kết quả kiểm tra từ vựng Everybody Up 2</p>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <span className="text-[10px] font-black text-orange-700 block uppercase">Kết quả</span>
                    <span className="text-2xl font-black text-slate-800 mt-1 block">{testCorrectCount} / 5</span>
                  </div>
                  <div className="text-center border-l border-orange-200/50">
                    <span className="text-[10px] font-black text-orange-700 block uppercase">Điểm số</span>
                    <span className="text-2xl font-black text-orange-600 mt-1 block">{(testCorrectCount / 5) * 100}%</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-left">
                  <p className="font-extrabold text-[11px] text-slate-700 mb-1 flex items-center gap-1">
                    <span>👩‍🏫</span> Nhận xét từ Thầy Cô LeeGo:
                  </p>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    {testCorrectCount === 5 
                      ? "Tuyệt vời con ơi! Con đã làm đúng 100% các từ vựng của bài. Thầy cô rất tự hào về con!"
                      : testCorrectCount >= 3
                        ? "Chúc mừng con đã hoàn thành bài kiểm tra rất tốt! Hãy học thêm các từ chưa nhớ để đạt điểm tối đa nha."
                        : "Con học rất chăm chỉ nhưng hãy luyện thêm một chút để nhớ kỹ các từ vựng này hơn nhé. Cố lên!"
                    }
                  </p>
                </div>

                <button
                  onClick={saveTestResult}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer w-full"
                >
                  Hoàn thành & Nhận sao 🌟
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== MODE 4: MEMORY MATCH GAME ===================== */}
      {mode === "memory_match" && (
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 sm:p-6 shadow-sm w-full">
          {!matchActive && !matchCompleted && (
            <div className="text-center py-6 space-y-4 max-w-md mx-auto">
              <Gamepad2 size={48} className="text-indigo-500 mx-auto animate-bounce" />
              <h3 className="text-md font-black text-slate-800 uppercase">Trò chơi lật thẻ bài từ vựng</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                Hãy ghép các từ tiếng Anh với hình Emoji tương ứng. Tìm thấy tất cả 4 cặp trong vòng **30 giây** để nhận sao vàng chiến thắng nhé! 🚀
              </p>
              <button
                onClick={startMemoryMatch}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-2xl shadow-md shadow-indigo-100 transition-all active:scale-95 cursor-pointer w-full"
              >
                🃏 Bắt đầu chơi game
              </button>
            </div>
          )}

          {matchActive && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black text-slate-600 flex items-center gap-1.5">
                  ⏰ Thời gian còn lại: 
                  <span className={`font-mono font-black ${matchTimer <= 8 ? "text-red-500 animate-pulse text-lg" : "text-indigo-600"}`}>
                    {matchTimer}s
                  </span>
                </span>
                <span className="text-xs font-black text-slate-600">Đã ghép: {matchPairsFound} / 4 cặp</span>
              </div>

              {/* Grid 4x2 of cards */}
              <div className="grid grid-cols-4 gap-3">
                {cards.map((card, idx) => {
                  const isFlipped = card.isFlipped || card.isMatched;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(idx)}
                      disabled={card.isMatched || card.isFlipped}
                      className={`h-20 sm:h-24 rounded-2xl border-2 transition-all flex items-center justify-center p-1.5 text-center shadow-sm select-none cursor-pointer
                        ${card.isMatched
                          ? "bg-emerald-500 border-emerald-500 text-white cursor-default"
                          : isFlipped
                            ? card.type === "emoji"
                              ? "bg-orange-50 border-orange-300 text-slate-800 text-3xl sm:text-4xl"
                              : "bg-indigo-50 border-indigo-300 text-indigo-900 text-[9px] sm:text-xs font-black capitalize break-words leading-tight"
                            : "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-500 hover:scale-103"
                        }`}
                    >
                      {isFlipped ? (
                        card.content
                      ) : (
                        <span className="text-white text-2xl font-black">LG</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={startMemoryMatch}
                className="flex items-center gap-1 mx-auto text-xs font-extrabold text-slate-400 hover:text-slate-600 cursor-pointer pt-3"
              >
                <RefreshCw size={12} />
                <span>Trộn bài chơi lại</span>
              </button>
            </div>
          )}

          {/* GAME COMPLETED BANNER */}
          {matchCompleted && (
            <div className="border-2 border-indigo-200 rounded-3xl overflow-hidden shadow-lg max-w-sm mx-auto animate-scale-up bg-white text-center p-6 space-y-4">
              {matchVictory ? (
                <>
                  <Trophy size={48} className="text-amber-500 mx-auto fill-amber-100 animate-bounce" />
                  <div>
                    <h4 className="text-md font-black text-emerald-600">CHIẾN THẮNG TUYỆT VỜI! 🏆</h4>
                    <p className="text-xs text-slate-500 font-bold mt-1">Con đã hoàn thành trò chơi lật thẻ xuất sắc!</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-emerald-800 text-xs font-extrabold">
                    🌟 Tặng con +3 sao vàng thành tựu!
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={48} className="text-red-500 mx-auto animate-pulse" />
                  <div>
                    <h4 className="text-md font-black text-red-600">HẾT GIỜ MẤT RỒI! 😢</h4>
                    <p className="text-xs text-slate-500 font-bold mt-1">Con chưa tìm hết các cặp bài trong 30 giây.</p>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <button
                  onClick={startMemoryMatch}
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  {matchVictory ? "Chơi lại vòng mới" : "Chơi lại 🚀"}
                </button>
                <button
                  onClick={() => setMode("flashcards")}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl cursor-pointer"
                >
                  Quay lại Thẻ từ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

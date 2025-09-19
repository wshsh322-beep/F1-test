import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, LightColor } from './types';
import Light from './components/Light';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [lights, setLights] = useState<LightColor[]>(Array(5).fill(LightColor.Off));
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  // FIX: Use `number` for timeout IDs in browser environments instead of `NodeJS.Timeout`.
  const timeoutsRef = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };
  
  const resetGame = useCallback(() => {
    clearTimeouts();
    setGameState(GameState.Idle);
    setLights(Array(5).fill(LightColor.Off));
    setReactionTime(null);
    timerRef.current = null;
  }, []);

  const startGame = useCallback(() => {
    if (gameState === GameState.Idle || gameState === GameState.Finished || gameState === GameState.JumpStart) {
        resetGame();
        setGameState(GameState.Starting);
    }
  }, [gameState, resetGame]);

  useEffect(() => {
    if (gameState === GameState.Starting) {
      // Light up sequence
      for (let i = 0; i < 5; i++) {
        const timeout = setTimeout(() => {
          setLights(prev => {
            const newLights = [...prev];
            newLights[i] = LightColor.Red;
            return newLights;
          });
        }, (i + 1) * 1150);
        timeoutsRef.current.push(timeout);
      }

      // Random delay before turning lights off
      const randomDelay = Math.random() * 2000 + 1000; // 1 to 3 seconds
      const goTimeout = setTimeout(() => {
        setLights(Array(5).fill(LightColor.Off));
        timerRef.current = performance.now();
        setGameState(GameState.Running);
      }, 5 * 1150 + randomDelay);
      timeoutsRef.current.push(goTimeout);
    }
    
    return () => {
      if (gameState === GameState.Starting) {
          clearTimeouts();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleInteraction = useCallback(() => {
    if (gameState === GameState.Starting) {
      clearTimeouts();
      setGameState(GameState.JumpStart);
    } else if (gameState === GameState.Running) {
      if (timerRef.current) {
        const endTime = performance.now();
        setReactionTime(endTime - timerRef.current);
        setGameState(GameState.Finished);
        setLights(Array(5).fill(LightColor.Off));
      }
    }
  }, [gameState]);
  
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if(gameState === GameState.Idle || gameState === GameState.Finished || gameState === GameState.JumpStart){
        startGame();
      } else {
        handleInteraction();
      }
    }
  }, [gameState, handleInteraction, startGame]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeouts();
    };
  }, [handleKeyPress]);
  
  const getMessage = () => {
    switch (gameState) {
      case GameState.Idle:
        return (
          <>
            <h1 className="text-3xl md:text-5xl font-bold">F1 REACTION TEST</h1>
            <p className="text-xl md:text-2xl mt-4">Press Spacebar to Start</p>
          </>
        );
      case GameState.Finished:
        return (
          <>
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider">{reactionTime?.toFixed(0)} ms</h1>
            <p className="text-xl md:text-2xl mt-4">Press Spacebar to Try Again</p>
          </>
        );
      case GameState.JumpStart:
        return (
          <>
            <h1 className="text-4xl md:text-6xl font-bold text-red-500">JUMP START</h1>
            <p className="text-xl md:text-2xl mt-4">Press Spacebar to Try Again</p>
          </>
        );
      case GameState.Starting:
         return <p className="text-xl md:text-2xl mt-4 h-10 animate-pulse">Get Ready...</p>;
      case GameState.Running:
         return <p className="text-xl md:text-2xl mt-4 text-green-400 h-10 font-bold">GO!</p>;
      default:
        return null;
    }
  };

  return (
    <div 
      className="bg-gray-900 text-white w-screen h-screen flex flex-col justify-center items-center font-mono cursor-pointer select-none overflow-hidden"
      onClick={handleInteraction}
      tabIndex={-1}
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-4">
        {getMessage()}
      </div>
      <div className="flex space-x-4 md:space-x-8">
        {lights.map((color, index) => (
          <Light key={index} color={color} />
        ))}
      </div>
    </div>
  );
};

export default App;
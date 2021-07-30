import React, { useState } from "react";
import classNames from "../utils/class-names";
import useInterval from "../utils/useInterval";
import { secondsToDuration } from "../utils/duration";
import { minutesToDuration } from "../utils/duration";
import FocusTimer from "../FocusTimer";
import BreakTimer from "../BreakTimer";
import PlayStopButtons from "../PlayStopButtons";
import DisplayTimerBar from "../DisplayTimerBar";
// These functions are defined outside of the component to insure they do not have access to state
// and are, therefore more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1);
  return {
    ...prevState,
    timeRemaining,
  };
}

/**
 * Higher order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: "Focusing",
      timeRemaining: focusDuration * 60,
    };
  };
}

function Pomodoro() {
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  //console.log("isTimerRunning= ", isTimerRunning);
  const [progressBarCalc, setprogressBarCalc] = useState(0);
  // The current session - null where there is no session running
  const [session, setSession] = useState(null);
  //console.log(session.label);
  // ToDo: Allow the user to adjust the focus and break duration.
  const [focusDuration, setfocusDuration] = useState(25);
  const [breakDuration, setbreakDuration] = useState(5);

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You will not need to make changes to the callback function
   */
  useInterval(() => {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/2386.mp3").play();
        setSession(nextSession(focusDuration, breakDuration));
      }
      setSession(nextTick);
    
    if(session.label === "Focusing"){
      setprogressBarCalc(((focusDuration*60) - session.timeRemaining) / (focusDuration*60) * 100);
      //console.log(progressBarCalc);
    } else{
      setprogressBarCalc(((breakDuration*60) - session.timeRemaining) / (breakDuration*60) * 100);
      //console.log(progressBarCalc);
    }
  },
    isTimerRunning ? 1000 : null
  );

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => {
      console.log(prevState)
      const nextState = !prevState;
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          }
          return prevStateSession;
        });
      }
      return nextState;
    });
  }

  const handleIncreaseFocus = () => {
    // console.log(focusDuration);
      setfocusDuration((lastFocusDuration) => Math.min(60, lastFocusDuration + 5));
  };

  const handleDecreaseFocus = () => {
    // console.log(focusDuration);
    setfocusDuration((lastFocusDuration) => Math.max(5, lastFocusDuration - 5));
  };

  const handleDecreaseBreak = () => {
    // console.log(focusDuration);
    setbreakDuration((lastbreakDuration) => Math.max(1, lastbreakDuration - 1));
  };

  const handleIncreaseBreak = () => {
    // console.log(breakDuration);
    setbreakDuration((lastbreakDuration) => Math.min(15, lastbreakDuration + 1));
  };

  const handleStopButton = () => {
    setSession(null);
    setIsTimerRunning(false);
  };

  const displayPaused = () => {
    if(!isTimerRunning){
      return "PAUSED"
    }
  };
   
  return (
    <div className="pomodoro">
      <div className="row">
        <div className="col">
          <FocusTimer
          focusDuration={focusDuration}
          minutesToDuration={minutesToDuration}
          isTimerRunning={isTimerRunning}
          handleDecreaseFocus={handleDecreaseFocus}
          handleIncreaseFocus={handleIncreaseFocus}
          />
        </div>
        <div className="col">
          <div className="float-right">
            <BreakTimer
            breakDuration={breakDuration}
            minutesToDuration={minutesToDuration}
            isTimerRunning={isTimerRunning}
            handleDecreaseBreak={handleDecreaseBreak}
            handleIncreaseBreak={handleIncreaseBreak}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <PlayStopButtons
            playPause={playPause}
            isTimerRunning={isTimerRunning}
            handleStopButton={handleStopButton}
          />
        </div>
      </div>
      <DisplayTimerBar
      minutesToDuration={minutesToDuration}
      secondsToDuration={secondsToDuration}
      focusDuration={focusDuration}
      breakDuration={breakDuration}
      session={session}
      isTimerRunning={isTimerRunning}
      progressBarCalc={progressBarCalc}
      />
    </div>
  );
}

export default Pomodoro;

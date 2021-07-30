import React, { useState } from "react";
import classNames from "../utils/class-names";
import useInterval from "../utils/useInterval";
import { secondsToDuration } from "../utils/duration";
import { minutesToDuration } from "../utils/duration";
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
          <div className="input-group input-group-lg mb-2">
            <span className="input-group-text" data-testid="duration-focus">
              {/* TODO: Update this text to display the current focus session duration */}
              Focus Duration: {minutesToDuration(focusDuration)}
            </span>
            <div className="input-group-append">
              {/* TODO: Implement decreasing focus duration and disable during a focus or break session */}
              <button
                type="button"
                disabled={isTimerRunning}
                className="btn btn-secondary"
                data-testid="decrease-focus"
                onClick={handleDecreaseFocus}
              >
                <span className="oi oi-minus" />
              </button>
              {/* TODO: Implement increasing focus duration  and disable during a focus or break session */}
              <button
                type="button"
                disabled={isTimerRunning}
                className="btn btn-secondary"
                data-testid="increase-focus"
                onClick={handleIncreaseFocus}
              >
                <span className="oi oi-plus" />
              </button>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="float-right">
            <div className="input-group input-group-lg mb-2">
              <span className="input-group-text" data-testid="duration-break">
                {/* TODO: Update this text to display the current break session duration */}
                Break Duration: {minutesToDuration(breakDuration)}
              </span>
              <div className="input-group-append">
                {/* TODO: Implement decreasing break duration and disable during a focus or break session*/}
                <button
                  type="button"
                  disabled={isTimerRunning}
                  className="btn btn-secondary"
                  data-testid="decrease-break"
                  onClick={handleDecreaseBreak}
                >
                  <span className="oi oi-minus" />
                </button>
                {/* TODO: Implement increasing break duration and disable during a focus or break session*/}
                <button
                  type="button"
                  disabled={isTimerRunning}
                  className="btn btn-secondary"
                  data-testid="increase-break"
                  onClick={handleIncreaseBreak}
                >
                  <span className="oi oi-plus" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div
            className="btn-group btn-group-lg mb-2"
            role="group"
            aria-label="Timer controls"
          >
            <button
              type="button"
              className="btn btn-primary"
              data-testid="play-pause"
              title="Start or pause timer"
              onClick={playPause}
            >
              <span
                className={classNames({
                  oi: true,
                  "oi-media-play": !isTimerRunning,
                  "oi-media-pause": isTimerRunning,
                })}
              />
            </button>
            {/* TODO: Implement stopping the current focus or break session. and disable the stop button when there is no active session */}
            {/* TODO: Disable the stop button when there is no active session */}
            <button
              type="button"
              disabled={!isTimerRunning}
              className="btn btn-secondary"
              data-testid="stop"
              title="Stop the session"
              onClick={handleStopButton}
            >
              <span className="oi oi-media-stop" />
            </button>
          </div>
        </div>
      </div>
      {session && (<div>
        {/* TODO: This area should show only when there is an active focus or break - i.e. the session is running or is paused */}
        <div className="row mb-2">
          <div className="col">
            {/* TODO: Update message below to include current session (Focusing or On Break) total duration */}
            <h2 data-testid="session-title">
              {session.label} for {session.label === "Focusing" ? minutesToDuration(focusDuration) : minutesToDuration(breakDuration)} minutes
            </h2>
            {/* TODO: Update message below correctly format the time remaining in the current session */}
            <p className="lead" data-testid="session-sub-title">
              {secondsToDuration(session.timeRemaining)} remaining
            </p>
            <h2>{displayPaused()}</h2>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <div className="progress" style={{ height: "20px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progressBarCalc} // TODO: Increase aria-valuenow as elapsed time increases
                style={{ width: `${progressBarCalc}%` }} // TODO: Increase width % as elapsed time increases
              />
            </div>
          </div>
        </div>
      </div>)}
    </div>
  );
}

export default Pomodoro;

package com.traffixpert.TraffiXpert.model; // Adjust package name if needed

public class TrafficSignal {

    private SignalState state;
    private double timer; // Using double for time, similar to JavaScript number

    /**
     * Constructor for TrafficSignal.
     * Initializes the signal to RED with a timer of 0.
     */
    public TrafficSignal() {
        this.state = SignalState.RED; // Default state is RED
        this.timer = 0; // Default timer is 0
    }

    /**
     * Changes the state of the traffic signal and sets its duration.
     * @param state The new SignalState (GREEN, YELLOW, RED).
     * @param duration The duration (in milliseconds or simulation ticks) for the new state.
     */
    public void changeState(SignalState state, double duration) {
        this.state = state;
        this.timer = duration;
    }

    /**
     * Updates the timer for the traffic signal.
     * Decrements the timer if it's greater than 0.
     * @param deltaTime The time elapsed since the last update (in milliseconds or simulation ticks).
     */
    public void update(double deltaTime) {
        if (this.timer > 0) {
            this.timer -= deltaTime;
            // Ensure timer doesn't go negative, although the original code didn't explicitly do this
            if (this.timer < 0) {
                this.timer = 0;
            }
        }
    }

    // --- Getters ---
    public SignalState getState() {
        return state;
    }

    public double getTimer() {
        return timer;
    }

    // --- Setters (Generally good practice, though not strictly required by original code) ---
    public void setState(SignalState state) {
        this.state = state;
    }

    public void setTimer(double timer) {
        this.timer = timer;
    }
}


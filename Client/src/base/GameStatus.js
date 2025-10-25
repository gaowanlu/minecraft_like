let GameStatus = {
    isRunning: false,
    SetIsRunning(val) {
        this.isRunning = val;
    },
    GetIsRunning() {
        return this.isRunning;
    }
};


module.exports = GameStatus;

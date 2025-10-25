const Log = require("../base/Log");

class BlockSystem {
    constructor() {
    }

    Init() {
        Log.DEBUG("BlockSystem.Init()");
    }

    OnGameStart() {
        Log.DEBUG("BlockSystem.OnGameStart()");
    }

    OnGameExit() {
        Log.DEBUG("BlockSystem.OnGameExit()");
    }

    OnMainLoop() {
        // Log.DEBUG("BlockSystem.OnMainLoop()");
    }
};

const BlockSystemInstance = new BlockSystem();

module.exports = BlockSystemInstance;

const Player = require("../entity/Player");
const Log = require("../base/Log");
const MapSystem = require("./MapSystem");
const ControlSystem = require("./ControlSystem");

class PlayerSystem {
    constructor() {
        this.player = null;
    }
    Init(camera) {
        Log.DEBUG("PlayerSystem.Init()");
        this.player = new Player(8, 3.5, 8, camera);
    }

    OnGameStart() {
        Log.DEBUG("PlayerSystem.OnGameStart()");

        // 游戏开始时设置位置玩家参数
        this.player.SetPosition(8, 3.5, 8);
        this.player.SetTargetRotation(0, 0);
        this.player.SetCurrentRotation(0, 0);
        this.player.UpdateCameraPositionToPlayerPosition();
    }

    GetPlayerPosition() {
        return this.player.positionCmpt.GetThreePosition();
    }

    GetPlayerPositionX() {
        return this.player.positionCmpt.GetThreePosition().x;
    }

    GetPlayerPositionY() {
        return this.player.positionCmpt.GetThreePosition().y;
    }

    GetPlayerPositionZ() {
        return this.player.positionCmpt.GetThreePosition().z;
    }

    UpdateRotation(event, debugCallbackFunc) {
        this.player.UpdateRotation(event, debugCallbackFunc);
    }

    OnGameExit() {
        Log.DEBUG("PlayerSystem.OnGameExit()");

        this.player.SetPosition(8, 3.5, 8);
        this.player.SetVelocity(0, 0, 0);
    }

    OnMainLoop() {
        // Log.DEBUG("PlayerSystem.OnMainLoop()");

        this.player.Update(MapSystem.GetMap(), ControlSystem.GetKeys(), (msg) => {
            Log.DEBUG(msg);
        });
    }
};

const PlayerSystemInstance = new PlayerSystem();

module.exports = PlayerSystemInstance;

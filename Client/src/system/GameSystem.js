const Log = require("../base/Log");

const UISystem = require("./UISystem");
const PlayerSystem = require("./PlayerSystem");
const MapSystem = require("./MapSystem");
const AssetSystem = require("./AssetSystem");
const ControlSystem = require("./ControlSystem");
const NpcSystem = require("./NpcSystem");
const BlockSystem = require("./BlockSystem");
const Network = require("../base/Network");
const BaseConfig = require("../config/BaseConfig");
const GameStatus = require("../base/GameStatus");

class GameSystem {
    constructor() {
        // 帧ID
        this.animationFrameId = null;
        // 记录上一帧时间
        this.lastTime = performance.now();

        // 网络
        this.network = new Network(BaseConfig.SVR_HOST, BaseConfig.SVR_PORT);
    }

    Init() {
        // 网络初始化
        this.network.Connect();
        // UI初始化
        {
            UISystem.Init(() => {
                this.OnStart();
            }, () => {
                this.OnExit();
            }, () => {
                this.OnWindowResize();
            });
            UISystem.ShowStartScreen();
            UISystem.BindPlayBlockTypeSelectChange((blockTypeVal) => {
                Log.ERROR(`blockTypeVal `, blockTypeVal);
                ControlSystem.SetBlockType(blockTypeVal);
            });
        }

        // 地图场景系统初始化
        MapSystem.Init();

        // 玩家角色系统初始化
        PlayerSystem.Init(MapSystem.GetCamera());

        // 砖块系统初始化
        BlockSystem.Init();

        // Npc小人系统初始化
        NpcSystem.Init();

        // 素材系统初始化
        AssetSystem.LoadAssets().catch(err => {
            console.error(`Failed to load assets: ${err.message}`);
        });

        // 控制系统初始化
        ControlSystem.Init(e => {
            PlayerSystem.UpdateRotation(e, (msg) => {
                Log.DEBUG(msg);
            });
        });
    }

    // 玩家点击UI 开始按钮
    async OnStart() {
        Log.DEBUG("游戏开始");
        // 保证资源加载完毕
        if (!AssetSystem.IsLoadedOK()) {
            console.error("资源暂未加载完毕");
            return;
        }

        // 开始MainLoop运行
        GameStatus.SetIsRunning(true);

        // 地图系统开始游戏
        MapSystem.OnGameStart();

        // 砖块系统开始游戏
        BlockSystem.OnGameStart();

        // NPC系统开始游戏
        NpcSystem.OnGameStart();

        // 主角系统开始游戏
        PlayerSystem.OnGameStart();

        // 地图系统设置点光位置
        MapSystem.SetPointLightPosition(PlayerSystem.GetPlayerPositionX(),
            PlayerSystem.GetPlayerPositionY() + 0.5,
            PlayerSystem.GetPlayerPositionZ());

        // 控制系统开始游戏
        ControlSystem.OnGameStart();

        // 开始主循环
        this.lastTime = performance.now();
        this.MainLoop();
    }

    // 玩家点UI 结束退出按钮回调
    async OnExit() {
        Log.DEBUG('Game OnExit');

        if (this.animationFrameId) {
            Log.DEBUG("GameSystem.OnExit cancelAnimationFrame", this.animationFrameId);
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        GameStatus.SetIsRunning(false);

        MapSystem.OnGameExit();
        BlockSystem.OnGameExit();
        PlayerSystem.OnGameExit();
        NpcSystem.OnGameExit();
        ControlSystem.OnGameExit();
    }

    async OnWindowResize() {
        MapSystem.OnWindowResize();
    }

    async MainLoop() {
        if (!GameStatus.GetIsRunning()) {
            return;
        }

        this.animationFrameId = requestAnimationFrame(this.MainLoop.bind(this));

        // 计算时间步长秒
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // 毫秒转为秒
        this.lastTime = currentTime;

        UISystem.OnMainLoop();
        MapSystem.OnMainLoop(PlayerSystem.GetPlayerPosition());
        BlockSystem.OnMainLoop();
        PlayerSystem.OnMainLoop();
        NpcSystem.OnMainLoop();
        ControlSystem.OnMainLoop();

        // 调试帧率
        // Log.DEBUG(`Frame time: ${(deltaTime * 1000).toFixed(2)}ms, FPS: ${(1 / deltaTime).toFixed(1)}`);
    }
};

const GameSystemInstance = new GameSystem();

module.exports = GameSystemInstance;

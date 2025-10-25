const THREE = require('three');
const Log = require("../base/Log");

class UISystem {
    constructor() {
        this.startScreen = document.getElementById('freeland-start-screen');
        this.inGameUI = document.getElementById('freeland-in-game-ui');
        // this.debugText = document.getElementById('freeland-debug-text');
        // this.debugPanel = document.getElementById('freeland-debug-panel');
        this.crosshair = document.getElementById('freeland-crosshair');
        this.startButton = document.getElementById('freeland-start-button');
        this.exitButton = document.getElementById('freeland-exit-button');
        this.playBlockTypeSelect = document.getElementById('freeland-block-type-select');
        // this.debugMessages = [];
    }

    Init(OnGameStartCallback, OnGameExitCallback, OnWindowResize) {
        Log.DEBUG("UISystem.Init()");
        // 开始游戏按钮
        let OnStartButtonClick = () => {
            Log.DEBUG("开始游戏按钮被点击");
            this.OnGameStart();
            OnGameStartCallback();
        };
        this.startButton.addEventListener('click', OnStartButtonClick.bind(this));

        // 离开游戏按钮
        let OnExitButtonClick = () => {
            Log.DEBUG("离开游戏按钮被点击");
            this.OnGameExit();
            OnGameExitCallback();
        };
        this.exitButton.addEventListener('click', OnExitButtonClick.bind(this));

        // 注册窗口大小改变事件
        window.addEventListener('resize', () => {
            Log.DEBUG(`窗口大小改变了 window.innerWidth ${window.innerWidth} window.innerHeight ${window.innerHeight}`);

            OnWindowResize();
        });
    }

    BindPlayBlockTypeSelectChange(playBlockTypeCallbackFunc) {
        this.playBlockTypeSelect.addEventListener('change', (e) => playBlockTypeCallbackFunc(e.target.value));
    }

    ShowStartScreen() {
        this.startScreen.style.display = 'flex';
        this.crosshair.style.display = 'none';
        // this.debugText.style.display = 'none';
        // this.debugPanel.style.display = 'none';
        this.inGameUI.style.display = 'none';
    }

    OnGameStart() {
        Log.DEBUG("UI.System OnGameStart()");
        this.ShowInGameUI();
    }

    OnGameExit() {
        this.ShowStartScreen();
    }

    ShowInGameUI() {
        this.startScreen.style.display = 'none';
        this.crosshair.style.display = 'block';
        // this.debugText.style.display = 'block';
        // this.debugPanel.style.display = 'block';
        this.inGameUI.style.display = 'block';
    }

    SetDebugText(text) {
        Log.DEBUG(`UISystem setDebugText: ${text}`);
        // this.debugText.textContent = text;
    }

    UpdateDebugPanel(message) {
        // this.debugMessages.push(message);
        // if (this.debugMessages.length > 5) this.debugMessages.shift();
        // let debugText = '';
        // if (this.Game.player) {
        //     const pitchDeg = (this.Game.player.currentRotation.x * 180 / Math.PI).toFixed(1);
        //     const yawDeg = (this.Game.player.currentRotation.y * 180 / Math.PI).toFixed(1);
        //     debugText += `Player: x=${this.Game.player.position.x.toFixed(2)}, y=${this.Game.player.position.y.toFixed(2)}, z=${this.Game.player.position.z.toFixed(2)}\n`;
        //     debugText += `Camera: pitch=${pitchDeg}°, yaw=${yawDeg}°\n`;
        // } else {
        //     debugText += `Player: Not initialized\nCamera: Not initialized\n`;
        // }
        // if (this.Game.npcs && this.Game.npcs.length > 0) {
        //     this.Game.npcs.forEach((npc, index) => {
        //         debugText += `NPC ${index}: x=${npc.position.x.toFixed(2)}, z=${npc.position.z.toFixed(2)}\n`;
        //     });
        // } else {
        //     debugText += `NPCs: None\n`;
        // }
        // debugText += '\nLogs:\n' + this.debugMessages.join('\n');
        // this.debugPanel.innerHTML = debugText;
    }

    OnMainLoop() {
        // Log.DEBUG("UISystem.OnMainLoop()");
    }

};

const UISystemInstance = new UISystem();

module.exports = UISystemInstance;

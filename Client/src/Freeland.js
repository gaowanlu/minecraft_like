const GameSystemInstance = require("./system/GameSystem");
const BaseConfig = require("./config/BaseConfig");
const Log = require("./base/Log");

const Freeland = {
};

Freeland.Version = () => {
    return BaseConfig.VERSION;
}

Freeland.ConsoleVersion = function () {
    Log.DEBUG(`Freeland Version: ${this.Version()}`);
}

Freeland.OnDOMContentLoaded = function () {
    // Log.DEBUG("DOMContentLoaded");
    this.ConsoleVersion();

    // 游戏系统实例初始化
    GameSystemInstance.Init();
}

window.addEventListener('DOMContentLoaded', () => {
    Freeland.OnDOMContentLoaded()
}, false);

module.exports = Freeland;

const Npc = require("../entity/Npc");
const MapSystem = require("./MapSystem");
const AssetSystem = require("./AssetSystem");
const Macro = require("../base/Macro");
const Log = require("../base/Log");

class NpcSystem {
    constructor() {
        this.npcs = [];
    }
    Init() {
        Log.DEBUG("NpcSystem.Init()");
    }

    OnGameStart() {
        Log.DEBUG("NpcSystem.OnGameStart()");
        this.npcs.length = 0;
        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * (MapSystem.GetMapSize() - 2)) + 1;
            const z = Math.floor(Math.random() * (MapSystem.GetMapSize() - 2)) + 1;

            const npc = new Npc(x,
                z,
                MapSystem.GetScene(),
                AssetSystem.GetMaterial(Macro.MaterialNameMacro.NPC));
            this.npcs.push(npc);

            Log.DEBUG(`NPC ${this.npcs.length - 1} created at: x=${x}, y=1, z=${z}`);
        }
    }

    OnGameExit() {
        Log.DEBUG("NpcSystem.OnGameExit()");

        this.npcs.forEach(npc => npc.Remove(MapSystem.GetScene()));
        this.npcs.length = 0;
    }

    OnMainLoop() {
        // Log.DEBUG("NpcSystem.OnMainLoop()");

        this.npcs.forEach((npc, index) => {
            npc.Update(MapSystem.GetMap(),
                MapSystem.GetMapSize(),
                (msg) => { Log.DEBUG(`NPC ${index}: ${msg}`) });
        });
    }
};

const NpcSystemInstance = new NpcSystem();

module.exports = NpcSystemInstance;

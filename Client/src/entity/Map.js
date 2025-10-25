const Entity = require("../base/Entity");
const Block = require("./Block");
const PositionCmpt = require("../component/PositionCmpt");
const AssetSystemInstance = require("../system/AssetSystem");
const Macro = require("../base/Macro");
const Log = require("../base/Log");

class Map extends Entity {
    constructor(size) {
        super();
        this.size = size;
        this.blocks = {};
        this.threeScene = null;
    }

    Destroy() {
        super.Destroy();
    }

    // 初始化地图传入Three.js场景
    Init(scene) {
        this.threeScene = scene;
    }

    GetBlockKey(x, y, z) {
        return `${x},${y},${z}`;
    }

    // 加入新的块到地图
    SetBlock(blockObj) {
        const x = blockObj.GetComponent(PositionCmpt).GetX();
        const y = blockObj.GetComponent(PositionCmpt).GetY();
        const z = blockObj.GetComponent(PositionCmpt).GetZ();
        const key = this.GetBlockKey(x, y, z);
        this.blocks[key] = blockObj;
        // 将块加入到目标场景中
        this.blocks[key].SddToScene(this.threeScene);
    }

    AddNewBlock(x, y, z, blockType, material) {
        let newBlock = new Block(x,
            y,
            z,
            blockType,
            material);
        this.SetBlock(newBlock);
    }

    // 获取地图中的某个Block
    GetBlock(x, y, z) {
        const key = this.GetBlockKey(x, y, z);
        return this.blocks[key] || null;
    }

    GetBlocks() {
        return this.blocks;
    }

    // 从地图中删除某个块
    RemoveBlock(x, y, z) {
        const key = this.GetBlockKey(x, y, z);
        if (this.blocks[key]) {
            // 从场景中移除
            this.blocks[key].RemoveFromScene(this.threeScene);
            this.blocks[key].Destroy();
            // 从地图移除
            delete this.blocks[key];
        }
    }

    // 初始化基础地面
    InitTerrain() {
        Log.DEBUG("Map.InitTerrain()");
        for (let x = 0; x < this.size; ++x) {
            for (let z = 0; z < this.size; ++z) {
                let newTerrainBlock = new Block(x,
                    0,
                    z,
                    Macro.MaterialNameMacro.DIRT_TERRAIN,
                    AssetSystemInstance.GetMaterial(Macro.MaterialNameMacro.DIRT_TERRAIN));
                this.SetBlock(newTerrainBlock);
            }
        }
    }

    // 清空地图所有块
    ClearAllBlocks() {
        Object.keys(this.blocks).forEach(key => {
            this.blocks[key].Destroy();
            this.blocks[key].RemoveFromScene(this.threeScene);
        });
        this.blocks = {};
    }

};

module.exports = Map;

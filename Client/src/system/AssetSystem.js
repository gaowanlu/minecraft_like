const Macro = require("../base/Macro");
const THREE = require('three');
const GameSystem = require("./GameSystem");
const Log = require("../base/Log");

class AssetSystem {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.materials = {};
        this.textures = {};
        // 用于记录管理的textures是否全部加载完毕
        this.texturesLoaded = false;
    }

    IsLoadedOK() {
        return this.texturesLoaded;
    }

    LoadAssets() {
        return new Promise((resolve, reject) => {
            let loadedCount = 0;

            const resources = [
                { name: Macro.TextureNameMacro.GRASS_TOP, path: 'assets/grass_block_top.png' },
                { name: Macro.TextureNameMacro.GRASS_SIDE, path: 'assets/grass_block_side.png' },
                { name: Macro.TextureNameMacro.DIRT, path: 'assets/dirt.png' }
            ];

            const onLoad = (textureName, texture) => {
                Log.DEBUG(`${textureName} texture loaded`);
                loadedCount++;
                if (loadedCount === resources.length) {
                    this.texturesLoaded = true;
                    // 当textxture加载完成后，开始初始化材质
                    this.InitializeMaterials();
                    resolve();
                }
            };

            const onError = (textureName, error) => {
                Log.DEBUG(`Error loading ${textureName} texture: ${err.message}`);
                reject(err);
            };

            for (let resource of resources) {
                this.textures[resource.name] = this.textureLoader.load(resource.path,
                    (texture) => onLoad(resource.name, texture),
                    undefined,
                    (err) => onError(resource.name, err)
                )
            }

            Object.values(this.textures).forEach(texture => {
                // 纹理放大过滤器 THREE.NearestFilter适合像素风
                texture.magFilter = THREE.NearestFilter;
                // 纹理缩小过滤器
                texture.minFilter = THREE.NearestFilter;
            });
        });
    }

    InitializeMaterials() {
        this.materials[Macro.MaterialNameMacro.GRASS_TERRAIN] = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
        this.materials[Macro.MaterialNameMacro.DIRT_TERRAIN] = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        this.materials[Macro.MaterialNameMacro.TEXTURED_GRASS] = new THREE.MeshLambertMaterial({ map: this.textures[Macro.TextureNameMacro.GRASS_SIDE] });
        this.materials[Macro.MaterialNameMacro.TEXTURED_DIRT] = new THREE.MeshLambertMaterial({ map: this.textures[Macro.TextureNameMacro.DIRT] });
        this.materials[Macro.MaterialNameMacro.TEXTURED_STONE] = new THREE.MeshLambertMaterial({ map: this.textures[Macro.TextureNameMacro.GRASS_TOP] });
        this.materials[Macro.MaterialNameMacro.OUTLINE] = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        this.materials[Macro.MaterialNameMacro.NPC] = new THREE.LineBasicMaterial({ color: 0xff0000 });
    }

    GetMaterial(type) {
        if (!this.materials[type]) {
            console.error("no such material: " + type);
        }
        return this.materials[type];
    }
};

const AssetSystemInstance = new AssetSystem();

module.exports = AssetSystemInstance;

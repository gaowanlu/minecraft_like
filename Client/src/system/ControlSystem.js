const THREE = require('three');
const Log = require("../base/Log");
const Macro = require('../base/Macro');
const MapSystem = require("./MapSystem");
const AssetSystem = require('./AssetSystem');
const GameStatus = require("../base/GameStatus");

class ControlSystem {
    constructor() {
        // 初始化键盘输入状态对象，记录按下的键（键码: true/false）
        this.keys = {};
        // 创建 Three.js Raycaster 对象，用于射线检测（检测玩家视角与方块的交点）
        this.raycaster = new THREE.Raycaster();
        // 设置射线检测的最大距离为 5 个单位
        this.raycaster.far = 5;
        // 初始化鼠标位置为 (0, 0)，用于射线检测（屏幕坐标，范围 [-1, 1]）
        this.mouse = new THREE.Vector2(0, 0);
        // 初始化当前高亮模型为 null（用于方块高亮效果）
        this.currentOutline = null;
        // 初始化破坏状态为 false，表示当前未在破坏方块
        this.isBreaking = false;

        this.onMouseMoveCallback = null;

        // 设置默认选择的方块类型为 'dirt'（泥土）
        this.selectedBlockType = Macro.MaterialNameMacro.TEXTURED_DIRT;
        // 设置事件监听器，处理键盘、鼠标等输入
        this.SetupEventListeners();
    }

    Init(onMouseMoveCallback) {
        Log.DEBUG("ControlSystem.Init()");
        this.onMouseMoveCallback = onMouseMoveCallback;
    }

    OnGameStart() {
        Log.DEBUG("ControlSystem.OnGameStart()");
    }

    OnGameExit() {
        Log.DEBUG("ControlSystem.OnGameExit()");
    }

    OnMainLoop() {
        // Log.DEBUG("ControlSystem.OnMainLoop()");

        this.UpdateBlockHighlight();
    }

    SetBlockType(type) {
        this.selectedBlockType = type;
        Log.ERROR(`Block type changed to: ${type}`);
    }

    GetKeys() {
        return this.keys;
    }

    // 方法：设置事件监听器，处理键盘、鼠标输入和指针锁定
    SetupEventListeners() {
        // 监听键盘按下事件
        document.addEventListener('keydown', (e) => {
            // 如果游戏未运行，忽略事件
            if (!GameStatus.GetIsRunning()) return;
            // 记录按下的键（键码设为 true）
            this.keys[e.code] = true;
            // 输出调试信息，记录按下的键码
            Log.DEBUG(`Key pressed: ${e.code}`);
        });

        // 监听键盘释放事件
        document.addEventListener('keyup', (e) => {
            // 如果游戏未运行，忽略事件
            if (!GameStatus.GetIsRunning()) return;
            // 记录释放的键（键码设为 false）
            this.keys[e.code] = false;
        });

        // 监听鼠标右键（上下文菜单）事件
        document.addEventListener('contextmenu', (e) => {
            // 如果游戏运行，阻止默认右键菜单（避免干扰游戏操作）
            if (GameStatus.GetIsRunning()) e.preventDefault();
        });

        // 监听鼠标按下事件（左键或右键）
        document.addEventListener('mousedown', (e) => {
            // 如果游戏未运行或正在破坏方块，忽略事件
            if (!GameStatus.GetIsRunning() || this.isBreaking) return;

            // 设置射线起点为玩家相机，方向为鼠标位置（屏幕中心）
            this.raycaster.setFromCamera(this.mouse, MapSystem.GetCamera());

            // 获取所有方块的网格对象，执行射线检测
            const intersects = this.raycaster.intersectObjects(Object.values(MapSystem.GetMap().GetBlocks()).map(b => b.mesh));

            // 如果射线击中方块
            if (intersects.length > 0) {
                // 获取第一个交点（最近的方块）
                const intersect = intersects[0];
                // 获取被击中方块的位置
                const pos = intersect.object.position;

                // 输出调试信息，记录击中的方块位置
                Log.DEBUG(`Raycast hit block at: x=${pos.x}, y=${pos.y}, z=${pos.z}`);

                // 左键点击（button === 0）：破坏方块
                if (e.button === 0) {
                    // 设置破坏状态为 true，防止重复触发
                    this.isBreaking = true;
                    // 延迟 300ms 后移除方块，模拟破坏动画
                    setTimeout(() => {
                        // 移除地图中指定位置的方块（取整坐标）
                        MapSystem.GetMap().RemoveBlock(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));

                        // 重置破坏状态
                        this.isBreaking = false;
                    }, 300);
                    // 右键点击（button === 2）：放置方块
                } else if (e.button === 2) {
                    // 获取交点所在面的法向量（指向外部）
                    const normal = intersect.face.normal;
                    // 计算新方块位置：击中位置 + 法向量（放置在击中面旁）
                    const newPos = pos.clone().add(normal);
                    // 取整新位置坐标
                    const x = Math.floor(newPos.x);
                    const y = Math.floor(newPos.y);
                    const z = Math.floor(newPos.z);
                    // 检查目标位置是否为空（无方块）
                    if (!MapSystem.GetMap().GetBlock(x, y, z)) {
                        // 在目标位置放置新方块，使用当前选择的方块类型和对应材质
                        MapSystem.GetMap().AddNewBlock(x, y, z, this.selectedBlockType, AssetSystem.GetMaterial(this.selectedBlockType));
                        // 输出调试信息，记录放置的方块类型和位置
                        Log.DEBUG(`Placed block (${this.selectedBlockType}) at: x=${x}, y=${y}, z=${z}`);
                    }
                }
            } else {
                // 如果未击中方块，输出调试信息
                Log.DEBUG('No block hit by raycaster');
            }
        });

        // 监听鼠标点击事件（用于请求指针锁定）
        document.addEventListener('click', (e) => {
            // 如果游戏未运行或点击目标不是渲染器画布，忽略事件
            if (!GameStatus.GetIsRunning() || e.target !== MapSystem.GetRenderer().domElement) return;
            // 请求指针锁定，锁定鼠标以支持第一人称视角控制
            MapSystem.GetRenderer().domElement.requestPointerLock();
        });

        // 监听指针锁定状态变化
        document.addEventListener('pointerlockchange', () => {
            // 如果游戏未运行，忽略事件
            if (!GameStatus.GetIsRunning()) return;

            // 检查指针是否锁定在渲染器画布上
            // 更新 UI 调试文本，提示玩家当前状态
            // this.Game.ui.SetDebugText(document.pointerLockElement === this.Game.renderer.domElement
            //     ? 'Pointer locked - Use WASD to move'
            //     : 'Click to lock pointer');
        });

        // 监听鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            // 如果游戏未运行或指针未锁定，忽略事件
            if (!GameStatus.GetIsRunning() || document.pointerLockElement !== MapSystem.GetRenderer().domElement) {
                return;
            }

            // 调用玩家对象的 updateRotation 方法，更新视角旋转（俯仰和偏航）
            if (this.onMouseMoveCallback) {
                this.onMouseMoveCallback(e);
            }

        });
    }

    // 方法：更新方块高亮效果
    UpdateBlockHighlight() {
        // 如果当前有高亮模型，先从场景中移除
        if (this.currentOutline) {
            MapSystem.GetScene().remove(this.currentOutline);
            this.currentOutline = null;
        }
        // 设置射线起点为玩家相机，方向为鼠标位置（屏幕中心）
        this.raycaster.setFromCamera(this.mouse, MapSystem.GetCamera());

        // 获取所有方块的网格对象，执行射线检测
        const intersects = this.raycaster.intersectObjects(Object.values(MapSystem.GetMap().GetBlocks()).map(b => b.mesh));

        // 如果射线击中方块
        if (intersects.length > 0) {
            // Log.ERROR("有击中方块");

            // 获取击中方块的位置
            const pos = intersects[0].object.position;
            // 创建高亮方块的几何体（略大于 1x1x1，以包裹目标方块）
            const geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
            // 创建高亮模型，使用资源管理器中的高亮材质
            this.currentOutline = new THREE.Mesh(geometry, AssetSystem.GetMaterial(Macro.MaterialNameMacro.OUTLINE));
            // 设置高亮模型位置，与目标方块对齐
            this.currentOutline.position.copy(pos);
            // 将高亮模型添加到场景中
            MapSystem.GetScene().add(this.currentOutline);
        } else {
            // Log.ERROR("未击中方块");
        }
    }
};

const ControlSystemInstance = new ControlSystem();

module.exports = ControlSystemInstance;

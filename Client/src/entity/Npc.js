const Entity = require("../base/Entity");
const PositionCmpt = require("../component/PositionCmpt");
const THREE = require("three");
const VelocityCmpt = require("../component/VelocityCmpt");

class Npc extends Entity {

    // 构造函数：初始化 NPC 的位置、可视化模型、速度和移动计时器
    // 参数：x, z（水平坐标），scene（Three.js 场景），material（线条材质）
    constructor(x, z, scene, material) {
        super();
        // 设置 NPC 初始位置为 (x, 1, z)
        // y=1 表示 NPC 固定在地面（y=1 的高度)
        this.positionCmpt = new PositionCmpt(x, 1, z);
        this.AddComponent(this.positionCmpt);
        this.velocityCmpt = new VelocityCmpt();
        this.AddComponent(this.velocityCmpt);

        // 创建一个 Three.js Group 对象，用于组织 NPC 的可视化模型
        this.group = new THREE.Group();

        // 为 Group 设置唯一名称，格式为 "npc_x_z"，便于调试和查找
        this.group.name = `npc_${x}_${z}`;

        // 定义 NPC 的几何形状：使用线段（LineSegments）表示一个简单的 3D 模型
        // points 数组定义了线段的顶点，形成一个类似立方体或框架的形状
        const points = [
            new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0, 1.5, 0), // 中心垂直线（底部到顶部）
            new THREE.Vector3(-0.1, 1.5, -0.1), new THREE.Vector3(0.1, 1.5, -0.1), // 顶部矩形边
            new THREE.Vector3(0.1, 1.5, -0.1), new THREE.Vector3(0.1, 1.5, 0.1), // 顶部矩形边
            new THREE.Vector3(0.1, 1.5, 0.1), new THREE.Vector3(-0.1, 1.5, 0.1), // 顶部矩形边
            new THREE.Vector3(-0.1, 1.5, 0.1), new THREE.Vector3(-0.1, 1.5, -0.1), // 顶部矩形边
            new THREE.Vector3(-0.1, 1.2, 0), new THREE.Vector3(0.1, 1.2, 0), // 中间水平线
            new THREE.Vector3(-0.1, 0.5, 0), new THREE.Vector3(-0.1, 0, 0), // 左侧垂直线
            new THREE.Vector3(0.1, 0.5, 0), new THREE.Vector3(0.1, 0, 0) // 右侧垂直线
        ];

        // 创建 BufferGeometry，从 points 数组生成线段的几何体
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // 创建 LineSegments 对象，使用传入的材质（material）渲染线段
        const line = new THREE.LineSegments(geometry, material);

        // 将线段模型添加到 Group 中，组成 NPC 的可视化表示
        this.group.add(line);

        // 设置 Group 的位置为 (x, 1, z)，与 NPC 位置同步
        this.group.position.set(x, 1, z);

        // 将 Group 添加到 Three.js 场景中，使 NPC 模型可见
        scene.add(this.group);

        // 初始化移动计时器，随机值为 1 到 3 秒，用于控制 NPC 移动 Ascent 随机移动
        this.moveTimer = Math.random() * 2 + 1;

        // 设置 NPC 移动速度为 0.05 单位每帧
        this.speed = 0.05;
    }

    Destroy() {
        super.Destroy();
    }

    // 方法：检查 NPC 是否可以移动到指定位置 (x, z)
    // 参数：x, z（目标坐标），map（游戏世界地图），worldSize（世界边界大小）
    CanMoveTo(x, z, map, worldSize) {
        // 将目标坐标取整，转换为格子坐标（游戏世界以整数格子划分）
        const checkX = Math.floor(x);
        const checkZ = Math.floor(z);

        // 检查目标位置 (checkX, 1, checkZ) 是否有方块
        // y=1 表示检查地面高度的方块
        const block = map.GetBlock(checkX, 1, checkZ);

        // 检查是否超出世界边界或有方块阻挡
        // x, z 的范围限制在 [0.1, worldSize - 0.1]，避免 NPC 移出世界
        if (x < 0.1 || x >= worldSize - 0.1 || z < 0.1 || z >= worldSize - 0.1 || block) {
            // 如果超出边界或有方块，返回 false（不可移动）
            return false;
        }

        // 否则返回 true（可移动）
        return true;
    }

    // 方法：从场景中移除 NPC
    // 参数：scene（Three.js 场景）
    Remove(scene) {
        // 从场景中移除 NPC 的 Group 对象，删除其可视化模型
        scene.remove(this.group);
    }

    // 方法：更新 NPC 的状态（每帧调用）
    // 参数：map（地图），worldSize（世界大小），debugCallback（调试回调函数）
    Update(map, worldSize, debugCallback) {
        // 减少移动计时器（假设游戏以 60 帧/秒运行，1/60 秒每帧）
        this.moveTimer -= 1 / 60;

        let velocity = this.velocityCmpt.GetThreeVelocity();

        // 当计时器小于等于 0 时，随机生成新的移动速度
        if (this.moveTimer <= 0) {
            // 随机速度：x 和 z 分量在 [-speed, speed] 范围内，y 分量为 0（NPC 仅在地面移动）
            velocity.set(
                (Math.random() - 0.5) * 2 * this.speed, // 随机 x 速度（-0.05 到 0.05）
                0, // y 速度固定为 0
                (Math.random() - 0.5) * 2 * this.speed // 随机 z 速度（-0.05 到 0.05）
            );
            // 重置计时器为随机值（1 到 3 秒），控制下次速度更新的时间
            this.moveTimer = Math.random() * 2 + 1;
        }

        // 计算新位置：当前位置加上速度向量
        const newPos = this.positionCmpt.GetThreePosition().clone().add(velocity);
        let position = this.positionCmpt.GetThreePosition();

        // 检查是否可以移动到新位置
        if (this.CanMoveTo(newPos.x, newPos.z, map, worldSize)) {
            // 如果可移动，更新 NPC 的 x 和 z 坐标
            this.positionCmpt.SetX(newPos.x);
            this.positionCmpt.SetZ(newPos.z);

            // 限制 NPC 位置在世界边界内（[0.1, worldSize - 0.1]）
            position.x = Math.max(0.1, Math.min(worldSize - 0.1, position.x));
            position.z = Math.max(0.1, Math.min(worldSize - 0.1, position.z));

            // 更新 Group 的位置，与 NPC 位置同步
            this.group.position.set(position.x, 1, position.z);

            // 输出调试信息：记录 NPC 移动到的位置，保留两位小数
            // debugCallback(`NPC moved to: x=${position.x.toFixed(2)}, y=1, z=${position.z.toFixed(2)}`);
        }
    }
};

module.exports = Npc;

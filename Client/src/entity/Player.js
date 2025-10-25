const Entity = require("../base/Entity");
const THREE = require("three");
const PositionCmpt = require("../component/PositionCmpt");
const CameraCmpt = require("../component/CameraCmpt");
const VelocityCmpt = require("../component/VelocityCmpt");

class Player extends Entity {
    constructor(x, y, z, camera) {
        super();
        this.positionCmpt = new PositionCmpt(x, y, z); // 初始化位置组件
        this.AddComponent(this.positionCmpt);
        this.cameraCmpt = new CameraCmpt(camera); // 初始化相机组件
        this.AddComponent(this.cameraCmpt);
        this.velocityCmpt = new VelocityCmpt(); // 初始化速度组件
        this.AddComponent(this.velocityCmpt);
        this.height = 1.8; // 玩家高度
        this.width = 0.4; // 玩家宽度
        this.speed = 0.0717; // 移动速度
        this.jumpStrength = 0.2; // 跳跃力度
        this.gravity = -0.01; // 重力加速度
        this.targetRotation = { x: 0, y: 0 }; // 目标旋转角度
        this.currentRotation = { x: 0, y: 0 }; // 当前旋转角度
        this.rotationSmoothing = 0.5; // 提高平滑因子，减少旋转延迟
        this.mouseSensitivity = 0.005; // 提高鼠标灵敏度以增强响应
        this.cameraCmpt.SetPosition(this.positionCmpt.GetThreePosition()); // 设置相机初始位置
        this.UpdateCameraPositionToPlayerPosition();
    }

    // 设置玩家位置
    SetPosition(x, y, z) {
        this.positionCmpt.GetThreePosition().set(x, y, z);
    }

    // 设置玩家速度
    SetVelocity(x, y, z) {
        this.velocityCmpt.SetVelocity(x, y, z);
    }

    // 设置目标旋转角度
    SetTargetRotation(x, y) {
        this.targetRotation.x = x;
        this.targetRotation.y = y;
    }

    // 设置当前旋转角度
    SetCurrentRotation(x, y) {
        this.currentRotation.x = x;
        this.currentRotation.y = y;
    }

    // 更新相机位置与玩家位置同步
    UpdateCameraPositionToPlayerPosition() {
        this.cameraCmpt.SetPosition(this.positionCmpt.GetThreePosition());
    }

    // 销毁玩家对象
    Destroy() {
        super.Destroy();
    }

    // 检查玩家是否可以移动到指定位置（水平移动专用）
    CanMoveTo(x, y, z, map) {
        const head = Math.floor(y); // 检查头部位置
        const checkX = Math.floor(x);
        const checkZ = Math.floor(z);
        const headBlock = map.GetBlock(checkX, head, checkZ); // 检查头部方块
        // 仅检查头部是否有方块，脚下位置由垂直碰撞检测处理
        return !headBlock;
    }

    // 更新相机旋转
    UpdateRotation(event, debugCallbackFunc) {
        // 更新目标旋转角度
        this.targetRotation.y -= event.movementX * this.mouseSensitivity; // 更新水平旋转（偏航）
        this.targetRotation.x -= event.movementY * this.mouseSensitivity; // 更新垂直旋转（俯仰）
        // 限制垂直旋转角度在 [-π/2, π/2]，避免翻转
        this.targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotation.x));
        // 输出调试信息
        const pitchDeg = (this.targetRotation.x * 180 / Math.PI).toFixed(1);
        const yawDeg = (this.targetRotation.y * 180 / Math.PI).toFixed(1);
        if (debugCallbackFunc) {
            debugCallbackFunc(`相机旋转: 俯仰 = ${pitchDeg}°, 偏航 = ${yawDeg}`);
        }
    }

    // 更新玩家状态
    Update(map, keys, debugCallbackFunc) {
        // 应用重力
        this.velocityCmpt.GetThreeVelocity().y += this.gravity;

        // 计算新位置（垂直方向）
        const newPos = this.positionCmpt.GetThreePosition().clone().add(this.velocityCmpt.GetThreeVelocity());

        // 检查脚下方块
        const feetY = Math.floor(newPos.y - this.height);
        const checkX = Math.floor(newPos.x);
        const checkZ = Math.floor(newPos.z);
        const blockBelow = map.GetBlock(checkX, feetY, checkZ);

        // 如果脚下有方块或到达地面，停止下落
        if (blockBelow || newPos.y <= this.height) {
            if (blockBelow) {
                // 站在方块顶部
                newPos.y = feetY + this.height + 1;
                this.velocityCmpt.GetThreeVelocity().y = 0;
                debugCallbackFunc(`站在方块上，y = ${feetY}`);
            } else if (newPos.y <= this.height) {
                // 强制保持在地面高度
                newPos.y = this.height;
                this.velocityCmpt.GetThreeVelocity().y = 0;
                debugCallbackFunc('玩家在地面上');
            }
        }

        // 更新玩家位置（垂直方向）
        this.positionCmpt.GetThreePosition().copy(newPos);

        // 跳跃逻辑：仅当站在地面或方块上时允许跳跃
        if (keys['Space'] && (blockBelow || this.positionCmpt.GetThreePosition().y <= this.height)) {
            this.velocityCmpt.GetThreeVelocity().y = this.jumpStrength;
            debugCallbackFunc('玩家跳跃');
        }

        // 处理水平移动
        const direction = new THREE.Vector3();
        if (keys['KeyW']) direction.z -= 1; // 前进
        if (keys['KeyS']) direction.z += 1; // 后退
        if (keys['KeyA']) direction.x -= 1; // 左移
        if (keys['KeyD']) direction.x += 1; // 右移
        if (direction.length() > 0) {
            direction.normalize();
            // 使用 targetRotation.y 计算移动方向，确保与视角同步
            const move = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.targetRotation.y);
            move.y = 0;
            move.multiplyScalar(this.speed);
            const movePos = this.positionCmpt.GetThreePosition().clone().add(move);
            // 检查水平移动是否可行
            if (this.CanMoveTo(movePos.x, this.positionCmpt.GetThreePosition().y, movePos.z, map)) {
                this.positionCmpt.GetThreePosition().x = movePos.x;
                this.positionCmpt.GetThreePosition().z = movePos.z;
                debugCallbackFunc(`移动到: x = ${movePos.x.toFixed(2)}, y = ${movePos.y.toFixed(2)}, z = ${movePos.z.toFixed(2)}`);
            } else {
                debugCallbackFunc(`碰撞在: x = ${Math.floor(movePos.x)}, y = ${Math.floor(this.positionCmpt.GetThreePosition().y - this.height)}, z = ${Math.floor(movePos.z)}`);
            }
        }

        // 更新当前旋转（平滑过渡）
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * this.rotationSmoothing;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * this.rotationSmoothing;

        // 使用平滑后的 currentRotation 更新相机旋转
        this.cameraCmpt.GetCamera().rotation.set(this.currentRotation.x, this.currentRotation.y, 0);
        this.cameraCmpt.GetCamera().position.copy(this.positionCmpt.GetThreePosition());
    }
}

module.exports = Player;

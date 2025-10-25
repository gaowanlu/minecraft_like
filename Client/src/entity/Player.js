const Entity = require("../base/Entity");
const THREE = require("three");
const PositionCmpt = require("../component/PositionCmpt");
const CameraCmpt = require("../component/CameraCmpt");
const VelocityCmpt = require("../component/VelocityCmpt");
class Player extends Entity {
    constructor(x, y, z, camera) {
        super();
        this.positionCmpt = new PositionCmpt(x, y, z);
        this.AddComponent(this.positionCmpt);
        this.cameraCmpt = new CameraCmpt(camera);
        this.AddComponent(this.cameraCmpt);
        this.velocityCmpt = new VelocityCmpt();
        this.AddComponent(this.velocityCmpt);
        this.height = 1.8;
        this.width = 0.4;
        this.speed = 0.0717;
        this.jumpStrength = 0.2;
        this.gravity = -0.01;
        this.targetRotation = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };
        // 提高平滑因子，加快旋转响应 
        this.rotationSmoothing = 0.3;
        // 鼠标灵敏度参数 
        this.mouseSensitivity = 0.002;
        // 设置相机位置 
        this.cameraCmpt.SetPosition(this.positionCmpt.GetThreePosition());
        this.UpdateCameraPositionToPlayerPosition();
    }

    SetPosition(x, y, z) {
        this.positionCmpt.GetThreePosition().set(x, y, z);
    }

    SetVelocity(x, y, z) {
        this.velocityCmpt.SetVelocity(x, y, z);
    }

    SetTargetRotation(x, y) {
        this.targetRotation.x = x;
        this.targetRotation.y = y;
    }

    SetCurrentRotation(x, y) {
        this.currentRotation.x = x;
        this.currentRotation.y = y;
    }

    UpdateCameraPositionToPlayerPosition() {
        this.cameraCmpt.SetPosition(this.positionCmpt.GetThreePosition());
    }

    Destroy() {
        super.Destroy();
    }

    CanMoveTo(x, y, z, map) {
        const feet = Math.floor(y - this.height);
        const head = Math.floor(y);
        const checkX = Math.floor(x);
        const checkZ = Math.floor(z);
        const feetBlock = y > this.height + 0.1 ? map.GetBlock(checkX, feet, checkZ) : null;
        const headBlock = map.GetBlock(checkX, head, checkZ);
        if (feetBlock || headBlock) { return false; }
        return true;
    }

    UpdateRotation(event, debugCallbackFunc) {
        // 提高灵敏度，加快视角旋转 
        this.targetRotation.y -= event.movementX * this.mouseSensitivity;
        this.targetRotation.x -= event.movementY * this.mouseSensitivity;
        this.targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotation.x));
        const pitchDeg = (this.targetRotation.x * 180 / Math.PI).toFixed(1);
        const yawDeg = (this.targetRotation.y * 180 / Math.PI).toFixed(1);
        if (debugCallbackFunc) {
            debugCallbackFunc(`Camera rotation: pitch = ${pitchDeg}°, yaw = ${yawDeg}`);
        }
    }

    Update(map, keys, debugCallbackFunc) {

        this.velocityCmpt.GetThreeVelocity().y += this.gravity;
        // 速度作用在物体上
        this.positionCmpt.GetThreePosition().add(this.velocityCmpt.GetThreeVelocity());

        // 自由落体
        if (this.positionCmpt.GetThreePosition().y < this.height) {
            this.positionCmpt.GetThreePosition().y = this.height;
            this.velocityCmpt.GetThreeVelocity().y = 0;
        }

        // 跳跃逻辑：仅当玩家在地面上时允许跳跃 
        if (keys['Space'] && this.GetComponent(PositionCmpt).GetThreePosition().y <= this.height) {
            this.velocityCmpt.GetThreeVelocity().y = this.jumpStrength;
            debugCallbackFunc('Player jumped');
        }
        if (keys['Space']) {
            this.velocityCmpt.GetThreeVelocity().y = this.jumpStrength;
            debugCallbackFunc('Player jumped');
        }
        const direction = new THREE.Vector3();
        if (keys['KeyW']) direction.z -= 1;
        if (keys['KeyS']) direction.z += 1;
        if (keys['KeyA']) direction.x -= 1;
        if (keys['KeyD']) direction.x += 1;
        if (direction.length() > 0) {
            direction.normalize();
            // 使用 targetRotation.y 替代 currentRotation.y，移除平滑延迟
            const move = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.targetRotation.y);
            move.y = 0; move.multiplyScalar(this.speed);
            const newPos = this.positionCmpt.GetThreePosition().clone().add(move);
            if (this.CanMoveTo(newPos.x, this.positionCmpt.GetThreePosition().y, newPos.z, map)) {
                this.positionCmpt.GetThreePosition().x = newPos.x;
                this.positionCmpt.GetThreePosition().z = newPos.z;
                debugCallbackFunc(`Move allowed to: x = ${newPos.x.toFixed(2)}, y = ${newPos.y.toFixed(2)}, z = ${newPos.z.toFixed(2)}`);
            } else {
                debugCallbackFunc(`Collision at: x = ${Math.floor(newPos.x)}, y = ${Math.floor(newPos.y - this.height)}, z = ${Math.floor(newPos.z)}`);
            }
        }
        // 提高平滑因子，减少旋转延迟 
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * this.rotationSmoothing;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * this.rotationSmoothing;
        // 更新相机旋转 
        this.cameraCmpt.GetCamera().rotation.set(this.currentRotation.x, this.currentRotation.y, 0);
        this.cameraCmpt.GetCamera().position.copy(this.positionCmpt.GetThreePosition());
    }
};


module.exports = Player;

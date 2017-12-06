function Components(engine) {
	return {
		Player(config) {
			return engine.Creation.compose(
				{
					health: 10,
					worldPos: [0, 0],
					graphic: null,
					positionGraphic(cameraPos) {
						this.graphic.pos = [
							this.worldPos[0] + cameraPos[0],
							this.worldPos[1] + cameraPos[1]
						];
					},
					group: null,
					walking: {
						north: false,
						east: false,
						south: false,
						west: false
					},
					moveSpeed: 2,
					move() {
						if (this.walking.north) this.worldPos[1] -= this.moveSpeed;		
						if (this.walking.east) this.worldPos[0] -= this.moveSpeed;		
						if (this.walking.south) this.worldPos[1] += this.moveSpeed;		
						if (this.walking.west) this.worldPos[0] += this.moveSpeed;		
					}
				},
				config
			);
		},
		Camera(config) {
			return engine.Creation.compose(
				{
					worldPos: [0, 0],
					size: [10, 10],
					trackedObject: null,
					getPos() {
						return [
							this.worldPos[0] + this.size[0],
							this.worldPos[1] + this.size[1]
						];
					},
					update() {
						if (this.trackedObject) {
							this.worldPos = [
								this.trackedObject.worldPos[0] * -1,
								this.trackedObject.worldPos[1] * -1
							];
						}	
					}	
				},
				config
			);
		},
		World(config) {
			return engine.Creation.compose(
				engine.Creation.simpleContainer(),
				{
					camera: null,
					update() {
						this.camera.update();
						let cameraPos = this.camera.getPos();
						this.contents.forEach(item => {
							item.positionGraphic(cameraPos);
						});
					}
				},
				config
			);
		},
		logicFunction(config) {
			return engine.Creation.compose(
				engine.Creation.simpleContainer(),
				{
					lastTick: 0,
					currentTick: 0,
					updateTick: 10,
					func: undefined,
					update(tick) {
						if (this.currentTick >= this.updateTick) {
							if (this.func) this.func();
							this.currentTick = 0;
						}
						this.currentTick += tick - this.lastTick;
						this.lastTick = tick;
					}
				},
				config
			);
		},
		rectangleRot(config) {
			return engine.Creation.compose(
				engine.Graphic.rectangle(),
				{
					updateGraphics: function() {
						engine.Graphic.contextTranslateRotate(this.context, [this.pos[0], this.pos[1]], this.rotation);
						this.context.beginPath();
						this.context.rect(-this.area[0]/2, -this.area[1]/2, this.area[0], this.area[1]);
						this.context.globalAlpha = this.alpha;
						this.context.fillStyle = this.color;
						this.context.fill();
						engine.Graphic.contextReset(this.context);
					}
				},
				config
			);
		},
		PlayerGroup(config) {
			return engine.Creation.compose(
				engine.Creation.namedContainer(),
				{

				},
				config
			);
		}
	}
}

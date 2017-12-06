$(function() { main(); });

function main() {
	var engine = Engine();

	// Create the layerContainer (AKA - Graphic controller)
	var layerContainer = engine.Graphic.layerContainer({
		area: [640, 480],
		container: document.getElementById("canvasDiv")
	});

	layerContainer.add(engine.Graphic.layer(), "draw");

	// eventGroup
	var eventGroup = engine.Event.eventGroup();
	var mouseGroup = engine.Event.eventGroup();

	// Create input and an eventContext to handle it.
	var input = engine.Input.getInput();
	input.addListeners();

	// Different game pieces written on the fly
	var components = Components(engine);

	// Create a playerGroup
	var world = components.World({
		camera: components.Camera({
			size: [
				layerContainer.area[0]/2,
				layerContainer.area[1]/2
			]
		})	
	});
	
	// Square move & cursor
	var moveLogic = components.logicFunction({func: () => {
		world.contents.forEach((player) => {
			if (player.move) player.move();
		});
	}});
	var faceCursor = components.logicFunction({updateTick: 10});

	// Data object
	var DATA = {
		layerContainer,
		screenArea: layerContainer.area,
		eventGroup,
		mouseGroup,
		input,
		components,
		world,
		mainLoop: null,
		engine,
		faceCursor
	};

	content(DATA);

	// Make the loop
	DATA.mainLoop = DATA.engine.Util.loop({func:function(frame) {
		moveLogic.update(frame.time);	
		faceCursor.update(frame.time);
		eventGroup.update(DATA.input.getInput());
		world.update();
		layerContainer.update();
	}, fps:60, useRAF:true});

	// Kick off the loop
	DATA.mainLoop.start();
	
}

function content(data) {
	var layer = data.layerContainer.get("draw"),
		engine = data.engine,
		input = data.input,
		world = data.world;

	player1 = data.components.Player({worldPos:[100, 100], graphic: createPlayerGraphic()});
	player2 = data.components.Player({worldPos:[200, 150], graphic: createPlayerGraphic()});

	
	layer.add(player1.graphic);
	layer.add(player2.graphic);

	world.add(player1); // "player");
	world.add(player2); // "hulk");
	
	world.camera.trackedObject = player1;
	
	player2.graphic.pos = [400, 400];
	player2.graphic.area = [20, 20];
	player2.graphic.color = "purple";

	function createPlayerGraphic() {
		return data.components.rectangleRot({
			pos:[100, 100],
			area: [10, 10],
			rotation: Math.PI/7,
			color: "orange"
		});
	}

	data.eventGroup
	.add(engine.Event.event({ eatOnSuccess: true, trigger: 87 }) // W
		.add(() => { player1.walking.north = true; }))
	.add(engine.Event.lateEvent( { trigger: 87 })
		.add(keys => { player1.walking.north = false; }))

	.add(engine.Event.event({ eatOnSuccess: true, trigger: 65 }) // A
		.add(() => { player1.walking.east = true; }))
	.add(engine.Event.lateEvent( { trigger: 65 })
		.add(keys => { player1.walking.east = false; }))

	.add(engine.Event.event({ eatOnSuccess: true, trigger: 83 }) // S
		.add(() => { player1.walking.south = true; }))
	.add(engine.Event.lateEvent( { trigger: 83 })
		.add(keys => { player1.walking.south = false; }))

	.add(engine.Event.event({ eatOnSuccess: false, trigger: 68 }) // D
		.add(() => { player1.walking.west = true; }))
	.add(engine.Event.lateEvent( { trigger: 68 })
		.add(keys => { player1.walking.west = false; }))

	data.faceCursor.func = () => {
		var mousePos = data.input.getMouse();
		player1.graphic.rotation = engine.Math.getAngle(player1.graphic.pos, mousePos);
	}
}

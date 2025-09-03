import { Application, Graphics, Text, TextStyle } from "pixi.js";

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: "#1099bb", resizeTo: window });

    // Append the application canvas to the document body
    document.getElementById("pixi-container").appendChild(app.canvas);

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

    const textStyle = new TextStyle({
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff
    });

    // Add score text
    let score = 0, multiplier = 1;
    const scoreText = new Text({
        text: `Score: ${score}`,
        style: textStyle,
    });

    const multiplierText = new Text({
        text: `Multiplier: x${multiplier.toFixed(2)}`,
        style: textStyle
    });

    scoreText.x = scoreText.y = multiplierText.x = 10;
    multiplierText.y = 40;

    app.stage.addChild(scoreText);
    app.stage.addChild(multiplierText);

    app.ticker.add((ticker) => {
        if (multiplier === 1) return;
        multiplier -= 0.01 * ticker.deltaTime;
        if (multiplier < 1) multiplier = 1;
        multiplierText.text = `Multiplier: x${multiplier.toFixed(2)}`;
    });

    // Function to add a circle
    function addCircle(radius, x, y, appearTime, disappearTime, color) {
        const circle = new Graphics().circle(x, y, radius).fill(color);
        const corona = new Graphics()
            .circle(x, y, radius + 15).fill(color)
            .circle(x, y, radius + 10).cut();

        circle.eventMode = "static";
        circle.cursor = "pointer";

        // Set the pivot so it's in the center, and translate to position
        circle.pivot.set(x, y);
        corona.pivot.set(x, y);
        circle.x = corona.x = x;
        circle.y = corona.y = y;

        let timer = disappearTime + appearTime;
        let added = false;
        function time(ticker) {
            timer -= ticker.deltaTime / 10;
            if (timer <= disappearTime && !added) {
                app.stage.addChild(circle);
                app.stage.addChild(corona);
                added = true;
            }
            corona.scale.set(timer / 5 + 0.8);
            circle.alpha = corona.alpha = 1 - timer / 20;
            if (timer > 0) return;
            timer = 0;
            app.ticker.remove(time);
            circle.destroy();
            corona.destroy();
        }

        app.ticker.add(time);

        circle.on('pointerdown', () => {
            const addition = 10 / timer;

            score += Math.floor(addition * multiplier);
            scoreText.text = `Score: ${score}`;

            multiplier += Math.min(10, addition / 10);
            multiplierText.text = `Multiplier: ${multiplier.toFixed(2)}`;

            circle.scale.set(0.9);
        });
        app.stage.on('pointerup', () => {
            if (circle && circle.scale) circle.scale.set(1);
        });
    }

    const line = new Graphics()
        .moveTo(200, 200)
        .bezierCurveTo(200, 200, 500, 400, 500, 200)
        .stroke({ width: 100, color: 0x333333 })
        .circle(200, 200, 50).fill("0x333333")
        .circle(500, 200, 50).fill("0x333333");
    app.stage.addChild(line);

    // The slider should be able to be dragged along the path
    const slider = new Graphics()
        .circle(0, 0, 30)
        .fill("0xffff00");
    slider.pivot.set(0, 0);
    slider.x = 200;
    slider.y = 200;
    slider.eventMode = "static";
    slider.cursor = "pointer";
    app.stage.addChild(slider);

    let dragging = false;
    let t = 0; // Parameter from 0 to 1 along the Bézier curve

    function cubicBezier(t, p0, p1, p2, p3) {
        return p0 * (1 - t) ** 3 + 3 * (p1 * t * (1 - t) ** 2 + p2 * (1 - t) * t ** 2) + p3 * t ** 3;
    }

    slider.on('pointerdown', () => {
        dragging = true;
    });
    app.stage.on('pointerup', () => {
        dragging = false;
    });
    app.stage.on('pointermove', (event) => {
        if (!dragging) return;
        // Find the closest point on the Bézier curve to the current position
        let closestT = t;
        let closestDist = Infinity;
        for (let i = 0; i <= 100; i++) {
            const tt = i / 100;
            const dist = (cubicBezier(tt, 200, 200, 500, 500) - event.global.x) ** 2 +
                (cubicBezier(tt, 200, 200, 400, 200) - event.global.y) ** 2;
            if (dist >= closestDist) continue;
            closestDist = dist;
            closestT = tt;
        }
        t = closestT;
        slider.x = cubicBezier(t, 200, 200, 500, 500);
        slider.y = cubicBezier(t, 200, 200, 400, 200);
    });

    // Add initial circle

    //addCircle(50, 200, 200, 0, 10, "black");
})();
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

    // Add initial circle

    //addCircle(50, 200, 200, 0, 10, "black");
})();
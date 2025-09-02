import { Application, Graphics, Text } from "pixi.js";

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: "#1099bb", resizeTo: window });

    // Append the application canvas to the document body
    document.getElementById("pixi-container").appendChild(app.canvas);

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

    // Add score text
    let score = 0;
    const scoreText = new Text(`Score: ${score}`, {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0xffffff,
    });
    scoreText.x = 10;
    scoreText.y = 10;
    app.stage.addChild(scoreText);

    function addCircle(radius, x, y, appearTime, disappearTime) {
        const circle = new Graphics().circle(x, y, radius).fill("#000000");

        circle.eventMode = "static";
        circle.cursor = "pointer";

        // Set the pivot so it's in the center of the circle, and translate the circle back to its position
        circle.pivot.set(x, y);
        circle.x = x;
        circle.y = y;

        const corona = new Graphics()
            .circle(x, y, radius + 15).fill("#000000")
            .circle(x, y, radius + 10).cut();
        corona.pivot.set(x, y);
        corona.x = x;
        corona.y = y;


        let timer = disappearTime + appearTime;
        let added = false;
        function time(ticker) {
            timer -= ticker.deltaTime / 10;
            if (timer <= disappearTime && !added) {
                app.stage.addChild(circle);
                app.stage.addChild(corona);
                added = true;
            }
            corona.scale.set(timer / 5 + 0.8, timer / 5 + 0.8);
            circle.alpha = corona.alpha = 1 - timer / 20;
            if (timer > 0) return;
            timer = 0;
            app.ticker.remove(time);
            circle.destroy();
            corona.destroy();
        }

        app.ticker.add(time);

        circle.on('pointerdown', () => {
            score += Math.floor(10 / timer)
            scoreText.text = `Score: ${score}`;
            circle.scale.set(0.9, 0.9);
        });
        app.stage.on('pointerup', () => {
            if (circle && circle.scale) circle.scale.set(1, 1);
        });
      }

      addCircle(50, 200, 200, 0, 10);
})();

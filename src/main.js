import { Application, Graphics } from "pixi.js";

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: "#1099bb", resizeTo: window });

    // Append the application canvas to the document body
    document.getElementById("pixi-container").appendChild(app.canvas);

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

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


        let timing = disappearTime + appearTime;
        let added = false;
        function time(ticker) {
            timing -= ticker.deltaTime / 10;
            if (timing <= disappearTime && !added) {
                app.stage.addChild(circle);
                app.stage.addChild(corona);
                added = true;
            }
            corona.scale.set(timing / 5 + 0.8, timing / 5 + 0.8);
            circle.alpha = corona.alpha = 1 - timing / 20;
            if (timing > 0) return;
            timing = 0;
            app.ticker.remove(time);
            circle.destroy();
            corona.destroy();
        }

        app.ticker.add(time);

        circle.on('pointerdown', () => {
            console.log(timing);
            circle.scale.set(0.9, 0.9);
        });
        app.stage.on('pointerup', () => {
            if (circle && circle.scale) circle.scale.set(1, 1);
        });
      }

      addCircle(50, 100, 100, 0, 10);
})();

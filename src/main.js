import { Application, Graphics, Text, TextStyle } from "pixi.js";

const BEZIER_STEPS = 64; // Number of steps to approximate the Bézier curve

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

    function addSlider(containerRadius, sliderRadius,
                       x0, y0, x1, y1, x2, y2, x3, y3,
                       appearTime, disappearTime, containerColor, sliderColor) {
        const container = new Graphics()
            .moveTo(x0, y0)
            .bezierCurveTo(x1, y1, x2, y2, x3, y3).stroke({ width: containerRadius * 2, color: containerColor })
            .circle(x0, y0, containerRadius).fill(containerColor)
            .circle(x3, y3, containerRadius).fill();

        const slider = new Graphics()
            .circle(0, 0, sliderRadius).fill(sliderColor);
        slider.pivot.set(0, 0);
        slider.x = x0;
        slider.y = y0;
        slider.eventMode = "static";
        slider.cursor = "pointer";

        let dragging = false;
        let t = 0; // Parameter from 0 to 1 along the Bézier curve

        function cubicBezier(t, p0, p1, p2, p3) { // Get bezier point at t
            const t2 = t * t;
            const t3 = t2 * t;
            return p0 - p0 * (t3 - 3 * (t2 - t)) + 3 * (p1 * (t + t3 - 2 * t2) + p2 * (t2 - t3)) + p3 * t3;
        }

        // Detect if we're dragging the slider
        slider.on('pointerdown', () => { dragging = true; });
        app.stage.on('pointerup', () => { dragging = false; });

        let timer = disappearTime + appearTime;
        let added = false;
        function time(ticker) {
            timer -= ticker.deltaTime / 10;
            if (timer <= disappearTime && !added) {
                app.stage.addChild(container);
                app.stage.addChild(slider);
                added = true;
            }
            if (timer > 0) return;
            timer = 0;
            app.ticker.remove(time);
            container.destroy();
            slider.destroy();
        }

        app.ticker.add(time);

        // On pointer move, if dragging, move the slider to the closest point on the Bézier curve
        app.stage.on('pointermove', (event) => {
            if (!dragging) return;

            // Find the closest point on the Bézier curve to the pointer position
            let closestT = t;
            let closestDist = Infinity;
            for (let i = 0; i <= BEZIER_STEPS; i++) {
                const tt = i / BEZIER_STEPS;
                const dist = (cubicBezier(tt, x0, x1, x2, x3) - event.global.x) ** 2 +
                    (cubicBezier(tt, y0, y1, y2, y3) - event.global.y) ** 2;
                if (dist >= closestDist) continue;
                closestDist = dist;
                closestT = tt;
            }

            // Only move if within the container and not on the same pos as before
            if (closestT === t || closestDist > containerRadius * containerRadius) return;

            // Move the slider accordingly
            t = closestT;
            slider.x = cubicBezier(t, x0, x1, x2, x3);
            slider.y = cubicBezier(t, y0, y1, y2, y3);
        });
    }

    addSlider(50, 30,
        200, 200, 200, 200,
        500, 400, 500, 200,
        0, 10,
        "0x333333", "0xffff00");

    // Add initial circle
    //addCircle(50, 200, 200, 0, 10, "black");
})();
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

  function addCircle(radius, x, y) {
      const circle = new Graphics().circle(x, y, radius).fill("#000000");

      circle.eventMode = "static";
      circle.cursor = "pointer";

      // Set the pivot so it's in the center of the circle, and translate the circle back to its position
      circle.pivot.set(x, y);
      circle.x = x
      circle.y = y

      circle.on('pointerdown', () => {
          circle.scale.set(0.5, 0.5);
      });
      app.stage.on('pointerup', () => {
          circle.scale.set(1, 1);
      });

      const corona = new Graphics()
          .circle(x, y, radius + 15).fill("#000000")
          .circle(x, y, radius + 10).cut();


      let timing = 10;
      function time(ticker) {
          timing -= ticker.deltaTime / 10;
          if (timing <= 0) {
              timing = 0;
              app.ticker.remove(time);
          }
      }

      app.ticker.add(time);
      app.stage.addChild(circle);
      app.stage.addChild(corona);
  }

  addCircle(50, 100, 100);
})();

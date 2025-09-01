import { Application, Graphics } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  const circle = new Graphics().circle(100, 100, 50).fill("#000000");

  circle.eventMode = "static";
  circle.cursor = "pointer";

  // Set the pivot so it's in the center of the circle, and translate the circle back to its position
  circle.pivot.set(circle.width, circle.height);
  circle.x = circle.x + circle.width / 2;
  circle.y = circle.y + circle.height / 2;

  circle.on('pointerdown', () => {
      circle.scale.set(0.5, 0.5);
  }, circle);

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', () => {
      circle.scale.set(1, 1);
  });

  app.stage.addChild(circle);

  let time = 0;
  app.ticker.add((ticker) => {
    time += ticker.deltaTime / 10;
    circle.alpha = Math.sin(time);
  });
})();

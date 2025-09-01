import { Application, Graphics } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  const circle = new Graphics().circle(50, 50, 50).fill("#000000");

  circle.eventMode = "static";
  circle.cursor = "pointer";

  circle.on('pointerdown', () => {
      circle.scale.set(0.5, 0.5);
  }, circle);

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', () => {
      circle.scale.set(1, 1);
  });

  app.stage.addChild(circle);
})();

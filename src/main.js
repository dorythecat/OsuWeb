import { Application, Graphics } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  const circle = new Graphics().circle(50, 50, 50).fill("#000000");

  app.stage.addChild(circle);
})();

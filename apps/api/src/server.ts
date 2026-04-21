import express from "express";
import routerSetup from "./routers";

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/v1", routerSetup());

app.listen(PORT, () => {
  console.log("app listening on port: ", PORT);
});

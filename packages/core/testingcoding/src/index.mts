import { Sakiko } from "@togawa-dev/sakiko";

const sakiko = new Sakiko({
    logLevel: "debug"
});

await sakiko.launch();

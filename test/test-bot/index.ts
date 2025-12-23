import { Milky } from "@togawa-dev/adapter-milky";
import { Sakiko } from "@togawa-dev/sakiko";

const sakiko = new Sakiko({
    logLevel: "debug",
    milky: {
        server: { baseUrl: "http://127.0.0.1:3000" }
    }
});

sakiko.load(new Milky());

await sakiko.launch();

import { Milky } from "@togawa-dev/adapter-milky";
import { Sakiko } from "@togawa-dev/sakiko";

const sakiko = new Sakiko({
    logLevel: "debug",
    milky: {
        server: {
            baseUrl: "http://192.168.1.8:3010",
            mode: "sse"
        },
        accessToken: "qaz000"
    }
});

sakiko.load(new Milky());

await sakiko.launch();
``;

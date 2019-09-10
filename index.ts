import {config} from "dotenv";
import * as path from "path"
import { ProducerSimulator } from "./kafka/producer-simulator";

let configPath = path.join(__dirname, ".env")
config({path: configPath});

let producerSim = new ProducerSimulator();
let delayStart = +process.env.DELAY_START_SEC || 0;
if(delayStart){
    console.log(`Delaying start for ${delayStart} seconds`);
}
setTimeout(()=>producerSim.init(),delayStart*1000);
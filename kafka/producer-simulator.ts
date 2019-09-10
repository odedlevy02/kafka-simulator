import { KafkaClient, HighLevelProducer,Producer } from "kafka-node"
import * as fs from "fs";
import * as dummyJson from "dummy-json"
import { totalmem } from "os";
export class ProducerSimulator {
    _producer: HighLevelProducer = null;
    _template = null;

    _totalSent = 0;
    constructor() {

    }

    init() {
        let bootstrapServer = process.env.KAFKA_BOOTSTRAP_SERVER;
        this._producer = this.initProducer(bootstrapServer);
        this._template = this.getTemplate()
    }

    getTemplate=()=>{
        let templatePath = process.env.TEMPLATE;
        let template = null;
        //if template was supplied use it else use default
        if(fs.existsSync(templatePath)){
            console.log("Loading template from " + templatePath);
            template = fs.readFileSync(templatePath, { encoding: 'utf8' });
        }else{
            console.log("Loading default template")
            template = fs.readFileSync("./default-template/data-template.hbs", { encoding: 'utf8' });
        }
        console.log(`using template: ${template}`)
        return template;
    }

    initMessageGenerator() {
        let topic = process.env.KAFKA_TOPIC;
        console.log("Starting message generator. Topic set to: " + topic);
        let numPerSeconds = +process.env.NUM_EVENTS_PER_SECOND || 1;
        let intervalMs = 1000.0;
        let numMessages = numPerSeconds;
        if (numPerSeconds > 0 && numPerSeconds < 1) {
            intervalMs = 1 / numPerSeconds * 1000 //if numPersocnds = 0.1 1/0.1 = 10 * 1000ms => 1 message each 10 seconds
            numMessages = 1;
        }
        console.log(`Interval set to :${intervalMs}. Num messages per interval: ${numMessages}`)
        setInterval(() => {
            this.sendMessages(numMessages, topic);
            this._totalSent+=numMessages;
        }, intervalMs);
        setInterval(()=>console.log(`Total messages sent: ${this._totalSent}`),30000);
    }

    sendMessages(numMessages, topic) {
        let messages = [];
        for (let i = 0; i < numMessages; i++) {
            messages.push(this.generateMessage());
        }
        this.send(topic, messages);
    }

    generateMessage(): string {
        return dummyJson.parse(this._template);
    }



    initProducer(bootstrapServer: string): HighLevelProducer {
        try {
            console.log(`Creating producer. Trying to connect to broker: ${bootstrapServer}`);
            let client = new KafkaClient({ kafkaHost: bootstrapServer });
            let producer = new HighLevelProducer(client);
            producer.on("ready", this.onProducerReady)
            producer.on("error", this.onProducerError)
            return producer;
        } catch (err) {
            console.error("Producer error: " + err.message)
        }
    }

    onProducerError(err) {
        console.error("Producer error: " + err.message)
    }
    onProducerReady=()=> {
        console.log("Connected to broker. Producer ready");
        this.initMessageGenerator();
    }

    send(topic, messages: string[]) {
        if (this._producer) {
            let payloads = [{
                topic, messages
            }]
            this._producer.send(payloads, (err, data) => {
                if (err) {
                    console.error("Failed to send message. Error: " + err.messages);
                }
            })
        }
    }
}
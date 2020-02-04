
## Build docker image from src
run:
```
docker build -t odedl/kafka-producer-simulator .
```
## Environment settings
Here is the list of supported env settings
- KAFKA_BOOTSTRAP_SERVER - comma delimited list of kafka brokers (default: localhost:9092)
- KAFKA_TOPIC - the topic name to send the message to. (default 'test')
- NUM_EVENTS_PER_SECOND - the amount of messages to send per second. possible to set a decimal number from 0-1 or number for 1 -n
- DELAY_START_SEC - the amount of seconds to wait before starting. Can be used when loading kafka server in same docker cluster and wait for server to load 
  
## Running docker image
The kafka simulator has the ability to define json templates that will be used when generating data.
You can use the default template that will create json objects with random name and age.
You can override the default template with a custom template.

Here is the default template used when not creating your own:
```
{{"name": "{{firstName}}","age": "{{int 18 65}}" }
```

In order to override the default template, 
1. create a folder named template and in it create a file named **data-template.hbs**
2. inside the file add your template. For example:  
```
{"name": "{{firstName}}","age": "{{int 18 65}}" ,"mail": "{{email}}" }
```

The format is in **Handlebar**. For details of all the possible dummy types - https://github.com/webroo/dummy-json


To run the docker with custom template (for windows set the full path in the source)
```
docker run  -v "./template":/var/src/template -it odedl/kafka-producer-simulator
```

## Running from docker-compose
In your docker compose file add the following:
```
version: '3'
services:
  kafka-simulator:
    image: odedl/kafka-producer-simulator
    volumes:
      - ./template:/var/src/template
    environment:
      - KAFKA_BOOTSTRAP_SERVER=localhost:9092
      - KAFKA_TOPIC=test
      - NUM_EVENTS_PER_SECOND=1
      - DELAY_START_SEC=0
```


Here is a docker compose file that includes a kafka broker and zookepper
```
version: '3'
services:
  kafka-simulator:
    image: odedl/kafka-producer-simulator:latest
    volumes:
      - ./template:/var/src/template
    environment:
      - KAFKA_BOOTSTRAP_SERVER=kafka1:19092
      - KAFKA_TOPIC=test
      - NUM_EVENTS_PER_SECOND=1
      - DELAY_START_SEC=20
    networks:
      - app-network
  zoo:
    image: zookeeper:3.4.9
    hostname: zoo
    ports:
      - "2181:2181"
    environment:
        ZOO_MY_ID: 1
        ZOO_PORT: 2181
    volumes:
      - ./zk-single-kafka-multiple/zoo/data:/data
      - ./zk-single-kafka-multiple/zoo/datalog:/datalog
    networks:
      - app-network
  kafka1:
    image: confluentinc/cp-kafka:5.2.1
    hostname: kafka1
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_LISTENERS: LISTENER_DOCKER_INTERNAL://kafka1:19092,LISTENER_DOCKER_EXTERNAL://${DOCKER_HOST_IP:-127.0.0.1}:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: LISTENER_DOCKER_INTERNAL:PLAINTEXT,LISTENER_DOCKER_EXTERNAL:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: LISTENER_DOCKER_INTERNAL
      KAFKA_ZOOKEEPER_CONNECT: "zoo:2181"
      KAFKA_BROKER_ID: 1
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_LOG4J_LOGGERS: "kafka.controller=INFO,kafka.producer.async.DefaultEventHandler=INFO,state.change.logger=INFO"
    volumes:
      - ./zk-single-kafka-multiple/kafka1/data:/var/lib/kafka/data
    depends_on:
      - zoo
    networks:
      - app-network
networks:
    app-network:
        driver: bridge
```

4. run: docker-compose up
5. To view the data add a consumer to localhost:9092 with topic test and view the data:
```
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test
```





## Build docker image from src
run:
```
docker build -t odedlevy/kafka-producer-simulator .
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
In order to override the default template, create a folder named template and in it create a file named **data-template.hbs**
The format is in **Handlebar**. For details of all the possible dummy types - https://github.com/webroo/dummy-json

Here is the default template used when not creating your own:
```
{"name": {{firstName}},"age": {{int 18 65}} }
```
To run the docker with custom template (for windows set the full path)
```
docker run  -v "C:\Git\kafkatest\template":/var/src/template -it odedlevy/kafka-simulator
```

## Running from docker-compose
In your docker compose file add the following:
```
version: '3'
services:
  kafka-simulator:
    image: odedlevy/kafka-simulator
    volumes:
      - C:\Git\Oded\kafkatest\template:/var/src/template
    environment:
      - KAFKA_BOOTSTRAP_SERVER=localhost:9092
      - KAFKA_TOPIC=test
      - NUM_EVENTS_PER_SECOND=0.5
      - DELAY_START_SEC=0
```


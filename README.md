## The Currency Exchagne Rate Worker 
---
Version: 0.1.0
* This is a programming challenge in Node.js

## Goal
----
Code a currency exchagne rate `worker`

1. Input currency from USD, to HKD
2. Get USD to HKD currency every 1 min, save 10 successful result to mongodb.
3. If any problem during the get rate attempt, retry it delay with 3s
4. If failed more than 3 times, give up the job.

#### The worker should:
Scale horizontally (can run in more than 1 process in many different machines)



## Setup
---
1. `npm install`

2. Configure the beanstalkd host and port, and the tubes id to watch at `currency-worker.yml`

3. Prepare a mongodb database. For example, create a database named "currency" at your mongodb at localhost with user authentication disabled

4. Run the worker with `node currency-worker.js`
    If you want to assign specific tube ID, config path and mongodb URI for the worker,
    please run it with the following command:

    `node currency-worker.js --id [ID] --config [config.yml] --mongodb [URI]`
    
    __ID__: the worker ID (Default: `marcohk`)
    
    __config.yml__: the config file defining the location of beanstalkd, handlers and tubes being watched (Default: `./currency-worker.yml`)
    
    __URI__: the URI of the mongodb (Default: `mongodb://localhost:27017/currency`)

5. Seed the job to the tube you watching with the below format:
    ```
    {
        "type": "currency-convert",
        "payload":
        {
        "id": "0d17ad14-cf14-11e4-b9d6-1681e6b88ec1", 
        "from": "USD", 
        "to": "EUR"
        }
    }
    ```
    __type__: the type to match your worker

    __payload.id__: the unique ID for this job. The number of reput attempts is based on this ID.   UUID is preferred.

    __payload.from__: the currency being converted

    __payload.to__: the currency convert to


You can start whatever number of workers as you want. The workers will get their job done independently and load-balanced. Enjoy!

## Testing
---
Run the tester with `node test.js`
if you want to assign specific parameters for the tester,
please run it with the following command:
`node test.js --host [URL] --port [port] --tube [tube_id] --type [job_type] --from [from_currency] --to [to_currency]`

```
--host    [default: "challenge.aftership.net"]
--port    [default: "11300"]
--tube    [default: "marcohk"]
--type    [default: "currency-convert"]
--from    [default: "USD"]
--to      [default: "HKD"]
```

## Database Schema
---

Below is an example of a data result:
```
{
    "_id" : ObjectId("55116c8e0b4d1f500e465c68"),
    "id" : "45756400-d22d-11e4-8a86-5958edb6b869",
    "from" : "HKD",
    "to" : "JPY",
    "created_at" : 1427205262636,
    "rate" : "15.43"
}
```
__ _id __:the ID of this data result

__id__:the job ID

__from__: the currency being converted

__to__: the currency convert to

__created_at__: the created time of this data result

__rate__: the currency conversation rate


Below is an example of a job status:
```
{
    "_id" : "45756400-d22d-11e4-8a86-5958edb6b869",
    "success" : 7,
    "fail" : 3
}
```
__ _id __:the job ID

__success__: the total number of succeed attempts

__fail__: the total number of failed attempts

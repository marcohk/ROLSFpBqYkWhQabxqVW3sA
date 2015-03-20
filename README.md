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

2. configure the beanstalkd host and port, and the tubes id to watch at `currency-worker.yml`

3. create a database named "currency" at your mongodb at localhost with user authentication disabled

4. run the worker with `node currency-worker.js --id marcohk --config ./currency-worker.yml`

5. seed the job to the tube you watching with the below format:
```
{
    "type": "marcohk",
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

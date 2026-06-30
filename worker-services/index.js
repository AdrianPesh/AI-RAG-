const {connectRedis}=require("./config/redis");

const sleep = function(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}

const startWorker = async()=>{
    let redisConnected = false;
    while(!redisConnected){
        try{
            await connectRedis();
            redisConnected=true;
        }catch(error){
            console.log(error.message);
            await sleep(1000);
        }
    }

    require("./cache/PdfQueue");
    console.log("Worker started successfully");
}

startWorker();
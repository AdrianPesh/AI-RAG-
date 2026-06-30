const {createClient} = require("redis");

const client = createClient({
    url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

const connectRedis = async()=>{
    client.connect();
}

client.on("error",(err)=>{
    console.log("Redis client error: ",err);
});

module.exports = {
    client,
    connectRedis
};
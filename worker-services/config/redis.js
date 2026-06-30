const {createClient} = require("redis");
require("dotenv").config();


const client = createClient({
    url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

const connectRedis = async()=>{
    client.connect();
}

client.on("error",(error)=>{
  console.log("Redis error: ",error);
});

module.exports = {
    client,
    connectRedis
};
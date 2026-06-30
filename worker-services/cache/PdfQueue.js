const {Worker} = require("bullmq");
const processPdf = require("../services/processPdf");
require("dotenv").config();

const pdfWorker = new Worker("pdf",async(job)=>{
    await processPdf.processPdf(job.data.pdfId);
},
{
    connection:{
        host:process.env.REDIS_HOST,
        port:process.env.REDIS_PORT
    }
}
);

pdfWorker.on("completed",(job)=>{
    console.log(`Job ${job.id} completed`);
});

pdfWorker.on("failed",(job,error)=>{
    console.log(`Job ${job.id} failed:
        ${error.message}
        `);
});

pdfWorker.on("error",error=>{
    console.log(error.message);
});

module.exports = pdfWorker;


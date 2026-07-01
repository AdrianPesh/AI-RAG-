const questionService = require("../services/questionService");

const askQuestion = async(req,res)=>{
    try{
        if(!req.user){
            throw new Error("Unathorized");
        }

        if(!req.body || !req.body.workspaceId || !req.body.question || !req.params || !req.params.id){
            throw new Error("Required fields missing");
        }
        const conversationId = req.params.id;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

       await questionService.question({userId:req.user.id,...req.body,conversationId:conversationId,res:res});

      

    }catch(error){
        if(res.headersSent){
            res.end()
            return;
        }
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
}

module.exports = {askQuestion};
const questionService = require("../services/questionService");

const askQuestion = async(req,res)=>{
    try{
        if(!req.user){
            throw new Error("Unathorized");
        }

        if(!req.body || !req.body.workspaceId || !req.body.question){
            throw new Error("Required fields missing");
        }

        const answer = await questionService.question({userId:req.user.id,...req.body});

        return res.status(200).json({
            success:true,
            message:"Answer was received",
            answer:answer
        });

    }catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
}

module.exports = {askQuestion};
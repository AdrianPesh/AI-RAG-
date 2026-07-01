const prisma = require("../config/prisma");
const ai = require("../config/gemini");
const question = async({userId,workspaceId,question,conversationId,res})=>{

    const conversationExists = await prisma.conversation.findFirst({
        where:{
            id:Number(conversationId),
            workspace_id:Number(workspaceId),
            user_id:Number(userId)
        }
    });
    if(!conversationExists){
        throw new Error("No such conversation for the current workspace");
    }
     await prisma.message.create({
        data:{
            content:question,
            role:"USER",
            conversation_id:Number(conversationId)
        }
    });
    const response = await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents:question
    });

    const questionEmbedding = response.embeddings[0].values;

    const vector = `[${questionEmbedding.join(",")}]`;

    const chunks = await prisma.$queryRaw`
        Select dc.content,dc.chunk_index,dc.id,dc.document_id
        FROM "DocumentChunk" dc
        JOIN "Document" d
        ON d.id = dc.document_id
        WHERE d.workspace_id = ${Number(workspaceId)}
        ORDER BY dc.embedding <=> ${vector}::vector
        LIMIT 5
    `;
    res.write(`event: sources\n`);
    res.write(`data: ${JSON.stringify(chunks)}\n\n`);

    const previousMessages = await prisma.message.findMany({
        where:{
            conversation_id:Number(conversationId)
        },
        orderBy:{
            created_at:"desc"
        },
        take:10

    });


    const context = chunks.map(chunk=>chunk.content).join("\n\n");
    let history="";
    if(previousMessages.length>0){
        history = previousMessages.reverse().map(message=>`${message.role}:\n${message.content}`).join("\n\n");
    }

    const prompt = `
    You are answering questions about documents uploaded by the user.

Use the retrieved document context as the primary source of truth.

Use the previous conversation only to understand references such as "it", "that", or follow-up questions.

If the answer is not present in the retrieved context, say that the information is not available in the uploaded documents.

    Previous Conversation:
    ${history}

    Context:
    ${context}


    Question:
    ${question}
    `;

    const stream = await ai.models.generateContentStream({
        model:"gemini-2.5-flash",
        contents:prompt
    });

    let fullAnswer = "";

    for await(const chunk of stream){
        const text = chunk.text;
        fullAnswer+=text;

        res.write(`data: ${text}\n\n`);
    }

   

    await prisma.message.create({
        data:{
            content:fullAnswer,
            role:"ASSISTANT",
            conversation_id:Number(conversationId)
        }
    });



    res.end();




}

module.exports = {question};
const prisma = require("../config/prisma");
const ai = require("../config/gemini");
const question = async({userId,workspaceId,question})=>{
    const response = await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents:question
    });

    const questionEmbedding = response.embeddings[0].values;

    const vector = `[${questionEmbedding.join(",")}]`;

    const chunks = await prisma.$queryRaw`
        Select dc.content
        FROM "DocumentChunk" dc
        JOIN "Document" d
        ON d.id = dc.document_id
        WHERE d.workspace_id = ${Number(workspaceId)}
        ORDER BY dc.embedding <=> ${vector}::vector
        LIMIT 5
    `;

    const context = chunks.map(chunk=>chunk.content).join("\n\n");

    const prompt = `
    Answer the user's question using ONLY the following context

    Context:
    ${context}

    Question:
    ${question}
    `;

    const answer = await ai.models.generateContent({
        model:"gemini-2.5-flash",
        contents:prompt
    });

    

    return answer.text;


}

module.exports = {question};
// Demonstration content only. Replace nodes, copy, and log entries with real project data.
export const requestFlow = {
  description: '一个请求，从浏览器出发，经过 API、向量检索与模型生成，最终带着答案返回。这里先用一条 RAG 请求演示系统内部的协作过程，项目内容后续填充。',
  nodes: [
    { code: 'REACT', name: 'Browser', detail: 'client payload' },
    { code: 'FASTAPI', name: 'API gateway', detail: 'auth + routing' },
    { code: 'CHROMA', name: 'Vector DB', detail: 'top-k retrieval' },
    { code: 'LLM', name: 'RAG generate', detail: 'context + answer' },
    { code: '200', name: 'Response', detail: 'audited + sent' },
  ],
  logs: [
    { at: 100, node: 0, service: 'browser', message: 'POST /api/v2/ask payload=238b', ms: 8 },
    { at: 450, node: 1, service: 'fastapi', message: 'auth ok · rate-limit pass · routing to /ask', ms: 14 },
    { at: 800, node: 1, service: 'fastapi', message: 'embedding query · model=all-MiniLM-L6-v2', ms: 32 },
    { at: 1200, node: 2, service: 'chromadb', message: 'top_k=6 retrieved · 4 above 0.78 cosine', ms: 84 },
    { at: 1700, node: 3, service: 'llm', message: 'context assembled (4,201 tok) · generating…', ms: 1180 },
    { at: 3000, node: 4, service: 'response', message: '200 OK · answer + 4 citations returned', ms: 12 },
  ],
};

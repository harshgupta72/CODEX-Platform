import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY") or ""

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "CODEX AI Analysis Server is running", "status": "active", "docs": "/docs"}

class AnalyzeInput(BaseModel):
    code: str
    language: str
    userId: str | None = None
    problemId: str | None = None

def count(pattern: str, code: str) -> int:
    import re
    return len(re.findall(pattern, code))

def clamp(n: float) -> int:
    if n < 0: return 0
    if n > 100: return 100
    return round(n)

def baseline_metrics(code: str, language: str):
    size = max(len(code), 1)
    lines = max(code.count("\n") + 1, 1)
    loops = count(r"\bfor\b|\bwhile\b", code)
    branches = count(r"\bif\b|\belse if\b|\bswitch\b|\bcase\b|\?\s*\w", code)
    and_or = count(r"&&|\|\|", code)
    memory_hints = count(r"\bnew\b|\bmalloc\b|\bArray\b|\bvector\b|\bHashMap\b|\bdict\b|\bset\b", code)
    idiomatic = 50
    lang = (language or "").lower()
    if lang == "python":
        comprehensions = count(r"\[.*for .*\]|\{.*for .*\}", code)
        enumerate_zip = count(r"\benumerate\b|\bzip\b", code)
        set_use = count(r"\bset\(", code)
        idiomatic = clamp(50 + comprehensions * 10 + enumerate_zip * 5 + set_use * 5)
    elif lang == "cpp":
        stl = count(r"std::vector|std::unordered_map|std::sort|auto\b", code)
        raw = count(r"\bnew\b|\bdelete\b", code)
        idiomatic = clamp(60 + stl * 8 - raw * 10)
    elif lang == "java":
        streams = count(r"\.stream\(\)|Collectors", code)
        foreach = count(r"for\s*\(\s*:\s*\)", code)
        idiomatic = clamp(55 + streams * 8 + foreach * 5)
    elif lang == "c":
        stdlib = count(r"memcpy|memmove|qsort", code)
        raw = count(r"malloc|free", code)
        idiomatic = clamp(50 + stdlib * 8 + raw * 2)
    complexity = clamp(100 - min(95, loops * 12 + branches * 7 + and_or * 4))
    import math
    perf = clamp(100 - min(90, math.log2(size + 1) * 3 + loops * 10))
    memory = clamp(100 - min(85, memory_hints * 6 + lines / 200 * 10))
    security = clamp(80 - min(60, count(r"system\(|eval\(|exec\(", code) * 20))
    score = clamp(0.35 * perf + 0.2 * complexity + 0.2 * memory + 0.15 * idiomatic + 0.1 * security)
    return {"score": score, "perf": perf, "complexity": complexity, "memory": memory, "idiomatic": idiomatic, "security": security, "lines": lines, "loops": loops, "branches": branches}

def heuristic_analysis(code: str, language: str):
    lang = (language or "").lower()
    m = baseline_metrics(code, language)
    suggestions = []
    potential_bugs = []
    optimization_tips = []
    if "TODO" in code or "FIXME" in code:
        suggestions.append("Clear remaining TODO/FIXME items to improve maintainability")
    if len(code) > 2000 or m["lines"] > 200:
        suggestions.append("Split code into smaller functions and modules")
    if m["loops"] > 5 or m["branches"] > 10:
        suggestions.append("Reduce nested loops/conditionals and extract helper functions")
    if "system(" in code or "eval(" in code or "exec(" in code:
        potential_bugs.append("Avoid unsafe calls like system/eval/exec")
    if lang == "python":
        if "range(len(" in code:
            suggestions.append("Use enumerate instead of range(len(...))")
        if "== None" in code or "!= None" in code:
            suggestions.append("Use is None / is not None for None checks")
        if "print(" in code and "logging" not in code:
            optimization_tips.append("Use logging module for production diagnostics")
    if lang == "cpp":
        if "#include <bits/stdc++.h>" in code:
            optimization_tips.append("Avoid non-standard header <bits/stdc++.h> for portability")
        if "using namespace std" in code:
            suggestions.append("Avoid using namespace std in global scope")
        if "new " in code and "std::unique_ptr" not in code and "std::shared_ptr" not in code:
            potential_bugs.append("Prefer RAII or smart pointers over raw new/delete")
    if lang == "java":
        if "+=" in code and "for(" in code and "String" in code:
            optimization_tips.append("Use StringBuilder for concatenation inside loops")
        if ".stream()" not in code and "for(" in code:
            suggestions.append("Consider Java Streams for collection processing when appropriate")
    if lang == "c":
        if "malloc(" in code and "free(" not in code:
            potential_bugs.append("Allocated memory may be leaked; ensure every malloc has free")
        if "strcpy(" in code:
            potential_bugs.append("Use safer alternatives like strncpy or strlcpy")
    optimized_code = code
    return {
        "type": "rag-fallback",
        "summary": "Heuristic analysis generated",
        "metrics": m,
        "suggestions": suggestions,
        "potentialBugs": potential_bugs,
        "optimizationTips": optimization_tips,
        "contextSnippets": [],
        "optimizedCode": optimized_code,
    }

def rag_analyze(code: str, language: str):
    # Import LangChain stack lazily
    from langchain_openai import ChatOpenAI
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    from langchain_community.vectorstores import FAISS
    from langchain_core.prompts import ChatPromptTemplate
    from langchain.chains.combine_documents import create_stuff_documents_chain
    from langchain.chains import create_retrieval_chain
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    import json
    import re

    # NVIDIA NIM API configuration with fallback
    nvidia_base_url = os.getenv("NVIDIA_BASE_URL") or "https://integrate.api.nvidia.com/v1"
    
    # Fallback sequence
    models_to_try = [
        {"key": os.getenv("NVIDIA_API_KEY_1"), "model": os.getenv("NVIDIA_MODEL_1") or "openai/gpt-oss-120b"},
        {"key": os.getenv("NVIDIA_API_KEY_2"), "model": os.getenv("NVIDIA_MODEL_2") or "openai/gpt-oss-20b"}
    ]

    last_error = None
    for config in models_to_try:
        if not config["key"]:
            continue
            
        try:
            llm = ChatOpenAI(
                openai_api_key=config["key"],
                base_url=nvidia_base_url,
                model_name=config["model"],
                temperature=0.7
            )
            embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
            splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=160)
            docs = splitter.create_documents([code])
            vectors = FAISS.from_documents(docs, embeddings)
            retriever = vectors.as_retriever()
            
            prompt = ChatPromptTemplate.from_template(
                """You are a senior code reviewer. Use the context to produce:
                - suggestions: bullet points for improvements
                - potentialBugs: likely issues or edge cases
                - optimizationTips: performance or readability optimizations
                - optimizedCode: improved version if beneficial, else return original
                Respond strictly as compact JSON with keys: suggestions, potentialBugs, optimizationTips, optimizedCode.
                <context>
                {context}
                </context>
                Input: {input}"""
            )
            
            doc_chain = create_stuff_documents_chain(llm, prompt)
            chain = create_retrieval_chain(retriever, doc_chain)
            res = chain.invoke({"input": f"Analyze {language} code and improve it."})
            
            text = res.get("answer", "") or ""
            
            # Robust JSON extraction
            try:
                # Find the first { and last }
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    json_str = match.group(0)
                    data = json.loads(json_str)
                else:
                    # Try cleaning markdown
                    cleaned = text.replace("```json", "").replace("```", "").strip()
                    data = json.loads(cleaned)
            except Exception as e:
                print(f"JSON Parse Error for {config['model']}: {e}")
                last_error = e
                continue # Try next model if JSON is invalid

            ctx = []
            for d in res.get("context", []):
                ctx.append({"text": getattr(d, "page_content", "")})
            
            metrics = baseline_metrics(code, language)
            return {
                "type": "rag", 
                "summary": f"RAG analysis generated using {config['model']}", 
                "metrics": metrics, 
                "suggestions": data.get("suggestions", []), 
                "potentialBugs": data.get("potentialBugs", []), 
                "optimizationTips": data.get("optimizationTips", []), 
                "contextSnippets": ctx, 
                "optimizedCode": data.get("optimizedCode", code)
            }
            
        except Exception as e:
            print(f"Error with {config['model']}: {e}")
            last_error = e
            continue

    # If all models fail, raise the last error to trigger heuristic fallback
    if last_error:
        raise last_error
    else:
        raise Exception("No NVIDIA API keys configured")

@app.post("/analyze")
def analyze(inp: AnalyzeInput):
    try:
        return rag_analyze(inp.code, inp.language)
    except Exception as e:
        print(f"RAG failed, falling back to heuristics: {e}")
        return heuristic_analysis(inp.code, inp.language)

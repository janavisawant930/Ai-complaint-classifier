import os
import sys
import json
import re
import types
from pathlib import Path
from typing import Dict, Any, List, Optional

# Windows AppLocker protection: mock cygrpc/otel trace exporter before importing chromadb if needed
if 'opentelemetry.exporter.otlp.proto.grpc.trace_exporter' not in sys.modules:
    otel_mock = types.ModuleType('opentelemetry.exporter.otlp.proto.grpc.trace_exporter')
    otel_mock.OTLPSpanExporter = object
    sys.modules['opentelemetry.exporter.otlp.proto.grpc.trace_exporter'] = otel_mock

os.environ['ANONYMIZED_TELEMETRY'] = 'False'

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import Config
from classifier import classify_complaint as rule_based_classify

# Global singleton caches
_embeddings_instance: Optional[GoogleGenerativeAIEmbeddings] = None
_vectorstore_instance: Optional[Chroma] = None
_retriever_instance = None
_llm_instance: Optional[ChatGoogleGenerativeAI] = None
_rag_chain_instance = None


def get_embeddings(api_key: Optional[str] = None) -> GoogleGenerativeAIEmbeddings:
    """
    Initializes Gemini embeddings using GoogleGenerativeAIEmbeddings with caching.
    """
    global _embeddings_instance
    if _embeddings_instance is not None:
        return _embeddings_instance

    key = api_key or Config.GEMINI_API_KEY
    if not key:
        raise ValueError("GEMINI_API_KEY is not configured in .env")
    _embeddings_instance = GoogleGenerativeAIEmbeddings(
        model=Config.GEMINI_EMBEDDING_MODEL,
        google_api_key=key
    )
    return _embeddings_instance



def load_knowledge_base_documents(kb_dir: Optional[str] = None) -> List[Any]:
    """
    Loads text files from the knowledge base directory using TextLoader.
    """
    kb_path = Path(kb_dir or Config.KNOWLEDGE_BASE_DIR)
    if not kb_path.exists():
        print(f"[RAG] Knowledge base directory {kb_path} does not exist. Creating it.")
        kb_path.mkdir(parents=True, exist_ok=True)
        return []

    documents = []
    text_files = list(kb_path.glob("*.txt")) + list(kb_path.glob("*.md"))
    
    for file_path in text_files:
        try:
            loader = TextLoader(str(file_path), encoding="utf-8")
            loaded = loader.load()
            for doc in loaded:
                doc.metadata["source"] = file_path.name
                doc.metadata["category_hint"] = file_path.stem.replace("_", " ").title()
            documents.extend(loaded)
        except Exception as e:
            print(f"[RAG Warning] Failed to load {file_path}: {e}")

    return documents


def build_or_get_vectorstore(force_rebuild: bool = False) -> Chroma:
    """
    Builds or loads the persistent Chroma vector store.
    """
    global _vectorstore_instance

    if _vectorstore_instance is not None and not force_rebuild:
        return _vectorstore_instance

    persist_dir = Config.CHROMA_PERSIST_DIR
    api_key = Config.GEMINI_API_KEY

    if not api_key:
        raise ValueError("GEMINI_API_KEY is required to initialize Chroma Vector Store.")

    embeddings = get_embeddings(api_key)
    persist_path = Path(persist_dir)

    # Check if a persistent vector store already exists and has documents
    if persist_path.exists() and not force_rebuild:
        try:
            vectorstore = Chroma(
                persist_directory=str(persist_path),
                embedding_function=embeddings
            )
            # Check if index has documents
            if vectorstore._collection.count() > 0:
                _vectorstore_instance = vectorstore
                return _vectorstore_instance
        except Exception as e:
            print(f"[RAG Notice] Existing vector store could not be opened, rebuilding: {e}")

    # Load and split documents from knowledge base
    raw_docs = load_knowledge_base_documents()
    if not raw_docs:
        print("[RAG Warning] No documents found in knowledge base. Creating empty vector store.")
        vectorstore = Chroma(
            persist_directory=str(persist_path),
            embedding_function=embeddings
        )
        _vectorstore_instance = vectorstore
        return vectorstore

    # RecursiveCharacterTextSplitter with chunk_size=500, chunk_overlap=50
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    split_docs = text_splitter.split_documents(raw_docs)
    print(f"[RAG] Indexing {len(split_docs)} document chunks into Chroma ({persist_dir})...")

    vectorstore = Chroma.from_documents(
        documents=split_docs,
        embedding=embeddings,
        persist_directory=str(persist_path)
    )

    _vectorstore_instance = vectorstore
    return _vectorstore_instance


def get_retriever(k: int = 3):
    """
    Creates or returns cached LangChain retriever from Chroma vector store (top-k relevant chunks).
    """
    global _retriever_instance
    if _retriever_instance is not None:
        return _retriever_instance

    vectorstore = build_or_get_vectorstore()
    _retriever_instance = vectorstore.as_retriever(search_kwargs={"k": k})
    return _retriever_instance


def get_llm(api_key: Optional[str] = None) -> ChatGoogleGenerativeAI:
    """
    Instantiates or returns cached Google Gemini Chat model using ChatGoogleGenerativeAI.
    """
    global _llm_instance
    if _llm_instance is not None:
        return _llm_instance

    key = api_key or Config.GEMINI_API_KEY
    if not key:
        raise ValueError("GEMINI_API_KEY is not configured in .env")

    _llm_instance = ChatGoogleGenerativeAI(
        model=Config.GEMINI_MODEL,
        google_api_key=key,
        temperature=0.1
    )
    return _llm_instance



# Classification Prompt Template
RAG_CLASSIFIER_PROMPT = ChatPromptTemplate.from_template("""You are an expert AI Complaint Classifier and Resolution Assistant for an enterprise customer support system.

Your task is to analyze the following customer complaint using the retrieved knowledge-base context and accurately classify it.

### Valid Categories (must choose exactly one):
- Billing
- Technical Issues
- Product/Service
- Account
- Delivery
- Fraud/Security
- Other

### Priority Levels:
- High (Urgent financial loss, security breaches, damaged goods, severe blockers)
- Medium (Delays, standard technical bugs, login issues)
- Low (General profile edits, minor feedback, non-urgent inquiries)

### Knowledge Base Context:
{context}

### Customer Complaint:
{complaint}

### Instructions:
1. Carefully match the complaint details with the retrieved knowledge-base policies.
2. Determine the most accurate Category and Priority.
3. Calculate a Confidence score as an integer from 0 to 100 (e.g., 95).
4. Provide a concise Reason (1-2 sentences) explaining why this category was selected citing the knowledge base.
5. Provide a Suggested Resolution based directly on the retrieved policy/FAQ guidelines.
6. Extract key matched keywords/signals from the text.
7. Return your response ONLY as a valid JSON object with NO markdown formatting, NO backticks, and NO extra text outside the JSON.

### Output JSON Schema:
{{
  "category": "Billing",
  "priority": "High",
  "confidence": 96,
  "reason": "The complaint matches billing policies regarding duplicate transaction debits.",
  "suggested_resolution": "Initiate an automatic refund within 24 hours. Funds will reflect within 3-5 business days.",
  "matched_keywords": ["charged twice", "transaction", "refund"]
}}
""")


def clean_json_text(text: str) -> str:
    """
    Strips code fences, backticks, and extraneous whitespace from model response.
    """
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def classify_with_rag(text: str, title: str = "") -> Dict[str, Any]:
    """
    Complete RAG Pipeline for Complaint Classification:
    Complaint -> Retriever (Chroma) -> Context -> Gemini LLM -> Structured Result
    """
    combined_text = f"{title} {text}".strip() if title else text.strip()
    if not combined_text:
        return {
            "category": "Other",
            "priority": "Medium",
            "confidence": 80,
            "reason": "Empty complaint text provided.",
            "suggested_resolution": "Please provide detailed complaint information.",
            "matched_keywords": [],
            "retrieved_context": []
        }

    # If GEMINI_API_KEY is not available, fallback gracefully
    if not Config.GEMINI_API_KEY:
        print("[RAG Notice] GEMINI_API_KEY missing, using rule-based classification fallback.")
        fallback = rule_based_classify(combined_text)
        fallback["reason"] = f"Classified via keyword rule matching ({fallback['category']})."
        fallback["suggested_resolution"] = "Review complaint details and route to support representative."
        fallback["retrieved_context"] = []
        return fallback

    try:
        # 1. Retrieve relevant knowledge base chunks using Chroma
        retriever = get_retriever(k=3)
        retrieved_docs = retriever.invoke(combined_text)
        
        context_snippets = []
        retrieved_metadata = []
        for doc in retrieved_docs:
            snippet = doc.page_content.strip()
            source = doc.metadata.get("source", "knowledge_base")
            context_snippets.append(f"[{source}]\n{snippet}")
            retrieved_metadata.append({
                "source": source,
                "content": snippet[:200] + "..." if len(snippet) > 200 else snippet
            })

        context_str = "\n\n---\n\n".join(context_snippets) if context_snippets else "No specific policy document found."

        # 2. Setup Gemini LLM and invoke LangChain Chain
        global _rag_chain_instance
        if _rag_chain_instance is None:
            llm = get_llm()
            _rag_chain_instance = RAG_CLASSIFIER_PROMPT | llm | StrOutputParser()

        response_str = _rag_chain_instance.invoke({
            "context": context_str,
            "complaint": combined_text
        })


        # 3. Parse JSON response
        cleaned_json = clean_json_text(response_str)
        try:
            parsed = json.loads(cleaned_json)
        except Exception:
            # Try regex extraction for JSON block
            json_match = re.search(r'\{.*\}', cleaned_json, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
            else:
                raise ValueError(f"Could not parse valid JSON from LLM: {response_str}")

        # Validate and normalize fields
        valid_categories = ["Billing", "Technical Issues", "Product/Service", "Account", "Delivery", "Fraud/Security", "Other"]
        category = parsed.get("category", "Other")
        if category not in valid_categories:
            # Attempt case-insensitive match
            matched = [c for c in valid_categories if c.lower() == str(category).lower()]
            category = matched[0] if matched else "Other"

        valid_priorities = ["High", "Medium", "Low"]
        priority = parsed.get("priority", "Medium")
        if priority not in valid_priorities:
            priority = "High" if "high" in str(priority).lower() else ("Low" if "low" in str(priority).lower() else "Medium")

        confidence_val = parsed.get("confidence", 90)
        try:
            if isinstance(confidence_val, float) and confidence_val <= 1.0:
                confidence_int = int(confidence_val * 100)
            else:
                confidence_int = int(float(confidence_val))
            confidence_int = max(50, min(99, confidence_int))
        except (ValueError, TypeError):
            confidence_int = 92

        reason = parsed.get("reason") or f"Complaint categorized as {category} based on knowledge base policies."
        suggested_resolution = parsed.get("suggested_resolution") or "Standard customer support triage recommended."
        matched_keywords = parsed.get("matched_keywords") or []

        return {
            "category": category,
            "priority": priority,
            "confidence": confidence_int,
            "reason": reason,
            "suggested_resolution": suggested_resolution,
            "matched_keywords": matched_keywords if isinstance(matched_keywords, list) else [str(matched_keywords)],
            "retrieved_context": retrieved_metadata
        }

    except Exception as e:
        print(f"[RAG Error] Pipeline exception: {e}. Falling back to rule-based classifier.")
        fallback = rule_based_classify(combined_text)
        fallback["reason"] = f"Classified via keyword rule matching ({fallback['category']}). (RAG Fallback)"
        fallback["suggested_resolution"] = "Review complaint details and route to support representative."
        fallback["retrieved_context"] = []
        return fallback

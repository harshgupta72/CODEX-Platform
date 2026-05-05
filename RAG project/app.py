import streamlit as streamlit
import os
from langchain_groq import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import time

load_dotenv()

# Load the GROQ and Google API Keys
groq_api_key = os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY") or ""

streamlit.set_page_config(page_title="Document Q&A", page_icon="📄")
streamlit.title("Document Q&A")

# Initialize session state holders
if "vectors" not in streamlit.session_state:
    streamlit.session_state.vectors = None
if "embeddings" not in streamlit.session_state:
    streamlit.session_state.embeddings = None

# Initialize LLM
llm = ChatGroq(groq_api_key=groq_api_key, model_name="Gemma2-9b-it")

prompt = ChatPromptTemplate.from_template(
    """
    Answer the questions based on the provided context only.
    Please provide the most accurate response based on the question
    <context>
    {context}
    <context>
    Questions: {input}
    """
)

def build_vectors_from_uploads():
    if streamlit.session_state.vectors is not None:
        return
    streamlit.session_state.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    upload_folder = "uploaded_pdfs"
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    uploaded_files = streamlit.file_uploader("Upload PDF documents", type="pdf", accept_multiple_files=True)
    if uploaded_files:
        for uploaded_file in uploaded_files:
            file_path = os.path.join(upload_folder, uploaded_file.name)
            with open(file_path, "wb") as file_handle:
                file_handle.write(uploaded_file.read())
        loader = PyPDFDirectoryLoader(upload_folder)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        final_documents = text_splitter.split_documents(docs[:20])
        streamlit.session_state.vectors = FAISS.from_documents(final_documents, streamlit.session_state.embeddings)
        streamlit.success("Vector store is ready.")
    else:
        streamlit.info("Please upload at least one PDF to build the vector store.")

user_question = streamlit.text_input("Enter your question from the documents")

if streamlit.button("Create Embeddings from PDFs"):
    build_vectors_from_uploads()

if user_question:
    if streamlit.session_state.vectors is None:
        streamlit.warning("Please create embeddings from PDFs first.")
    else:
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = streamlit.session_state.vectors.as_retriever()
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        start_time = time.process_time()
        response = retrieval_chain.invoke({'input': user_question})
        streamlit.write(response['answer'])
        streamlit.caption(f"Response time: {time.process_time() - start_time:.2f} seconds")

        with streamlit.expander("Document Similarity Search"):
            for _, doc in enumerate(response["context"]):
                streamlit.write(doc.page_content)
                streamlit.write("--------------------------------")
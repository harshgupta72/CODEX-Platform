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
groq_api_key = os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY") or ""

VALID_EMAIL = "user@example.com"
VALID_PASSWORD = "password123"

def login():
    streamlit.title("Login Page")
    email = streamlit.text_input("Email")
    password = streamlit.text_input("Password", type="password")
    if streamlit.button("Login"):
        if email == VALID_EMAIL and password == VALID_PASSWORD:
            streamlit.session_state.logged_in = True
            streamlit.success("Login successful! Redirecting...")
            streamlit.experimental_rerun()
        else:
            streamlit.error("Invalid email or password")

def chatbot():
    streamlit.title("Gemma Model Document Q&A")
    if "vectors" not in streamlit.session_state:
        streamlit.session_state.vectors = None

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

    def vector_embedding():
        if streamlit.session_state.vectors is not None:
            return
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        upload_folder = "uploaded_files"
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        uploaded_files = streamlit.file_uploader("Attach PDF Documents", type="pdf", accept_multiple_files=True)
        if uploaded_files:
            for uploaded_file in uploaded_files:
                file_path = os.path.join(upload_folder, uploaded_file.name)
                with open(file_path, "wb") as f:
                    f.write(uploaded_file.read())
            loader = PyPDFDirectoryLoader(upload_folder)
            docs = loader.load()
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            final_documents = splitter.split_documents(docs[:20])
            streamlit.session_state.vectors = FAISS.from_documents(final_documents, embeddings)
            streamlit.success("Vector Store is ready.")
        else:
            streamlit.info("Please upload at least one PDF to build embeddings.")

    prompt1 = streamlit.text_input("Enter Your Question From Documents")
    if streamlit.button("Build Embeddings"):
        vector_embedding()

    if prompt1:
        if streamlit.session_state.vectors is None:
            streamlit.warning("Please build embeddings first.")
        else:
            document_chain = create_stuff_documents_chain(llm, prompt)
            retriever = streamlit.session_state.vectors.as_retriever()
            retrieval_chain = create_retrieval_chain(retriever, document_chain)
            start = time.process_time()
            response = retrieval_chain.invoke({'input': prompt1})
            streamlit.write("Response time:", time.process_time() - start)
            streamlit.write(response['answer'])
            with streamlit.expander("Document Similarity Search"):
                for _, doc in enumerate(response["context"]):
                    streamlit.write(doc.page_content)
                    streamlit.write("--------------------------------")

if "logged_in" not in streamlit.session_state:
    streamlit.session_state.logged_in = False

if streamlit.session_state.logged_in:
    chatbot()
else:
    login()

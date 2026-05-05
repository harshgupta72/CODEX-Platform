import streamlit as st
import os
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()
groq_api_key = os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Define login credentials (for demonstration purposes only)
VALID_EMAIL = "user@example.com"
VALID_PASSWORD = "password123"

def login():
    """Login functionality"""
    st.title("Login Page")
    email = st.text_input("Email")
    password = st.text_input("Password", type="password")

    if st.button("Login"):
        if email == VALID_EMAIL and password == VALID_PASSWORD:
            st.session_state.logged_in = True
            st.success("Login successful! Redirecting...")
            st.experimental_rerun()
        else:
            st.error("Invalid email or password")

def initialize_session_state():
    """Initialize session state variables."""
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    if "vectors" not in st.session_state:
        st.session_state.vectors = None
    if "embeddings" not in st.session_state:
        st.session_state.embeddings = None
    if "loader" not in st.session_state:
        st.session_state.loader = None
    if "docs" not in st.session_state:
        st.session_state.docs = None
    if "text_splitter" not in st.session_state:
        st.session_state.text_splitter = None
    if "final_documents" not in st.session_state:
        st.session_state.final_documents = None

def chatbot():
    """Chatbot functionality"""
    st.title("Gemma Model Document Q&A")

    llm = ChatGroq(groq_api_key=groq_api_key, model_name="Gemma2-9b-it")

    prompt = ChatPromptTemplate.from_template(
        """
        Answer the questions based on the provided context only.
        Please provide the most accurate response based on the question
        <context>
        {context}
        <context>
        Questions:{input}

        """
    )

    def vector_embedding():
        if st.session_state.vectors is None:
            st.session_state.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

            # Handle file uploads
            uploaded_files = st.file_uploader("Attach PDF Documents", type="pdf", accept_multiple_files=True)
            if uploaded_files:
                upload_folder = "uploaded_files"
                if not os.path.exists(upload_folder):
                    os.makedirs(upload_folder)

                for uploaded_file in uploaded_files:
                    file_path = os.path.join(upload_folder, uploaded_file.name)
                    with open(file_path, "wb") as f:
                        f.write(uploaded_file.read())

                st.session_state.loader = PyPDFDirectoryLoader(upload_folder)  # Data ingestion
                st.session_state.docs = st.session_state.loader.load()  # Document loading
                st.session_state.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)  # Chunk creation
                st.session_state.final_documents = st.session_state.text_splitter.split_documents(st.session_state.docs[:20])  # Splitting
                st.session_state.vectors = FAISS.from_documents(st.session_state.final_documents, st.session_state.embeddings)  # Vector OpenAI embeddings

    prompt1 = st.text_input("Enter Your Question From Documents")

    if st.button("Documents Embedding"):
        vector_embedding()
        st.write("Vector Store DB Is Ready")

    if prompt1:
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = st.session_state.vectors.as_retriever()
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        start = time.process_time()
        response = retrieval_chain.invoke({'input': prompt1})
        st.write("Response time:", time.process_time() - start)
        st.write(response['answer'])

        with st.expander("Document Similarity Search"):
            for i, doc in enumerate(response["context"]):
                st.write(doc.page_content)
                st.write("--------------------------------")

# Initialize session state variables
initialize_session_state()

# Check login state
if st.session_state.logged_in:
    chatbot()
else:
    login()

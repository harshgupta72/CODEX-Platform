import streamlit as st
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
import os
import uuid
import time

load_dotenv()

# Load the GROQ and OpenAI API Key
groq_api_key = os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

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
    if st.session_state.get("vectors") is not None:
        return
    st.session_state.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    upload_folder = "uploaded_session_pdfs"
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    uploaded_files = st.file_uploader("Upload PDF documents", type="pdf", accept_multiple_files=True)
    if uploaded_files:
        for uploaded_file in uploaded_files:
            file_path = os.path.join(upload_folder, uploaded_file.name)
            with open(file_path, "wb") as f:
                f.write(uploaded_file.read())
        st.session_state.loader = PyPDFDirectoryLoader(upload_folder)
        st.session_state.docs = st.session_state.loader.load()
        st.session_state.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        st.session_state.final_documents = st.session_state.text_splitter.split_documents(st.session_state.docs[:20])
        st.session_state.vectors = FAISS.from_documents(st.session_state.final_documents, st.session_state.embeddings)
        st.success("Vector Store DB Is Ready")
    else:
        st.info("Please upload at least one PDF to build embeddings.")

# Generate a unique session ID if it doesn't exist
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())
    st.session_state.user_data = {}

# Display the session ID for user reference
st.sidebar.write(f"Session ID: {st.session_state.session_id}")

prompt1 = st.text_input("Enter Your Question From Documents")

if st.button("Documents Embedding"):
    vector_embedding()

if prompt1:
    if "vectors" in st.session_state and st.session_state.vectors is not None:
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = st.session_state.vectors.as_retriever()
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        start = time.process_time()
        response = retrieval_chain.invoke({'input': prompt1})
        elapsed_time = time.process_time() - start
        
        # Save query and response in session-specific user data
        if "queries" not in st.session_state.user_data:
            st.session_state.user_data["queries"] = []
        st.session_state.user_data["queries"].append({"question": prompt1, "response": response['answer']})
        
        st.write(f"Response: {response['answer']}")
        st.write(f"Response time: {elapsed_time:.2f} seconds")

        # With a Streamlit expander
        with st.expander("Document Similarity Search"):
            # Find the relevant chunks
            for i, doc in enumerate(response["context"]):
                st.write(doc.page_content)
                st.write("--------------------------------")

    else:
        st.write("Please embed the documents first!")

# Display user session data (queries and responses)
with st.sidebar.expander("Session Data"):
    if "queries" in st.session_state.user_data:
        for idx, entry in enumerate(st.session_state.user_data["queries"], 1):
            st.write(f"Query {idx}: {entry['question']}")
            st.write(f"Response: {entry['response']}\n")

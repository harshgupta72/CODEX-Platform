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
import time

load_dotenv()

groq_api_key = os.getenv('GROQ_API_KEY')
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY") or ""

st.set_page_config(page_title="Documents QnA", page_icon="🔍")
st.title("Documents QnA")

llm = ChatGroq(groq_api_key=groq_api_key, model_name="Gemma2-9b-it")

prompt = ChatPromptTemplate.from_template(
    """
    Answer the questions based on the provided context only.
    Please provide the most accurate response based on the question.
    <context>
    {context}
    <context>
    Questions: {input}
    """
)

def vector_embedding():
    if st.session_state.get("vectors") is not None:
        return
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    upload_folder = "uploaded_app1_pdfs"
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    uploaded_files = st.file_uploader("Upload PDF documents", type="pdf", accept_multiple_files=True)
    if uploaded_files:
        for uploaded_file in uploaded_files:
            file_path = os.path.join(upload_folder, uploaded_file.name)
            with open(file_path, "wb") as f:
                f.write(uploaded_file.read())
        loader = PyPDFDirectoryLoader(upload_folder)
        docs = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        final_documents = splitter.split_documents(docs[:20])
        st.session_state.vectors = FAISS.from_documents(final_documents, embeddings)
        st.success("Vector Store DB is ready!")
    else:
        st.info("Please upload at least one PDF to build embeddings.")

prompt1 = st.text_input("Enter your question from the documents:")

if st.button("Create Document Embeddings"):
    vector_embedding()

if prompt1:
    if st.session_state.get("vectors") is None:
        st.warning("Please create embeddings first.")
    else:
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = st.session_state.vectors.as_retriever()
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        start = time.process_time()
        response = retrieval_chain.invoke({'input': prompt1})
        st.write(f"Response time: {time.process_time() - start:.2f} seconds")
        st.subheader("Answer:")
        st.write(response['answer'])
        with st.expander("Document Similarity Search"):
            for _, doc in enumerate(response["context"]):
                st.write(doc.page_content)
                st.write("--------------------------------")


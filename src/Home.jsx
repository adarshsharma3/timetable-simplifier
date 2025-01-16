import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import BGVideo from "/home/adarsh/Adhiraj/Timetable/src/assets/Video.mp4";
import "tailwindcss/tailwind.css";

const FileUploadForm = () => {
  const [batch, setBatch] = useState("");
  const [file, setFile] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animateHeading, setAnimateHeading] = useState(false);
  const [message, setMessage] = useState(""); // Added message state
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Trigger the animation on page load
    setAnimateHeading(true);
  }, []);

  const handleBatchChange = (event) => {
    setBatch(event.target.value);
  };

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file || !batch) {
      alert("Please upload a file and enter a batch.");
      return;
    }

    setLoading();

    try {
      // Create a FormData object to send the file and batch
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batch", batch); // Not required that much 
    
      // Send a POST request to the Flask backend
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    
      // Assuming the response.data is already parsed JSON
      console.log(response.data);
      console.log(typeof(response.data));
      const result = JSON.parse(response.data)
      // Set timetable data
      
      setTimetable(JSON.stringify(result).df_dict);  // Use the correct response data
     console.log(timetable)
      // Set success message
      setMessage("File uploaded successfully!");
    
      // Redirect to result page
      navigate("/result", {
        state: {
          timetable: response.data.df_dict,  // Check if df_dict exists
          batch,
          formData,
          consolidated: JSON.stringify(response.data.consolidated),  // Assuming consolidated is in the response
        },
      });
    
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
    
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".xlsx,.pdf,.xls",
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-between ">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
      >
        <source src={BGVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 flex w-full h-full ">
        {/* Leftmost form */}
        <div className="w-[400px] min-h-[600px] bg-black bg-opacity-50 backdrop-blur-xl shadow-lg rounded-lg p-6 ml-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <h2 className="text-center text-2xl font-semibold mb-6 text-white">Upload Timetable</h2>

            <div>
              <label htmlFor="batch" className="block mb-2 text-sm font-medium text-white">
                Batch:
              </label>
              <input
                type="text"
                id="batch"
                value={batch}
                onChange={handleBatchChange}
                className="border p-3 w-full rounded-md"
                placeholder="Enter batch"
              />
            </div>

            <div
              {...getRootProps()}
              className="border p-4 cursor-pointer border-dashed rounded-md bg-gray-50 bg-opacity-50"
            >
              <input {...getInputProps()} />
              <p className="text-center text-sm text-gray-600 h-[37vh]">
                Drag and drop an Excel or PDF file here, or click to select files
              </p>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white py-3 px-6 rounded-md w-full"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>

          {message && ( // Display the success message if available
            <div className="mt-4 text-center text-white bg-green-500 p-2 rounded-md">
              {message}
            </div>
          )}
        </div>

        {/* Rightmost heading */}
        <div className="flex flex-col items-end justify-center w-full px-10 relative">
          {/* Heading with Background */}
          <h1 className="relative inline-block text-white text-[6rem] font-bold text-right z-10 px-4 py-2 rounded-md drop-shadow-[20rem]"
            style={{
              textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            Time Table
            <br />
            Simplifier
          </h1>
        </div>
      </div>
    </div>
  );
};

export default FileUploadForm;
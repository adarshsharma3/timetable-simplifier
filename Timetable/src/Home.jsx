import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import BGVideo from "/home/adarsh/Adhiraj/Timetable/src/assets/Video.mp4";
import "tailwindcss/tailwind.css";

const FileUploadForm = () => {
  const [batch, setBatch] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(""); // State for year input
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Trigger the animation on page load
  }, []);

  const handleBatchChange = (event) => {
    setBatch(event.target.value);
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file || !batch) {
        alert("Please set your year and enter a batch.");
        return;
    }

    setLoading(true);

    try {
        // Create a FormData object to send the file and batch
        const formData = new FormData();
        formData.append("file", file);
        formData.append("batch", batch);
        formData.append("year", year); // Include the year in the form data

        // Send a POST request to the Flask backend
        const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        // Handle the response as needed
        console.log(response.data);
        // alert("File uploaded successfully!");

        // Redirect to the result page or another page as needed
        navigate("/result", {
            state: {
                timetable: response.data.df_dict, // Assuming df_dict exists in the response
                consolidated: response.data.consolidated,
                batch,
                year,
            },
        });
    } catch (error) {
        console.error("Error uploading file", error);
        alert("Error uploading file.");
    } finally {
        setLoading(false);
    }
};

  const handleDownload = async () => {
    if (!year) {
      alert("Please enter a year.");
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:5000/download/${year}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Create a URL for the file and trigger the download

      // Agr vo excel download karwani ho uske lie 
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `timetable_${year}.xls`); // Set the file name
      // document.body.appendChild(link);
      // link.click();
      // link.remove();

      // Create a new File object and set it to the file input
      const fileBlob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const newFile = new File([fileBlob], `timetable_${year}.xls`, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      setFile(newFile); // Set the file state to the new file
     alert('File set successfully');  
    } catch (error) {
      console.error("Error downloading file", error);
      alert("Error downloading file.");
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
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Removed the file input area */}
            {/* <div
              {...getRootProps()}
              className="border p-4 cursor-pointer border-dashed rounded-md bg-gray-50 bg-opacity-50"
            >
              <input {...getInputProps()} />
              <p className="text-center text-sm text-gray-600 h-[37vh]">
                Drag and drop an Excel or PDF file here, or click to select files
              </p>
            </div> */}

            <button
              type="submit"
              className="bg-blue-500 text-white py-3 px-6 rounded-md w-full"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            {/* Year Input and Download Button */}
            <div>
              <label htmlFor="year" className="block mb-2 text-sm font-medium text-white">
                Year:
              </label>
              <input
                type="text"
                id="year"
                value={year}
                onChange={handleYearChange}
                className="border p-3 w-full rounded-md"
                placeholder="Enter year"
              />
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="bg-green-500 text-white py-3 px-6 rounded-md w-full"
            >
              Set Your Year
            </button>
          </form>
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
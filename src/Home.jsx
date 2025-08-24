import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";

const FileUploadForm = () => {
  const [batch, setBatch] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("");
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-6xl w-full flex items-center justify-between gap-16">
          {/* Left side - Form */}
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Timetable</h2>
                  <p className="text-gray-600">Set up your academic schedule</p>
                </div>

                {/* Batch Input */}
                <div className="space-y-2">
                  <label htmlFor="batch" className="block text-sm font-semibold text-gray-700">
                    Batch
                  </label>
                  <input
                    type="text"
                    id="batch"
                    value={batch}
                    onChange={handleBatchChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter your batch (e.g., F4)"
                  />
                </div>

                {/* Year Input */}
                <div className="space-y-2">
                  <label htmlFor="year" className="block text-sm font-semibold text-gray-700">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    id="year"
                    value={year}
                    onChange={handleYearChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Enter year (e.g., 1,2,3,4...)"
                  />
                </div>

                {/* File Upload Area */}
                {/* {!file && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Timetable File
                    </label>
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      <input {...getInputProps()} />
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600 mb-2">Drag and drop your timetable file here or just set your year </p>
                      <p className="text-sm text-gray-500">or click to browse files</p>
                      <p className="text-xs text-gray-400 mt-2">Supports: .xlsx, .xls, .pdf</p>
                    </div>
                  </div>
                )} */}

                {/* File Selected Display */}
                {/* {file && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">{file.name}</p>
                          <p className="text-sm text-green-600">File ready for upload</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )} */}

                {/* Set Year Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Set Your Year
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                      Generate Timetable
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right side - Heading */}
          <div className="hidden lg:block w-full max-w-2xl">
            <div className="text-right">
              <h1 className="text-7xl xl:text-8xl font-black text-white leading-tight mb-6">
                Time Table
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Simplifier
                </span>
                <br />
                <span className="text-6xl xl:text-7xl text-indigo-200">
                  128
                </span>
              </h1>
              <p className="text-xl text-indigo-100 font-medium">
                Streamline your academic schedule with intelligent automation
              </p>
              
              {/* Feature highlights */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-end gap-3 text-indigo-100">
                  <span className="text-lg">Smart conflict detection</span>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 text-indigo-100">
                  <span className="text-lg">Automated scheduling</span>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 text-indigo-100">
                  <span className="text-lg">Multiple format support</span>
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadForm;
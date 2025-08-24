import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Checkbox, cn } from "@nextui-org/react";
import axios from "axios";

const TimetableResult = () => {
  const { state } = useLocation(); // Retrieve state from URL
  const timetable = state?.timetable; // Get the timetable data
  const batch = state?.batch; // Get the batch information
  const consolidated = state?.consolidated;
  // const formData= state?.formData;
  const [selectedItems, setSelectedItems] = useState([]); // Array to hold selected course IDs
  const navigate = useNavigate(); // Hook to navigate to a different page
  
  console.log("Full response:", timetable);
  console.log("Full response:", consolidated);
  
  // Function to toggle the selection of a checkbox
  const handleCheckboxChange = (id) => {
    setSelectedItems((prevSelected) => {
      console.log('Previous selection:', prevSelected);
      // If the course is already selected, remove it
      if (prevSelected.includes(id)) {
        return prevSelected.filter((item) => item !== id);
      }
      // If the course is not selected, add it to the list
      return [...prevSelected, id];
    });
  };
  
  // Function to handle the submit action
  const handleSubmit = async () => {
    console.log(selectedItems);
    console.table(consolidated);
    if (selectedItems.length === 0) {
      alert("No courses selected.");
    } else {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/extract_batches",
          {
            batch: batch, // Batch information
            subject_codes: selectedItems, // Array of selected course IDs
            consolidated: consolidated,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          let result = response.data; // Axios automatically parses JSON
          // Check if result is a string and contains "NaN"
          // if (typeof result === "string") {
          // // Replace all occurrences of "NaN" in the string with "null"
          // result = result.replace(/NaN/g, 'null');
          // }
          // Axios automatically parses JSON
          console.log("HII", result);
          // Store the result in localStorage
          // localStorage.setItem("result", JSON.stringify(result));
          // Navigate to a new page with the result
          navigate("/finalresult", { state: { result, timetable, batch } });
        } else {
          alert("Error fetching data from server.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("There was an error with the request.");
      }
    }
  };

  // Color scheme from the timetable image
  const getSubjectColor = (index) => {
    const colors = [
      "bg-cyan-400",      // Teal/Cyan from image
      "bg-purple-500",    // Purple from image  
      "bg-teal-500",      // Green/Teal from image
      "bg-blue-500",      // Blue variations
      "bg-indigo-500",    // Purple gradient colors from header
      "bg-cyan-500",      // More cyan variations
      "bg-purple-600",    // Darker purple
      "bg-teal-600",      // Darker teal
      "bg-blue-600",      // Darker blue
      "bg-indigo-600"     // Darker indigo
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header matching the timetable style */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header with gradient like in the image */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-6 text-center">
            <h2 className="text-3xl font-bold mb-2">Weekly Timetable</h2>
            <div className="flex items-center justify-center gap-2 text-indigo-100">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Display batch information */}
          {batch && (
            <div className="bg-gray-50 px-6 py-4 border-b">
              <p className="text-lg text-center font-medium">
                Batch: <span className="text-indigo-600 font-semibold">{batch}</span>
              </p>
            </div>
          )}

          {/* Subject selection section */}
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Choose Your Subjects</h2>
            
            {/* Check if timetable data exists */}
            {timetable ? (
              <div className="space-y-4">
                {/* Grid layout for subject cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Iterate through the timetable and render each course */}
                  {Object.keys(timetable).map((courseName, index) => {
                    const courseId = timetable[courseName];
                    const colorClass = getSubjectColor(index);
                    const isSelected = selectedItems.includes(courseId);
                    
                    return (
                      <div key={courseId} className="flex justify-center">
                        <div 
                          className={`relative w-full max-w-md rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Checkbox
                            aria-label={courseName}
                            classNames={{
                              base: cn(
                                "inline-flex w-full",
                                "hover:bg-transparent items-center justify-between",
                                "cursor-pointer rounded-lg gap-4 p-4 border-0",
                                "bg-transparent"
                              ),
                              label: "w-full",
                            }}
                            isSelected={isSelected}
                            onValueChange={() => handleCheckboxChange(courseId)}
                          >
                            <div className="w-full">
                              {/* Color indicator matching timetable style */}
                              <div className={`w-full h-2 ${colorClass} rounded mb-3`}></div>
                              
                              <div className="flex justify-between items-start gap-4">
                                {/* Course name */}
                                <span className="font-semibold text-gray-900 leading-tight flex-1">
                                  {courseName}
                                </span>
                                {/* Course code */}
                                <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                  {courseId}
                                </span>
                              </div>
                            </div>
                          </Checkbox>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Selected count indicator */}
                {selectedItems.length > 0 && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-indigo-800 font-medium text-center">
                      {selectedItems.length} subject{selectedItems.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">No timetable data available.</p>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={selectedItems.length === 0}
                className={`px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2 ${
                  selectedItems.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Submit
                {selectedItems.length > 0 && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {selectedItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableResult;
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
          //   // Replace all occurrences of "NaN" in the string with "null"
          //   result = result.replace(/NaN/g, 'null');
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
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-[#E2F1E7] p-8 rounded-lg shadow-lg w-full">
        <h2 className="text-2xl text-center font-semibold mb-6">Choose Your Subjects</h2>
        {/* Display batch information */}
        {batch && (
          <p className="text-lg text-center font-medium mb-4">
            Batch: <span className="text-green-600">{batch}</span>
          </p>
        )}
        {/* Check if timetable data exists */}
        {timetable ? (
          <div className="space-y-4">
            {/* Main Flex Container for Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
              {/* Iterate through the timetable and render each course */}
              {Object.keys(timetable).map((courseName, index) => {
                const courseId = timetable[courseName];
                return (
                  <div key={courseId} className="flex justify-center">
                    <Checkbox
                      aria-label={courseName}
                      classNames={{
                        base: cn(
                          "inline-flex w-full max-w-md",
                          "hover:bg-content2 items-center justify-between",
                          "cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                          "data-[selected=true]:border-primary",
                          "bg-[#243642]"
                        ),
                        label: "w-full",
                      }}
                      isSelected={selectedItems.includes(courseId)} // Determine if course is selected
                      onValueChange={() => handleCheckboxChange(courseId)} // Toggle course selection
                    >
                      <div className="w-full flex justify-between gap-4">
                        {/* Display course name and code with space between checkbox and name */}
                        <span className="font-semibold text-white">{courseName}</span>
                        <span className="text-tiny text-gray-300">{courseId}</span> {/* Adjusted text color for contrast */}
                      </div>
                    </Checkbox>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p>No timetable data available.</p> // Display if no timetable data is found
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-center w-full">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white py-2 px-6 rounded-md w-full sm:w-[calc(50%-1rem)] h-16 hover:bg-green-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimetableResult;

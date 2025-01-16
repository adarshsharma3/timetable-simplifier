import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ResultPage = () => {
  const { state } = useLocation(); // Retrieve the state passed from the previous page
  const result = state?.result; // Get the result data
  const [subjectMapping, setSubjectMapping] = useState({}); // To store subject code to subject name mapping
  const [loading, setLoading] = useState(true); // Loading state
   console.log(result);
  useEffect(() => {
    const fetchSubjectMapping = async () => {
      try {
        
        const response = await fetch("http://127.0.0.1:5000/get_cleaned_subject_data");
        if (response.ok) {
          const data = await response.json();
          setSubjectMapping(data); // Assuming the API returns a JSON object
        } else {
          console.error("Failed to fetch subject mapping");
        }
      } catch (error) {
        console.error("Error fetching subject mapping:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectMapping();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div>Loading subject mapping...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-[#E2F1E7] p-8 rounded-lg shadow-lg w-full">
        <h2 className="text-2xl text-center font-semibold mb-6">Filtered Timetable</h2>
        {/* Display result */}
        {result ? (
          <div className="space-y-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">Batch</th>
                  <th className="px-4 py-2">Subject</th> {/* Updated column name */}
                  <th className="px-4 py-2">Subject Code</th>
                  <th className="px-4 py-2">Room</th>
                </tr>
              </thead>
              <tbody>
                {result.map((row, index) => {
                  const subjectName = subjectMapping[row.subject_code] || "Unknown Subject";
                  return (
                    <tr key={index}>
                      <td className="px-4 py-2">{row.batch}</td>
                      <td className="px-4 py-2">{subjectName}</td> {/* Displaying subject name */}
                      <td className="px-4 py-2">{row.subject_code}</td>
                      <td className="px-4 py-2">{row.room}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No results available.</p>
        )}
      </div>
    </div>
  );
};

export default ResultPage;

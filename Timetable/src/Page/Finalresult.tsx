import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ResultPage = () => {
  const { state } = useLocation();
  const result1 = state?.result;
  const timetable = state?.timetable;
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null); // State to hold selected class info
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    if (timetable) {
      setLoading(false);
    }
  }, [timetable]);

  const parseClassInfo = (info) => {
    if (info === null || !info || info === "NaN" || Number.isNaN(info)) {
      return { subject: "", room: "", fullInfo: "" };
    }

    const codeMatch = info.match(/\(([^)]+)\)/);
    const code = codeMatch ? codeMatch[1] : "";
    const subject = Object.keys(timetable).find(key => timetable[key] === code) || "";

    return { subject, room: info, fullInfo: info };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div>Loading subject mapping...</div>
      </div>
    );
  }

  const validResult = Array.isArray(result1) ? result1 : [];
  if (validResult.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <p>Array is having problem.</p>
      </div>
    );
  }

  const firstEntry = validResult[0];
  const timeSlots = Object.keys(firstEntry || {}).filter(key =>
    key !== "Day" && (key.includes("AM") || key.includes("PM"))
  );

  // Custom order for time slots
  
const timeOrder = [
  "8:00 - 8:50 AM", "9 - 9:50 AM", "10:00-10:50 AM", 
  "11:00-11:50 AM", "12:00 - 12:50 PM", "1:00 PM - 1:50PM", 
  "2:00 PM - 2:50 PM", "3:00 PM - 3 :50 PM", "4:00 PM -4:50 PM", 
  "5:00 PM -5:50 PM"
];

  // Sort time slots based on custom order
  const sortedTimeSlots = timeSlots.sort((a, b) => {
    const indexA = timeOrder.indexOf(a.trim());
    const indexB = timeOrder.indexOf(b.trim());
    return indexA - indexB; // Sort based on the index in timeOrder
  });

  const groupedClasses = validResult.reduce((acc, daySchedule, dayIndex) => {
    const day = days[dayIndex % 6];

    sortedTimeSlots.forEach(timeSlot => {
      const classInfo = parseClassInfo(daySchedule[timeSlot]);
      if (classInfo.subject) {
        if (!acc[day]) {
          acc[day] = {};
        }
        if (!acc[day][timeSlot]) {
          acc[day][timeSlot] = [];
        }
        acc[day][timeSlot].push(classInfo);
      }
    });

    return acc;
  }, {});

  // Function to handle class click
  const handleClassClick = (classInfo) => {
    setSelectedClass(classInfo); // Set the selected class info
    setIsModalOpen(true); // Open the modal
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null); // Clear the selected class info when closing the modal
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="min-h-screen bg-[#E2F1E7] p-8 rounded-lg shadow-lg w-full overflow-x-auto">
        <h2 className="text-2xl text-center font-semibold mb-6">Weekly Timetable</h2>
        
        {/* Gantt Chart Representation */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-green-50">
                <th className="px-6 py-4 border border-green-200">Day</th>
                {sortedTimeSlots.map((timeSlot) => (
                  <th key={timeSlot} className="px-6 py-4 border border-green-200" style={{ minWidth: '150px' }}>{timeSlot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day} className="border-b border-green-100">
                  <td className="px-8 py-5 font-medium border border-green-200 bg-green-50">{day}</td>
                  {sortedTimeSlots.map((timeSlot) => {
                    const classes = groupedClasses[day]?.[timeSlot] || [];
                    return (
                      <td key={timeSlot} className="border border-green-200 relative">
                        {classes.map((slot, index) => (
                          <div 
                            key={index} 
                            className="absolute bg-blue-200 rounded p-1 cursor-pointer" 
                            style={{
                              left: 0,
                              top: index * 20, // Adjust spacing for multiple classes
                              width: '100%',
                              height: 'auto', // Allow height to adjust based on content
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            onClick={() => handleClassClick(slot)} // Add click handler
                          >
                            {slot.subject} - {slot.fullInfo}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for displaying selected class information */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="font-semibold">Class Details:</h3>
              <p><strong>Subject:</strong> {selectedClass.subject}</p>
              <p><strong>Location & Teacher</strong>: {selectedClass.fullInfo}</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" 
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
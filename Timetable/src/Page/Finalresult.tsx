import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ResultPage = () => {
  const { state } = useLocation();
  const result1 = state?.result;
  const timetable = state?.timetable;
  const [loading, setLoading] = useState(true);
  // console.table(result1);

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
    console.table(result1);
  }, [timetable]);

  // Updated parseClassInfo to extract subject name from timetable
  const parseClassInfo = (info) => {
    if (info === null || !info || info === "NaN" || Number.isNaN(info)) {
      return { subject: "", room: "", fullInfo: "" }; // Return empty values if info is invalid
    }

    // Extract the code from the info string
    const codeMatch = info.match(/\(([^)]+)\)/);
    const code = codeMatch ? codeMatch[1] : "";

    // Find the subject name using the code
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

  // Group classes by day and time
  const groupedClasses = validResult.reduce((acc, daySchedule, dayIndex) => {
    const day = days[dayIndex % 6]; // Use modulo to loop through days

    timeSlots.forEach(timeSlot => {
      const classInfo = parseClassInfo(daySchedule[timeSlot]);
      if (classInfo.subject) {
        // If the day and time slot already exist, push the class info
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-[#E2F1E7] p-8 rounded-lg shadow-lg w-full overflow-x-auto">
        <h2 className="text-2xl text-center font-semibold mb-6">Weekly Timetable</h2>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2 border border-green-200">Day</th>
              <th className="px-4 py-2 border border-green-200">Time</th>
              <th className="px-4 py-2 border border-green-200">Class Details</th>
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              Object.keys(groupedClasses[day] || {}).map((timeSlot, timeIndex) => (
                <tr key={`${day}-${timeSlot}`} className="border-b border-green-100">
                  <td className="px-4 py-2 font-medium border border-green-200 bg-green-50">
                    {timeIndex === 0 ? day : ""} {/* Show day only for the first time slot */}
                  </td>
                  <td className="px-4 py-2 border border-green-200">
                    {timeSlot}
                  </td>
                  <td className="px-4 py-2 border border-green-200">
                    {groupedClasses[day][timeSlot].map((slot, index) => (
                      <div key={index} className="mb-1 p-2 bg-white rounded shadow-sm">
                        {slot.subject} - {slot.fullInfo}
                      </div>
                    ))}
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultPage;
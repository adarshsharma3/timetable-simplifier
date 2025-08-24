import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Clock, MapPin, BookOpen, X, Calendar } from "lucide-react";

const ResultPage = () => {
  const { state } = useLocation();
  const result1 = state?.result;
  const timetable = state?.timetable;
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const parseClassInfo = (info) => {
    if (info === null || !info || info === "NaN" || Number.isNaN(info)) {
      return { subject: "", room: "", teacher: "", fullInfo: "" };
    }

    const codeMatch = info.match(/\(([^)]+)\)/);
    const code = codeMatch ? codeMatch[1] : "";
    const subject = Object.keys(timetable).find(key => timetable[key] === code) || 
                   info.split('(')[0].trim();
    
    // Extract room and teacher info
    const detailsMatch = info.match(/\(([^)]+)\)/);
    const details = detailsMatch ? detailsMatch[1] : "";
    const [room, teacher] = details.split(',').map(item => item?.trim() || "");

    return { subject, room, teacher, fullInfo: info };
  };

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const timeSlotRanges = {
      "8:00 - 8:50 AM": [8 * 60, 8 * 60 + 50],
      "9 - 9:50 AM": [9 * 60, 9 * 60 + 50],
      "10:00-10:50 AM": [10 * 60, 10 * 60 + 50],
      "11:00-11:50 AM": [11 * 60, 11 * 60 + 50],
      "12:00 - 12:50 PM": [12 * 60, 12 * 60 + 50],
      "1:00 PM - 1:50PM": [13 * 60, 13 * 60 + 50],
      "2:00 PM - 2:50 PM": [14 * 60, 14 * 60 + 50],
      "3:00 PM - 3 :50 PM": [15 * 60, 15 * 60 + 50],
      "4:00 PM -4:50 PM": [16 * 60, 16 * 60 + 50],
      "5:00 PM -5:50 PM": [17 * 60, 17 * 60 + 50],
    };

    return Object.keys(timeSlotRanges).find(slot => {
      const [start, end] = timeSlotRanges[slot];
      return currentTime >= start && currentTime <= end;
    });
  };

  const getCurrentDay = () => {
    const today = new Date().getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[today];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading subject mapping...</p>
        </div>
      </div>
    );
  }

  const validResult = Array.isArray(result1) ? result1 : [];
  if (validResult.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Array is having problem.</p>
        </div>
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
    return indexA - indexB;
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

  const handleClassClick = (classInfo, day, timeSlot) => {
    setSelectedClass({ ...classInfo, day, timeSlot });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const currentTimeSlot = getCurrentTimeSlot();
  const currentDay = getCurrentDay();

  const getSubjectColor = (subject) => {
    const colors = [
      'bg-blue-500 border-blue-600',
      'bg-purple-500 border-purple-600', 
      'bg-green-500 border-green-600',
      'bg-indigo-500 border-indigo-600',
      'bg-red-500 border-red-600',
      'bg-yellow-500 border-yellow-600',
      'bg-pink-500 border-pink-600',
      'bg-teal-500 border-teal-600',
      'bg-orange-500 border-orange-600',
      'bg-cyan-500 border-cyan-600',
    ];
    
    // Use subject name to consistently assign colors
    const hash = subject.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Weekly Timetable</h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Timetable Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Day
                    </div>
                  </th>
                  {sortedTimeSlots.map((timeSlot) => (
                    <th key={timeSlot} className="px-4 py-4 text-center font-semibold" style={{ minWidth: '200px' }}>
                      <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4 mb-1" />
                        <span className="text-sm">{timeSlot}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr 
                    key={day} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      currentDay === day ? 'bg-indigo-50 border-indigo-200' : ''
                    }`}
                  >
                    <td className={`px-6 py-6 font-semibold ${
                      currentDay === day 
                        ? 'bg-indigo-100 text-indigo-800 border-r-2 border-indigo-300' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        {currentDay === day && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        )}
                        {day}
                      </div>
                    </td>
                    {sortedTimeSlots.map((timeSlot) => {
                      const classes = groupedClasses[day]?.[timeSlot] || [];
                      const isCurrentSlot = currentDay === day && currentTimeSlot === timeSlot;
                      
                      return (
                        <td key={timeSlot} className={`px-2 py-2 relative h-20 ${
                          isCurrentSlot ? 'bg-yellow-50 border border-yellow-300' : ''
                        }`}>
                          {classes.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-300">
                              <span className="text-xs">Free</span>
                            </div>
                          ) : (
                            classes.map((classInfo, index) => (
                              <div 
                                key={index}
                                className={`
                                  ${getSubjectColor(classInfo.subject)} text-white
                                  rounded-lg p-2 cursor-pointer shadow-md
                                  hover:shadow-lg hover:scale-105 
                                  transition-all duration-200 ease-in-out
                                  border-l-4 relative overflow-hidden
                                  ${isCurrentSlot ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
                                `}
                                onClick={() => handleClassClick(classInfo, day, timeSlot)}
                                style={{
                                  marginTop: index > 0 ? '4px' : '0',
                                  width: '100%',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                <div className="relative z-10">
                                  <div className="font-semibold text-sm mb-1 truncate">
                                    {classInfo.subject || 'Class'}
                                  </div>
                                  <div className="text-xs opacity-90 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{classInfo.fullInfo}</span>
                                  </div>
                                </div>
                                {isCurrentSlot && (
                                  <div className="absolute top-1 right-1">
                                    <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject Legend */}
        {timetable && Object.keys(timetable).length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Subject Legend
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.keys(timetable).map(subject => (
                <div key={subject} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${getSubjectColor(subject)}`}></div>
                  <span className="text-sm text-gray-600">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className={`${getSubjectColor(selectedClass.subject)} px-6 py-4 text-white`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {selectedClass.subject || 'Class Details'}
                  </h3>
                  <button 
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Day & Time</p>
                    <p className="font-semibold">{selectedClass.day}, {selectedClass.timeSlot}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Location & Teacher</p>
                    <p className="font-semibold">{selectedClass.fullInfo || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
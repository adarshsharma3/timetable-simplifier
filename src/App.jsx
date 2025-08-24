import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploadForm from './Home';
import TimetableResult from './Page/TimetableResult'; // New result page component
import ResultPage from './Page/Finalresult'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUploadForm />} />
        <Route path="/result" element={<TimetableResult />} />
        <Route path="/finalresult" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}

export default App;




// const timeOrder = [
//   "8:00 - 8:50 AM", "9 - 9:50 AM", "10:00-10:50 AM", 
//   "11:00-11:50 AM", "12:00 - 12:50 PM", "1:00 PM - 1:50PM", 
//   "2:00 PM - 2:50 PM", "3:00 PM - 3 :50 PM", "4:00 PM -4:50 PM", 
//   "5:00 PM -5:50 PM"
// ];

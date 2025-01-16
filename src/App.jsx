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

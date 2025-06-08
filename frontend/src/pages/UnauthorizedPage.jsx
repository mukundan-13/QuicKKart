import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] bg-red-100 text-red-800">
      <h1 className="text-5xl font-bold mb-4">403</h1>
      <h2 className="text-2xl mb-4">Unauthorized Access</h2>
      <p className="text-lg text-center mb-6">
        You do not have permission to view this page.
      </p>
      <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300">
        Go to Home
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
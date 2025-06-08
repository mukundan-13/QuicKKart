import React from 'react';

const HomePage = () => {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to QuicKKart!</h1>
      <p className="text-lg text-gray-600">Your one-stop shop for everything you need.</p>
      <div className="mt-8">
        <img src="url" alt="Placeholder Products" className="mx-auto rounded-lg shadow-lg" />
      </div>
      <p className="mt-4 text-gray-700">Explore our wide range of products and find the best deals.</p>
    </div>
  );
};

export default HomePage
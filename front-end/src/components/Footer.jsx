import React from 'react';


const Footer = () => {
  const groupMembers = [
    "Julius Tegar", "Ivan Pratomo", "Jerico Ashiddqy", "Rajaswa Umar"
  ];


  return (
    <footer className="bg-gray-200 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Tim Pengembang:</h3>
          <p className="bg-white px-3 py-1 rounded-full text-sm border text-gray-500 mb-4 inline-block">Team9Devs</p>
          <hr className="my-0" />
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-1">Anggota Kelompok:</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {groupMembers.map((member, index) => (
                <span key={index} className="bg-white px-3 py-1 rounded-full text-sm border text-gray-600">
                  {member}
                </span>
              ))}
            </div>
          </div>
          <hr className="my-1" />
          <div className="text-sm text-gray-500">
            <p>&copy; 2025 CampusMart.<br></br> Dibuat sebagai Tugas Project.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
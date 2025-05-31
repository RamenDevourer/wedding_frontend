import { useState } from "react";
import Dashboard from "./dashboard-components/dashboard.jsx";
import Tags from "./dashboard-components/tags.jsx";
import Posts from "./dashboard-components/posts.jsx";

function BlogDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "posts":
        return <Posts />;
      case "tags":
        return <Tags />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="blog-admin-dashboard flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="sidebar w-64 bg-gradient-to-b from-blue-800 to-indigo-900 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold mb-6">Blog Admin</h1>
        </div>
        
        <nav className="mt-2">
          <button 
            className={`flex items-center w-full px-6 py-3 transition-all duration-300 ease-in-out
              ${activeSection === "dashboard" 
                ? "bg-white bg-opacity-20 border-l-4 border-white" 
                : "hover:bg-white hover:bg-opacity-10"}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Dashboard
          </button>
          
          <button 
            className={`flex items-center w-full px-6 py-3 transition-all duration-300 ease-in-out
              ${activeSection === "posts" 
                ? "bg-white bg-opacity-20 border-l-4 border-white" 
                : "hover:bg-white hover:bg-opacity-10"}`}
            onClick={() => setActiveSection("posts")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Posts
          </button>
          
          <button 
            className={`flex items-center w-full px-6 py-3 transition-all duration-300 ease-in-out
              ${activeSection === "tags" 
                ? "bg-white bg-opacity-20 border-l-4 border-white" 
                : "hover:bg-white hover:bg-opacity-10"}`}
            onClick={() => setActiveSection("tags")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Tags
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">
            {activeSection === "dashboard" && "Dashboard"}
            {activeSection === "posts" && "Blog Posts"}
            {activeSection === "tags" && "Blog Tags"}
          </h2>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default BlogDashboard;

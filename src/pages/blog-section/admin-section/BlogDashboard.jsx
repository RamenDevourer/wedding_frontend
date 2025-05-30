import { useState } from "react";
import Dashboard from "./dashboard-components/dashboard.jsx";
import Tags from "./dashboard-components/tags.jsx";
import Posts from "./dashboard-components/posts.jsx";

function BlogDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
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
    <div className="blog-admin-dashboard">
      <div className="admin-header">
        <h1 className="text-2xl font-bold mb-6">Blog Administration</h1>
      </div>
      
      <div className="tab-navigation flex border-b mb-6">
        <button 
          className={`py-2 px-4 mr-2 ${activeTab === "dashboard" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button 
          className={`py-2 px-4 mr-2 ${activeTab === "posts" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === "tags" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setActiveTab("tags")}
        >
          Tags
        </button>
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default BlogDashboard;

import React, { useState } from 'react';
import { useGetBlogsQuery, useDeleteBlogMutation } from '../../../../redux/blogSlice';

export default function Posts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('published'); // 'published', 'draft', 'all'
  
  // Get blogs with filters
  const { data: blogs, isLoading, isError, refetch } = useGetBlogsQuery({
    s: searchTerm || undefined,
    tag: selectedTag || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined
  });

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id).unwrap();
        alert('Blog post deleted successfully');
        refetch();
      } catch (error) {
        alert('Failed to delete blog post: ' + (error.data?.message || 'Unknown error'));
      }
    }
  };

  const handleEdit = (id) => {
    // In a real application, this would navigate to an edit page or open a modal
    alert(`Edit blog with ID: ${id}`);
  };

  return (
    <div className="posts-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Blog Posts</h2>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => alert("Create New Post")}
        >
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="filters mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            className="border rounded px-3 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="border rounded px-3 py-2"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {/* In a real app, you would map through available tags */}
            <option value="wedding">Wedding</option>
            <option value="engagement">Engagement</option>
            <option value="planning">Planning</option>
          </select>
          
          <select 
            className="border rounded px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          
          <button 
            type="submit"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Blog Posts Table */}
      {isLoading ? (
        <div className="text-center p-4">Loading posts...</div>
      ) : isError ? (
        <div className="text-center p-4 text-red-600">Error loading posts. Please try again.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blogs?.length > 0 ? (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                      <div className="text-sm text-gray-500">{blog.urlTitle}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.viewCount || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleEdit(blog.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                    No blog posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

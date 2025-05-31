import React, { useState, useEffect } from 'react';
import { useGetBlogsQuery, useDeleteBlogMutation, useGetAllTagsQuery, useUpdateBlogMutation } from '../../../../redux/blogSlice';
// Import icons from react-icons
import { FiPlus, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi'; 
import { FaCheckCircle, FaPencilAlt, FaThumbsDown, FaTrash, FaEye, FaExclamationCircle } from 'react-icons/fa';
import { BsImage, BsStar } from 'react-icons/bs';

export default function Posts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'published', 'draft', 'all'
  const [animate, setAnimate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  // Get blogs with filters and pagination
  const { data: blogs, isLoading, isError, refetch } = useGetBlogsQuery({
    s: (currentPage - 1) * postsPerPage, // Calculate skip based on page number
    t: postsPerPage, // Number of items per page
    tag: selectedTag || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined
  }, {
    refetchOnMountOrArgChange: true
  });
  // Calculate total pages with fallbacks and protection against division by zero
  const totalItems = blogs?.totalCount || 0;
  const totalPages = postsPerPage > 0 ? Math.max(1, Math.ceil(totalItems / postsPerPage)) : 1;
  
  // Debug pagination data
  useEffect(() => {
    if (blogs) {
      console.log('Blogs response:', blogs);
      console.log('Total items:', totalItems);
      console.log('Current page:', currentPage);
      console.log('Items per page:', postsPerPage);
      console.log('Total pages:', totalPages);
    }
  }, [blogs, totalItems, currentPage, postsPerPage, totalPages]);
  
  // Get tags for filter dropdown
  const { data: tags } = useGetAllTagsQuery();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [updateBlog, { isLoading: isUpdatingStatus }] = useUpdateBlogMutation();
  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => {
      setAnimate(true);
    }, 100);
  }, []);
  // Handle pagination changes
  useEffect(() => {
    // Make sure current page is valid when total pages changes
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  // Explicitly refetch when pagination parameters change
  useEffect(() => {
    console.log('Refetching due to pagination parameters change');
    refetch();
  }, [currentPage, postsPerPage, refetch]);
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when applying new filters
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
    // Navigate to edit page
    window.location.href = `/admin/blog/edit/${id}`;
  };
  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      // Use the updateBlog mutation from the Redux slice
      await updateBlog({ 
        id, 
        blogData: { status: newStatus } 
      }).unwrap();
      alert(`Blog status updated to "${newStatus}"`);
      
      // Refresh the blogs list
      refetch();
    } catch (error) {
      alert('Failed to update blog status: ' + (error?.data?.message || 'Unknown error'));
    }
  };  // Get blogs from API
  const getBlogsList = () => {
    // If we have data from the API, return it
    if (blogs?.data && Array.isArray(blogs.data)) {
      return blogs.data;
    } else if (blogs?.data?.length === 0) {
      // API returns empty array
      console.log('API returned empty blog list');
      return [];
    } else if (!blogs) {
      // No response yet
      console.log('Waiting for API response...');
      return [];
    } else {
      // Unexpected response format
      console.error('Unexpected blog data format:', blogs);
      return [];
    }
  };
    // Get tags for dropdown
  const getAvailableTags = () => {
    if (tags?.data && Array.isArray(tags.data)) return tags.data;
    return [];
  };
  
  const blogsList = getBlogsList();
  const availableTags = getAvailableTags();

  return (
    <div className="posts-container">
      <div className={`flex justify-between items-center mb-6 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
        <div></div> {/* Empty div for spacing */}        <button 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center"
          onClick={() => alert("Create New Post")}
        >
          <FiPlus className="h-5 w-5 mr-2" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className={`bg-white rounded-lg shadow-md p-6 mb-6 transform transition-all duration-500 delay-100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
        <h3 className="text-lg font-medium mb-4 text-gray-800">Filter Posts</h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              className="border rounded-lg pl-10 pr-3 py-2 w-full focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-300"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >            <option value="">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag.id} value={tag.tagName}>{tag.tagName}</option>
            ))}
          </select>
          
          <select 
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>            <div className="flex items-center space-x-2">
              <button 
                type="submit"
                className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-all duration-300 flex justify-center items-center"
              >
                <FiFilter className="h-5 w-5 mr-1" />
                Apply Filters
              </button>
              
              <select
                value={postsPerPage}
                onChange={(e) => {
                  setPostsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-300"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
        </form>
      </div>

      {/* Blog Posts Table */}
      <div className={`transform transition-all duration-500 delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
        {isLoading ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : isError ? (
          <div className="text-center p-12 bg-white rounded-lg shadow-md text-red-600">            <FaExclamationCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p>Error loading posts. Please try again.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {blogsList?.length > 0 ? (
                    blogsList.map((blog, index) => (                      <tr key={blog.id} className={`hover:bg-gray-50 transform transition-all duration-500 ${animate ? 'translate-x-0 opacity-100' : 'translate-x-5 opacity-0'}`} style={{ transitionDelay: `${index * 50 + 300}ms` }}>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3">
                              {blog.coverImage ? (
                                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                              ) : blog.imageUrl ? (
                                <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                              ) : (                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-500">
                                  <BsImage className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 mb-1">{blog.title}</div>
                              <div className="text-xs text-gray-500">{blog.slug || blog.urlTitle}</div>
                              {blog.featured && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">                                    <BsStar className="mr-1 h-3 w-3" />
                                    Featured
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                            blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>                            {blog.status === 'published' ? (
                              <FaCheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <FaPencilAlt className="h-3 w-3 mr-1" />
                            )}
                            {blog.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {blog.status === 'published' ? (
                            <div className="flex items-center text-sm text-gray-500">                              <FaEye className="h-4 w-4 text-blue-500 mr-1" />
                              <span>{blog.viewCount || 0}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {blog.author?.name ? (
                            <div className="flex items-center">
                              {blog.author.avatar && (
                                <img src={blog.author.avatar} alt={blog.author.name} className="w-5 h-5 rounded-full mr-2" />
                              )}
                              <span className="text-sm text-gray-700">{blog.author.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">{blog.author || 'Anonymous'}</span>
                          )}
                        </td>                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => window.open(`/blog/${blog.urlTitle || blog.slug}`, '_blank')}
                              className="text-blue-600 hover:text-blue-900 transition-all duration-300 p-1 rounded-full hover:bg-blue-50"
                              title="View blog post"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(blog.id)}
                              className="text-indigo-600 hover:text-indigo-900 transition-all duration-300 p-1 rounded-full hover:bg-indigo-50"
                              title="Edit blog post"
                            >
                              <FaPencilAlt className="h-4 w-4" />
                            </button>                            
                            <button 
                              onClick={() => handleStatusToggle(blog.id, blog.status)}
                              className={`transition-all duration-300 p-1 rounded-full ${
                                blog.status === 'published' 
                                  ? 'text-amber-600 hover:text-amber-900 hover:bg-amber-50' 
                                  : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                              }`}
                              title={blog.status === 'published' ? 'Change to draft' : 'Publish blog post'}
                              disabled={isUpdatingStatus}
                            >
                              {isUpdatingStatus ? (
                                <div className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent"></div>
                              ) : blog.status === 'published' ? (
                                <FaThumbsDown className="h-4 w-4" />
                              ) : (
                                <FaCheckCircle className="h-4 w-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleDelete(blog.id)}
                              className="text-red-600 hover:text-red-900 transition-all duration-300 p-1 rounded-full hover:bg-red-50"
                              disabled={isDeleting}
                              title="Delete blog post"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">                        <FiPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p>No blog posts found</p>
                      </td>
                    </tr>
                  )}
                </tbody>              </table>
            </div>
              {/* Pagination Controls */}
            {blogs?.data && blogs?.data.length > 0 && totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage >= totalPages 
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{blogs?.data?.length > 0 ? (currentPage - 1) * postsPerPage + 1 : 0}</span> to{' '}
                      <span className="font-medium">
                        {Math.min((currentPage - 1) * postsPerPage + (blogs?.data?.length || 0), totalItems)}
                      </span>{' '}
                      of <span className="font-medium">{totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {/* Previous page */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >                        <span className="sr-only">Previous</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>                        {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNumber = index + 1;
                        // Calculate display logic for pagination
                        const isFirstPage = pageNumber === 1;
                        const isLastPage = pageNumber === totalPages;
                        const isCurrentPage = pageNumber === currentPage;
                        const isWithinRange = pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1;
                        const shouldDisplayPageNumber = isFirstPage || isLastPage || isWithinRange;
                        
                        // Display ellipsis
                        const shouldDisplayLeftEllipsis = pageNumber === 2 && currentPage > 3;
                        const shouldDisplayRightEllipsis = pageNumber === totalPages - 1 && currentPage < totalPages - 2;
                        
                        // Return the page number button
                        if (shouldDisplayPageNumber) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                isCurrentPage
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                        
                        // Return left ellipsis
                        if (shouldDisplayLeftEllipsis) {
                          return (
                            <span
                              key="ellipsis-left"
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              &hellip;
                            </span>
                          );
                        }
                        
                        // Return right ellipsis
                        if (shouldDisplayRightEllipsis) {
                          return (
                            <span
                              key="ellipsis-right"
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              &hellip;
                            </span>
                          );
                        }
                        
                        return null;
                      })}
                      
                      {/* Next page */}                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
                        disabled={currentPage >= (totalPages || 1)}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage >= (totalPages || 1)
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >                        <span className="sr-only">Next</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

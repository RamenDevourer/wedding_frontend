import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetBlogsQuery, useDeleteBlogMutation, useGetAllTagsQuery, useUpdateBlogMutation } from '../../../../redux/blogSlice';
import { 
  FiPlus, FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiCalendar, FiUser 
} from 'react-icons/fi';
import { 
  FaCheckCircle, FaPencilAlt, FaThumbsDown, FaTrash, FaEye, 
  FaExclamationCircle, FaRegClock 
} from 'react-icons/fa';
import { BsImage, BsStarFill, BsThreeDotsVertical } from 'react-icons/bs';
import { RiDraftLine } from 'react-icons/ri';
import { TiArchive } from "react-icons/ti";

export default function Posts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [animate, setAnimate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Get blogs with filters and pagination
  const { data: blogs, isLoading, isError, refetch } = useGetBlogsQuery({
    s: (currentPage - 1) * postsPerPage,
    t: postsPerPage,
    tag: selectedTag || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm || undefined
  }, {
    refetchOnMountOrArgChange: true
  });

  const totalItems = blogs?.totalCount || 0;
  const totalPages = postsPerPage > 0 ? Math.max(1, Math.ceil(totalItems / postsPerPage)) : 1;
  
  // Get tags for filter dropdown
  const { data: tags } = useGetAllTagsQuery();
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [updateBlog, { isLoading: isUpdatingStatus }] = useUpdateBlogMutation();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setStatusFilter('all');
    setCurrentPage(1);
    refetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id).unwrap();
        refetch();
      } catch (error) {
        alert('Failed to delete blog post: ' + (error.data?.message || 'Unknown error'));
      }
    }
  };

  const handleEdit = (id, urlTitle) => {
    navigate(`/update-blog-post/${urlTitle || id}`);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PUBLISHED' || currentStatus === 'published' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateBlog({ 
        id, 
        blogData: { status: newStatus } 
      }).unwrap();
      refetch();
    } catch (error) {
      alert('Failed to update blog status: ' + (error.data?.message || 'Unknown error'));
    }
  };

  const getBlogsList = () => {
    if (blogs?.data && Array.isArray(blogs.data)) return blogs.data;
    return [];
  };

  const getAvailableTags = () => {
    if (tags?.data && Array.isArray(tags.data)) return tags.data;
    return [];
  };

  const blogsList = getBlogsList();
  const availableTags = getAvailableTags();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all your blog content in one place
            </p>
          </div>
          <button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 group"
            onClick={() => navigate('/new-blog-post')}
          >
            <FiPlus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
            <span>New Post</span>
          </button>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm p-5 mb-6 transition-all duration-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search posts..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-300"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.tagName}>{tag.tagName}</option>
              ))}
            </select>
            
            <select 
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            
            <div className="flex items-center gap-2">
              <button 
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-300 flex justify-center items-center gap-2"
              >
                <FiFilter className="h-4 w-4" />
                <span>Apply</span>
              </button>
              
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
              >
                Reset
              </button>
            </div>
            
            <select
              value={postsPerPage}
              onChange={(e) => {
                setPostsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-300"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </form>
        </div>

        {/* Mobile Filters Button */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
          >
            <span className="text-sm font-medium text-gray-700">Filters</span>
            <FiFilter className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Mobile Filters Panel */}
        {mobileFiltersOpen && (
          <div className="sm:hidden bg-white rounded-xl shadow-sm p-4 mb-4 space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.tagName}>{tag.tagName}</option>
              ))}
            </select>
            
            <select 
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleSearch}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 border border-gray-300 rounded-lg text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-600">
              <FaExclamationCircle className="h-10 w-10 mx-auto text-red-500 mb-4" />
              <p>Error loading posts. Please try again.</p>
              <button 
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {blogsList.length > 0 ? (
                      blogsList.map((blog) => (
                        <tr key={blog.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                                {blog.coverImage ? (
                                  <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
                                ) : blog.imageUrl ? (
                                  <img src={blog.imageUrl} alt={blog.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-400">
                                    <BsImage className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {blog.title}
                                  {blog.featured && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                      <BsStarFill className="mr-1 h-3 w-3" />
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {blog.slug || blog.urlTitle}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex items-center text-xs leading-4 font-medium rounded-full ${
                              blog.status === 'published' || blog.status === 'PUBLISHED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {blog.status === 'published' || blog.status === 'PUBLISHED' ? (
                                <FaCheckCircle className="mr-1.5 h-3 w-3" />
                              ) : (
                                <RiDraftLine className="mr-1.5 h-3 w-3" />
                              )}
                              {blog.status === 'published' || blog.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400" />
                              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <FaEye className="mr-1.5 h-4 w-4 text-blue-400" />
                              {blog.viewCount || '0'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {blog.author?.avatar ? (
                                <img className="h-6 w-6 rounded-full mr-2" src={blog.author.avatar} alt={blog.author.name} />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                  <FiUser className="h-3 w-3 text-gray-500" />
                                </div>
                              )}
                              <span className="text-sm text-gray-900">
                                {blog.author?.name || 'Anonymous'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center space-x-2">
                              <button
                                onClick={() => window.open(`/blogs/${blog.urlTitle || blog.slug}`, '_blank')}
                                className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-colors duration-200"
                                title="View"
                              >
                                <FaEye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(blog.id, blog.urlTitle || blog.slug)}
                                className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                                title="Edit"
                              >
                                <FaPencilAlt className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusToggle(blog.id, blog.status)}
                                className={`p-1.5 rounded-md transition-colors duration-200 flex items-center gap-1 text-xs font-semibold
                                  ${blog.status === 'published' || blog.status === 'PUBLISHED'
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'}
                                  `}
                                title={blog.status === 'published' || blog.status === 'PUBLISHED' ? 'Archive (move to Draft)' : 'Publish'}
                                disabled={isUpdatingStatus}
                              >
                                {isUpdatingStatus ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                ) : blog.status === 'published' || blog.status === 'PUBLISHED' ? (
                                  <>
                                    <TiArchive className="h-4 w-4 mr-1" />
                                    Archive
                                  </>
                                ) : (
                                  <>
                                    <FaCheckCircle className="h-4 w-4 mr-1" />
                                    Publish
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(blog.id)}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 transition-colors duration-200"
                                disabled={isDeleting}
                                title="Delete"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <FiSearch className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No posts found</h3>
                            <p className="text-gray-500 max-w-md">
                              {searchTerm || selectedTag || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first blog post to get started'}
                            </p>
                            {!(searchTerm || selectedTag || statusFilter !== 'all') && (
                              <button
                                onClick={() => navigate('/new-blog-post')}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                              >
                                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                                New Post
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {blogsList.length > 0 && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * postsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * postsPerPage, totalItems)}
                        </span>{' '}
                        of <span className="font-medium">{totalItems}</span> posts
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                            currentPage === 1 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <FiChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage >= totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                            currentPage >= totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <FiChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                  
                  {/* Mobile pagination */}
                  <div className="flex-1 flex justify-between items-center sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage >= totalPages}
                      className={`relative inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium ${
                        currentPage >= totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
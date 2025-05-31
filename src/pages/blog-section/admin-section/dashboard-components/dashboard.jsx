import React, { useState, useEffect } from 'react';
import { useGetBlogCountQuery, useGetTotalViewCountQuery, useGetAllTagsQuery, useGetBlogsQuery, useUpdateBlogMutation, useDeleteBlogMutation } from '../../../../redux/blogSlice';
// Import icons for actions
import { FaTrash, FaPencilAlt, FaEye } from 'react-icons/fa';

export default function Dashboard() {
  const { data: blogCount, isLoading: isLoadingBlogCount } = useGetBlogCountQuery();
  const { data: viewCount, isLoading: isLoadingViewCount } = useGetTotalViewCountQuery();
  const { data: tags, isLoading: isLoadingTags } = useGetAllTagsQuery();
  // Fetch recent blogs with pagination
  const { data: blogsData, isLoading: isLoadingBlogs } = useGetBlogsQuery({ t: 7 });
  
  // Initialize mutations for actions
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  
  const [recentStats, setRecentStats] = useState({
    weeklyViews: 0,
    monthlyViews: 0,
    popularityScore: 0
  });
  
  const [blogCounts, setBlogCounts] = useState({
    total: 0,
    published: 0,
    draft: 0
  });
  
  // Animation states
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Calculate estimated weekly and monthly views from total views
    if (viewCount) {
      const totalViews = viewCount.totalViews || 0;
      setRecentStats({
        weeklyViews: Math.round(totalViews / 4), // Rough estimate
        monthlyViews: totalViews,
        popularityScore: Math.min(Math.round((totalViews / 100) * 5), 100) // Simple score calculation
      });
    }
    
    // Set blog counts from the API data
    if (blogCount) {
      setBlogCounts({
        total: blogCount.all || 0,
        published: blogCount.published || 0,
        draft: blogCount.draft || 0
      });
    }
    
    // Trigger animation after component mount
    setTimeout(() => {
      setAnimate(true);
    }, 100);
  }, [viewCount, blogCount]);

  // Calculate most popular tags
  const getPopularTags = () => {
    if (!tags || !Array.isArray(tags.data)) return [];
    
    return [...tags.data]
      .sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0))
      .slice(0, 5);
  };
  
  // Get recent blogs from the API
  const getRecentBlogsList = () => {
    if (!blogsData || !Array.isArray(blogsData.data)) return [];
    return blogsData.data.slice(0, 7); // Limit to 7 most recent blogs
  };

  // Handle delete blog action
  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id).unwrap();
        alert('Blog post deleted successfully');
      } catch (error) {
        alert('Failed to delete blog post: ' + (error.data?.message || 'Unknown error'));
      }
    }
  };

  // Handle edit blog action
  const handleEditBlog = (id) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/admin/blog/edit/${id}`;
  };

  // Handle status toggle
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateBlog({ 
        id, 
        blogData: { status: newStatus } 
      }).unwrap();
      alert(`Blog status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update blog status: ' + (error.data?.message || 'Unknown error'));
    }
  };

  if (isLoadingBlogCount || isLoadingViewCount || isLoadingTags || isLoadingBlogs) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  const popularTags = getPopularTags();
  const recentBlogList = getRecentBlogsList();

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Get time elapsed since last update
  const getTimeElapsed = (dateString) => {
    const now = new Date();
    const pastDate = new Date(dateString);
    const diffInDays = Math.floor((now - pastDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      const diffInHours = Math.floor((now - pastDate) / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor((now - pastDate) / (1000 * 60));
        return `${diffInMinutes} min ago`;
      }
      return `${diffInHours} hours ago`;
    }
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(dateString);
  };

  // Get color based on popularity score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="dashboard-container">
      {/* Dashboard Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transform transition-all duration-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Total Blog Posts Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white text-opacity-80 text-sm uppercase mb-2">Total Blog Posts</h3>
              <p className="text-4xl font-bold">{blogCount?.count || blogCounts.total}</p>
              
              {/* Added section for published and draft counts */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white text-opacity-80 text-xs">Published</span>
                  <span className="text-white font-medium text-sm bg-green-500 bg-opacity-30 px-2 py-0.5 rounded-full">
                    {blogCount?.publishedCount || blogCounts.published}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-opacity-80 text-xs">Draft</span>
                  <span className="text-white font-medium text-sm bg-yellow-500 bg-opacity-30 px-2 py-0.5 rounded-full">
                    {blogCount?.draftCount || blogCounts.draft}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Total Views Card */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: "150ms"}}>          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white text-opacity-80 text-sm uppercase mb-2">Total Views</h3>
              <p className="text-4xl font-bold">{viewCount?.totalViews || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Total Tags Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300" style={{transitionDelay: "300ms"}}>          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white text-opacity-80 text-sm uppercase mb-2">Total Tags</h3>
              <p className="text-4xl font-bold">{tags?.data?.length || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 transform transition-all duration-700 delay-300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Recent Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-violet-500 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Recent Statistics
          </h3>
          
          <div className="space-y-6">
            <div className="relative">
              <h4 className="text-gray-500 text-sm mb-1">Weekly Views</h4>
              <p className="text-3xl font-medium text-gray-800">{recentStats.weeklyViews}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${animate ? Math.min(100, (recentStats.weeklyViews / 1000) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="relative">
              <h4 className="text-gray-500 text-sm mb-1">Monthly Views</h4>
              <p className="text-3xl font-medium text-gray-800">{recentStats.monthlyViews}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${animate ? Math.min(100, (recentStats.monthlyViews / 5000) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="relative">
              <h4 className="text-gray-500 text-sm mb-1">Popularity Score</h4>
              <p className={`text-3xl font-medium ${getScoreColor(recentStats.popularityScore)}`}>
                {recentStats.popularityScore}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className={`${recentStats.popularityScore >= 80 ? 'bg-green-500' : recentStats.popularityScore >= 50 ? 'bg-blue-500' : 'bg-yellow-500'} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${animate ? recentStats.popularityScore : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Popular Tags */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-pink-500 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Popular Tags
          </h3>
          
          {popularTags.length > 0 ? (
            <div className="space-y-3">
              {popularTags.map((tag, index) => (
                <div 
                  key={tag.id} 
                  className={`flex justify-between items-center p-3 rounded-lg border border-gray-100 transform transition-all duration-500 ${animate ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100 + 300}ms`, background: 'linear-gradient(to right, #fafafa, #ffffff)' }}
                >
                  <div className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: `hsl(${(index * 60) % 360}, 80%, 65%)` }}
                    ></span>                    <span className="text-gray-800 font-medium">{tag.tagName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gradient-to-r from-indigo-100 to-blue-100 text-blue-800 text-xs font-medium py-1 px-3 rounded-full">
                      {tag.blogCount || 0} posts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
              </svg>
              <p>No tags available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Blogs Section */}
      <div className={`transform transition-all duration-700 delay-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-teal-500 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-medium mb-6 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
            </svg>
            Recent Blog Activity
          </h3>
            <div className="overflow-hidden">
            {recentBlogList.length > 0 ? (
              <div className="space-y-4">
                {recentBlogList.map((blog, index) => (
                  <div 
                    key={blog.id}
                    className={`flex items-start border-b border-gray-100 pb-4 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
                    style={{ transitionDelay: `${index * 100 + 400}ms` }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-4">
                      {blog.coverImage ? (
                        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                      ) : blog.imageUrl ? (
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{blog.title}</h4>                        <span className={`text-xs px-2 py-1 rounded-full flex items-center cursor-pointer ${blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                          onClick={() => handleStatusToggle(blog.id, blog.status)}
                          title={`Click to mark as ${blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'}`}
                        >
                          {blog.status === 'PUBLISHED' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          )}
                          {blog.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">{blog.excerpt}</p>                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 flex items-center">
                          {blog.author?.name ? (
                            <span className="font-medium flex items-center">
                              {blog.author.avatar && (
                                <img src={blog.author.avatar} alt={blog.author.name} className="w-4 h-4 rounded-full mr-1" />
                              )}
                              {blog.author.name}
                            </span>
                          ) : (
                            <span className="font-medium">{blog.author || 'Anonymous'}</span>
                          )}                          {blog.status === 'PUBLISHED' && blog.viewCount > 0 && (
                            <span className="ml-3 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {blog.viewCount}
                            </span>
                          )}
                          {blog.featured && (
                            <span className="ml-3 flex items-center text-amber-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-400 mr-2">{getTimeElapsed(blog.updatedAt)}</span>
                          
                          {/* Action buttons */}
                          <div className="flex gap-1">
                            <button 
                              onClick={() => window.open(`/blog/${blog.urlTitle}`, '_blank')}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" 
                              title="View"
                            >
                              <FaEye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleEditBlog(blog.id)}
                              className="p-1 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors" 
                              title="Edit"
                            >
                              <FaPencilAlt className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors" 
                              title="Delete"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p>No recent blog activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

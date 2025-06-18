import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetBlogCountQuery, 
  useGetTotalViewCountQuery, 
  useGetAllTagsQuery, 
  useGetBlogsQuery, 
  useUpdateBlogMutation, 
  useDeleteBlogMutation,
  useGetPopularTagsQuery 
} from '../../../../redux/blogSlice';
import { 
  FiPlus, FiEye, FiCalendar, FiUser, FiBarChart2, FiTag, 
  FiEdit2, FiTrash2, FiClock, FiTrendingUp, FiStar, FiImage 
} from 'react-icons/fi';
import { 
  FaCheckCircle, FaRegClock, FaRegEye, FaRegBookmark 
} from 'react-icons/fa';

export default function Dashboard() {  const navigate = useNavigate();  const { data: blogCount, isLoading: isLoadingBlogCount } = useGetBlogCountQuery();
  const { data: viewCount, isLoading: isLoadingViewCount } = useGetTotalViewCountQuery();
  const { data: tags, isLoading: isLoadingTags } = useGetAllTagsQuery({ user: { role: 'ADMIN' } }); // Explicitly pass role as ADMIN
  const { data: popularTags, isLoading: isLoadingPopularTags } = useGetPopularTagsQuery(5);
  const { data: blogsData, isLoading: isLoadingBlogs } = useGetBlogsQuery({ t: 10 });
  
  const [deleteBlog] = useDeleteBlogMutation();
  const [updateBlog] = useUpdateBlogMutation();
  
  const [stats, setStats] = useState({
    weeklyViews: 0,
    monthlyViews: 0,
    engagementRate: 0,
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalTags: 0
  });
  
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (viewCount) {
      setStats(prev => ({
        ...prev,
        weeklyViews: Math.round((viewCount.totalViews || 0) / 4),
        monthlyViews: viewCount.totalViews || 0,
        engagementRate: Math.min(Math.round(((viewCount.totalViews || 0) / 100) * 5), 100)
      }));
    }
    
    if (blogCount) {
      setStats(prev => ({
        ...prev,
        totalPosts: blogCount.all || 0,
        publishedPosts: blogCount.published || 0,
        draftPosts: blogCount.draft || 0
      }));
    }
    
    if (tags) {
      setStats(prev => ({
        ...prev,
        totalTags: tags.data?.length || 0
      }));
    }
    
    setTimeout(() => setAnimate(true), 100);
  }, [viewCount, blogCount, tags]);
  const getPopularTags = () => {
    if (popularTags?.data) return popularTags.data;
    if (!tags?.data) return [];
    return [...tags.data]
      .sort((a, b) => (b.blogCount || 0) - (a.blogCount || 0))
      .slice(0, 5);
  };
  
  const getRecentBlogs = () => {
    return blogsData?.data?.slice(0, 5) || [];
  };

  const getFeaturedBlog = () => {
    if (blogsData?.data) {
      const featuredBlog = blogsData.data.find(blog => blog.featured);
      return featuredBlog || null;
    }
    return null;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteBlog(id).unwrap();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await updateBlog({ id, blogData: { status: newStatus } }).unwrap();
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = now - past;
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours} hr ago`;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return formatDate(dateString);
  };

  if (isLoadingBlogCount || isLoadingViewCount || isLoadingTags || isLoadingBlogs) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog Dashboard</h1>
            <p className="text-gray-500">Overview of your blog content and performance</p>
          </div>
          <button
            onClick={() => navigate('/new-blog-post')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiPlus className="h-5 w-5" />
            <span>New Post</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Total Posts */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <FiEdit2 className="h-5 w-5 text-blue-600" />
                  Total Posts
                </p>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {/* <FiEdit2 className="h-6 w-6 text-blue-500 mr-1" /> */}
                  <div> </div>{stats.totalPosts}
                </h3>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <FiCalendar className="h-3 w-3" />
                    week: {stats.publishedPosts}
                  </span>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <FiCalendar className="h-3 w-3" />
                    month: {stats.publishedPosts}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <FiEye className="h-5 w-5 text-purple-600" />
                  Total Views
                </p>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {stats.monthlyViews.toLocaleString()}
                </h3>
                <div className="flex gap-4 mt-3">
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <FiTrendingUp className="h-3 w-3" />
                    {stats.weeklyViews.toLocaleString()} weekly
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <FiBarChart2 className="h-5 w-5 text-green-600" />
                  Engagement Rate
                </p>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {stats.engagementRate}%
                </h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full ${
                      stats.engagementRate >= 80 ? 'bg-green-500' : 
                      stats.engagementRate >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${stats.engagementRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                  <FiTag className="h-5 w-5 text-indigo-600" />
                  Total Tags
                </p>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {stats.totalTags}
                </h3>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {getPopularTags().slice(0, 2).map(tag => (
                    <span key={tag.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {tag.tagName}
                    </span>
                  ))}
                  {stats.totalTags > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      +{stats.totalTags - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent Posts */}
          <div className={`lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-700 delay-150 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiCalendar className="h-5 w-5 text-blue-600" />
                Recent Posts
              </h2>
              <button 
                onClick={() => navigate('/posts')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {getRecentBlogs().length > 0 ? (
                getRecentBlogs().map((blog, index) => (
                  <div 
                    key={blog.id}
                    className={`p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-all ${animate ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${index * 100 + 300}ms` }}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {blog.coverImage ? (
                          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
                            <FiEdit2 className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{blog.title}</h3>
                          <span 
                            onClick={() => handleStatusToggle(blog.id, blog.status)}
                            className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                              blog.status === 'PUBLISHED' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                          >
                            {blog.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.excerpt || 'No excerpt available'}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiUser className="h-3 w-3" />
                              {blog.author?.name || 'Anonymous'}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock className="h-3 w-3" />
                              {getTimeAgo(blog.updatedAt)}
                            </span>
                            {blog.viewCount > 0 && (
                              <span className="flex items-center gap-1">
                                <FaRegEye className="h-3 w-3" />
                                {blog.viewCount}
                              </span>
                            )}
                            {blog.featured && (
                              <span className="flex items-center gap-1 text-amber-500">
                                <FiStar className="h-3 w-3" />
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(`/blogs/${blog.urlTitle}`, '_blank')}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="View"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/update-blog-post/${blog.urlTitle || blog.id}`)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <FiEdit2 className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p>No recent posts found</p>
                  <button
                    onClick={() => navigate('/new-blog-post')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Create Your First Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Popular Tags & Quick Stats */}
          <div className={`space-y-6 transition-all duration-700 delay-300 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>            {/* Popular Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FiTag className="h-5 w-5 text-indigo-600" />
                  Popular Tags
                </h2>
                {isLoadingPopularTags && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                )}
              </div>
              
              {getPopularTags().length > 0 ? (
                <div className="space-y-4">
                  {getPopularTags().map((tag, index) => {
                    // Calculate percentage based on the most popular tag
                    const maxCount = Math.max(...getPopularTags().map(t => t.blogCount || 0));
                    const percentage = maxCount ? Math.round((tag.blogCount / maxCount) * 100) : 0;
                    const color = `hsl(${(index * 72) % 360}, 80%, 60%)`;
                    
                    return (
                      <div 
                        key={tag.id}
                        className={`transition-all ${animate ? 'opacity-100' : 'opacity-0'}`}
                        style={{ transitionDelay: `${index * 100 + 450}ms` }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            ></span>
                            <span className="font-medium text-gray-800">{tag.tagName}</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {tag.blogCount || 0} {tag.blogCount === 1 ? 'post' : 'posts'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: color
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="pt-2 flex justify-center">
                    <button 
                      onClick={() => navigate('/admin/blog/tags')} 
                      className="text-indigo-600 text-sm hover:text-indigo-800 inline-flex items-center"
                    >
                      View all tags <FiTag className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiTag className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p>No tags available</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <FiBarChart2 className="h-5 w-5 text-green-600" />
                Content Distribution
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Published Posts</span>
                    <span className="font-medium">{stats.publishedPosts}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.publishedPosts / stats.totalPosts) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Draft Posts</span>
                    <span className="font-medium">{stats.draftPosts}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.draftPosts / stats.totalPosts) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tagged Content</span>
                    <span className="font-medium">{Math.round((stats.totalTags / stats.totalPosts) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(stats.totalTags / stats.totalPosts) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
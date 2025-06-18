import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  useGetAllTagsQuery, 
  useAddTagMutation, 
  useUpdateTagMutation, 
  useDeleteTagMutation 
} from '../../../../redux/blogSlice';
import { 
  FiPlus, FiTag, FiEdit2, FiTrash2, FiSearch, FiFilter,
  FiChevronLeft, FiChevronRight, FiX, FiCheck, FiAlertCircle
} from 'react-icons/fi';
// Import sample data for visualization (you can remove this import when connected to real API)
// import { sampleTags } from './sampleBlogData';

export default function Tags() {
  const navigate = useNavigate();
  
  // State hooks
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tagsPerPage, setTagsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'name', 'usage'
  const [animate, setAnimate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newTag, setNewTag] = useState({ name: '' });
  const [editingTag, setEditingTag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get the current user from Redux store
  const user = useSelector(state => state.auth?.user);
  
  // Redux mutation hooks
  const [addTag, { isLoading: isCreating }] = useAddTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();
  
  // Get all tags, passing the user to determine which endpoint to use
  const { data: tagsData, isLoading, refetch } = useGetAllTagsQuery({
    user,
    search: searchTerm || undefined,
    sort: sortBy
  }, {
    refetchOnMountOrArgChange: true
  });
  
  // Get tags from API and implement client-side pagination and filtering
  const getTagsList = () => {
    if (!tagsData?.data || !Array.isArray(tagsData.data)) return [];
    
    // Apply client-side search filter if provided
    let filteredTags = tagsData.data;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredTags = filteredTags.filter(tag => 
        tag.tagName.toLowerCase().includes(lowerSearch)
      );
    }
    
    return filteredTags;
  };
  
  const allTags = getTagsList();
  
  // Calculate total items and pages for pagination
  const totalItems = allTags.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / tagsPerPage));
  
  // Apply client-side pagination
  const startIndex = (currentPage - 1) * tagsPerPage;
  const endIndex = startIndex + tagsPerPage;
  const tagsList = allTags.slice(startIndex, endIndex);
  
  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => {
      setAnimate(true);
    }, 100);
  }, []);
  
  // If current page is greater than total pages, reset to first page
  useEffect(() => {
    if (currentPage > totalPages && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    // Search is already handled by the query parameters
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;
    
    try {
      await addTag({ tagName: newTag.name }).unwrap();
      setNewTag({ name: '' });
      refetch();
      alert('Tag created successfully');
    } catch (error) {
      alert('Failed to create tag: ' + (error.data?.message || 'Unknown error'));
    }
  };
  
  const handleUpdateTag = async (e) => {
    e.preventDefault();
    if (!editingTag?.name.trim()) return;

    try {
      await updateTag({ 
        id: editingTag.id, 
        body: { tagName: editingTag.name } 
      }).unwrap();
      setEditingTag(null);
      setIsModalOpen(false);
      refetch();
      alert('Tag updated successfully');
    } catch (error) {
      alert('Failed to update tag: ' + (error.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteTag = async (id) => {
    // Set the tag ID to confirm deletion (shows the modal)
    setConfirmDelete(id);
  };
  
  const confirmDeleteTag = async () => {
    try {
      await deleteTag({ id: confirmDelete }).unwrap();
      refetch();
      setConfirmDelete(null); // Close the dialog
    } catch (error) {
      alert('Failed to delete tag: ' + (error.data?.message || 'Unknown error'));
    }
  };
  
  const openEditModal = (tag) => {
    // Convert tagName to name for the form fields
    setEditingTag({ 
      ...tag,
      name: tag.tagName // Add a 'name' property for the form to use
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="tags-container">
        {/* Header */}
        <div className={`mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tag Management</h1>
          <p className="text-gray-600">Sheets Link.</p>
          <a 
            href="https://docs.google.com/spreadsheets/d/1FnZb9ohAL06jxDXuI-75W-AZY2xLmueMFkeaQZVGWXg/edit?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Use this link to manage tags.
          </a>
        </div>
        {/* Create Tag Form */}
        <div className={`bg-white rounded-lg shadow-lg p-6 mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          <div className="flex items-center mb-4">
            <div className="bg-pink-100 p-2 rounded-full mr-3">
              <FiPlus className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Create New Tag</h3>
          </div>
          <form onSubmit={handleCreateTag} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name
              </label>
              <input 
                type="text" 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none transition-all duration-300"
                value={newTag.name}
                onChange={(e) => setNewTag({...newTag, name: e.target.value})}
                placeholder="Enter tag name (e.g., Wedding Planning, Venues)"
                required
              />
            </div>
            <div>
              <button 
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2" />
                    Create Tag
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Tag Management Table */}
        <div className={`bg-white rounded-lg shadow-lg p-6 mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                <FiTag className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Manage Tags</h3>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 space-x-0 sm:space-x-2">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex items-center relative">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full sm:w-64 border rounded-lg pl-10 pr-8 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-300"
                />
                <FiSearch className="absolute left-3 text-gray-400" />
                {searchTerm && (
                  <button 
                    type="button" 
                    onClick={handleClearSearch}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </form>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  type="button"
                  className="flex items-center border rounded-lg px-4 py-2 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all duration-300 w-full sm:w-auto justify-between"
                  onClick={() => {
                    const dropdown = document.getElementById('sortDropdown');
                    dropdown.classList.toggle('hidden');
                  }}
                >
                  <span className="flex items-center">
                    <FiFilter className="mr-2 text-gray-500" />
                    Sort by: {sortBy === 'latest' ? 'Latest' : sortBy === 'name' ? 'Name' : 'Usage'}
                  </span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                <div id="sortDropdown" className="hidden absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-10 border">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { 
                        setSortBy('latest'); 
                        setCurrentPage(1); // Reset to first page when sorting changes
                        document.getElementById('sortDropdown').classList.add('hidden'); 
                      }}
                      className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'latest' ? 'bg-indigo-50 text-indigo-800' : ''}`}
                    >
                      Latest
                    </button>
                    <button
                      type="button"
                      onClick={() => { 
                        setSortBy('name'); 
                        setCurrentPage(1); // Reset to first page when sorting changes
                        document.getElementById('sortDropdown').classList.add('hidden'); 
                      }}
                      className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'name' ? 'bg-indigo-50 text-indigo-800' : ''}`}
                    >
                      Name (A-Z)
                    </button>
                    <button
                      type="button"
                      onClick={() => { 
                        setSortBy('usage'); 
                        setCurrentPage(1); // Reset to first page when sorting changes
                        document.getElementById('sortDropdown').classList.add('hidden'); 
                      }}
                      className={`block px-4 py-2 w-full text-left hover:bg-gray-50 ${sortBy === 'usage' ? 'bg-indigo-50 text-indigo-800' : ''}`}
                    >
                      Most Used
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tags Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog Count
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                        <span>Loading tags...</span>
                      </div>
                    </td>
                  </tr>
                ) : tagsList.length > 0 ? (
                  tagsList.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiTag className="h-5 w-5 text-indigo-500 mr-2" />
                          <span className="font-medium text-gray-800">{tag.tagName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {tag._count?.blogs || tag.blogCount || 0} {(tag._count?.blogs || tag.blogCount || 0) === 1 ? 'blog' : 'blogs'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(tag._count?.blogs || tag.blogCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {(tag._count?.blogs || tag.blogCount || 0) > 0 ? 'Active' : 'Unused'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          onClick={() => openEditModal(tag)}
                          className="text-indigo-600 hover:text-indigo-900 transition-all duration-300 inline-flex items-center"
                        >
                          <FiEdit2 className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteTag(tag.id)}
                          className="text-red-600 hover:text-red-900 transition-all duration-300 inline-flex items-center ml-2"
                        >
                          <FiTrash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <p>No tags found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {tagsList?.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    Showing {Math.min((currentPage - 1) * tagsPerPage + 1, totalItems)} to {Math.min(currentPage * tagsPerPage, totalItems)} of {totalItems} tags
                  </span>
                  <div className="ml-4 flex items-center">
                    <label htmlFor="tagsPerPage" className="mr-2">Per page</label>
                    <select 
                      id="tagsPerPage" 
                      className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-300"
                      value={tagsPerPage}
                      onChange={(e) => {
                        setTagsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      {[5, 10, 25, 50].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    aria-label="Previous page"
                  >
                    <FiChevronLeft />
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }
                      
                      if (totalPages > 5) {
                        // Show first page
                        if (idx === 0 && pageNum !== 1) {
                          return (
                            <div key="first-page" className="flex items-center space-x-1">
                              <button
                                onClick={() => setCurrentPage(1)}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                              >
                                1
                              </button>
                              <span className="text-gray-400">...</span>
                            </div>
                          );
                        }
                        
                        // Show last page
                        if (idx === 4 && pageNum !== totalPages) {
                          return (
                            <div key="last-page" className="flex items-center space-x-1">
                              <span className="text-gray-400">...</span>
                              <button
                                onClick={() => setCurrentPage(totalPages)}
                                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700"
                              >
                                {totalPages}
                              </button>
                            </div>
                          );
                        }
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded ${
                            currentPage === pageNum
                              ? 'bg-indigo-500 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    aria-label="Next page"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Tag Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Tag</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tagName">
                  Tag Name
                </label>
                <input 
                  id="tagName"
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-300"
                  value={editingTag?.name || ''}
                  onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                  placeholder="Enter tag name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .tags-container {
          max-width: 100%;
          overflow-x: hidden;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
      
      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-scaleIn">
            <div className="mb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this tag? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="button"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center"
                onClick={confirmDeleteTag}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

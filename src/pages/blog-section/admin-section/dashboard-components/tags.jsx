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

// The combined Tags component that includes both tag management and tag selector
export default function Tags({ 
  selectorMode = false, 
  selectedTags = [], 
  onChange,
  maxTags = 10,
  onClose
}) {
  const navigate = useNavigate();
  
  // State hooks
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tagsPerPage, setTagsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('oldest'); // 'oldest', 'latest', 'name', 'usage'
  const [animate, setAnimate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newTag, setNewTag] = useState({ name: '' });
  const [editingTag, setEditingTag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for selected tags in selector mode
  const [localSelectedTags, setLocalSelectedTags] = useState(selectedTags || []);
  
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
  
  // Debug the structure
  useEffect(() => {
    console.log("Tags data:", tagsData);
    console.log("Selected tags:", localSelectedTags);
  }, [tagsData, localSelectedTags]);
  
  // Get tags from API (filtering is handled on the server side)
  const getTagsList = () => {
    if (!tagsData?.data || !Array.isArray(tagsData.data)) return [];
    return tagsData.data;
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
    // The search term change triggers a new API query via the useGetAllTagsQuery hook
    refetch(); // Force refetch to ensure we get updated results
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    refetch(); // Force refetch with empty search term
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

  // Tag selector functionality
  const handleTagToggle = (tag) => {
    const tagName = tag.tagName;
    
    // Check if we've reached the maximum number of tags
    if (!localSelectedTags.includes(tagName) && localSelectedTags.length >= maxTags) {
      alert(`You can only select up to ${maxTags} tags`);
      return;
    }
    
    let newSelectedTags;
    if (localSelectedTags.includes(tagName)) {
      // Remove tag if already selected
      newSelectedTags = localSelectedTags.filter(t => t !== tagName);
    } else {
      // Add tag if not selected
      newSelectedTags = [...localSelectedTags, tagName];
    }
    
    setLocalSelectedTags(newSelectedTags);
    if (onChange) {
      onChange(newSelectedTags);
    }
  };

  // Save selected tags when in selector mode
  const handleSaveSelection = () => {
    if (onChange) {
      onChange(localSelectedTags);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="tags-container">
        {/* Header */}
        <div className={`mb-8 transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {selectorMode ? "Select Tags" : "Tag Management"}
          </h1>
          {selectorMode ? (
            <p className="text-gray-600">Choose tags to associate with your content.</p>
          ) : (
            <p className="text-gray-600">Sheets Link.</p>
          )}
          <a 
            href="https://docs.google.com/spreadsheets/d/1iniXKP5jm77qEzoQtWlTQZModomjyuhXkDkpEK1M1S4/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
          >
            View Google Sheet
          </a>
        </div>
        
        {/* Actions Row */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white p-5 rounded-xl shadow-sm border border-gray-200 transform transition-all duration-500 ease-out delay-100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          {/* Search Form */}
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button 
                      type="button" 
                      onClick={handleClearSearch}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <button 
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Search
              </button>
            </form>
          </div>
          
          {/* Sorting & Add New Tag */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <label className="text-sm text-gray-600 mr-2 whitespace-nowrap">Sort by:</label>
              <select 
                className="text-sm border border-gray-300 rounded-md p-2 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="nameDesc">Name (Z-A)</option>
                <option value="usage">Most Used</option>
                <option value="usageDesc">Least Used</option>
                <option value="latest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            
            {!selectorMode && (
              <form onSubmit={handleCreateTag} className="flex items-center gap-2 ml-4">
                <input
                  type="text"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                  placeholder="New tag name"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  ) : (
                    <FiPlus className="mr-1" />
                  )}
                  Add
                </button>
              </form>
            )}

            {selectorMode && (
              <button
                type="button"
                onClick={handleSaveSelection}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiCheck className="mr-1" />
                Save Selection
              </button>
            )}
          </div>
        </div>
        
        {/* Tag List - In Selector Mode */}
        {selectorMode && (
          <div className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-8 transform transition-all duration-500 ease-out delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">Select Tags</h2>
              <p className="text-sm text-gray-600">Click on tags to select or deselect them.</p>
            </div>
            
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading tags...</p>
              </div>
            ) : tagsList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tagsList.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => handleTagToggle(tag)}
                    className={`cursor-pointer py-3 px-4 rounded-md transition-all duration-300 flex items-center ${
                      localSelectedTags.includes(tag.tagName)
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        localSelectedTags.includes(tag.tagName) ? 'bg-indigo-500' : 'bg-gray-400'
                      }`}
                    ></span>
                    <span className="flex-1 truncate">{tag.tagName}</span>
                    {tag.blogCount !== undefined && (
                      <span className="text-xs ml-1 text-gray-500">({tag.blogCount})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No tags found. Try a different search or create new tags.</p>
              </div>
            )}

            {/* Selected Tags Display */}
            {localSelectedTags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Selected tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {localSelectedTags.map((tagName) => (
                    <div
                      key={tagName}
                      className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1.5 rounded-full flex items-center"
                    >
                      {tagName}
                      <button
                        type="button"
                        className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                        onClick={() => handleTagToggle({ tagName })}
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  {localSelectedTags.length === maxTags ? (
                    <p className="text-amber-600">Maximum number of tags reached ({maxTags}).</p>
                  ) : (
                    <p>You can select up to {maxTags} tags. Currently {localSelectedTags.length} selected.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Tags Table - In Management Mode */}
        {!selectorMode && (
          <div className={`bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-8 transform transition-all duration-500 ease-out delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
            <h2 className="text-lg font-medium text-gray-900 mb-4">All Tags</h2>
            
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading tags...</p>
              </div>
            ) : tagsList.length > 0 ? (
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
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tagsList.map((tag) => (
                      <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiTag className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">{tag.tagName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tag.blogCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => openEditModal(tag)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={tag.blogCount > 0}
                            title={tag.blogCount > 0 ? "Cannot delete tags in use" : "Delete tag"}
                          >
                            <FiTrash2 className={`h-5 w-5 ${tag.blogCount > 0 ? 'opacity-30 cursor-not-allowed' : ''}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No tags found. Try a different search or create new tags.</p>
              </div>
            )}
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{tagsList.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium">{totalItems}</span> tags
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 border rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {/* First Page */}
                {currentPage > 2 && (
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                )}
                
                {/* Ellipsis */}
                {currentPage > 3 && (
                  <span className="px-2 py-1">...</span>
                )}
                
                {/* Previous Page */}
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {currentPage - 1}
                  </button>
                )}
                
                {/* Current Page */}
                <button
                  className="px-3 py-1 border rounded-md bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                >
                  {currentPage}
                </button>
                
                {/* Next Page */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {currentPage + 1}
                  </button>
                )}
                
                {/* Ellipsis */}
                {currentPage < totalPages - 2 && (
                  <span className="px-2 py-1">...</span>
                )}
                
                {/* Last Page */}
                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                )}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 border rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Items per page:</label>
                <select
                  className="text-sm border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={tagsPerPage}
                  onChange={(e) => setTagsPerPage(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
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
    </div>
  );
}

// Export a standalone TagSelector component for backward compatibility
export function TagSelector({ selectedTags = [], onTagsChange, onChange, maxTags = 10, showSuggestions = false }) {
  const handleChange = onTagsChange || onChange;
  
  return (
    <Tags 
      selectorMode={true} 
      selectedTags={selectedTags} 
      onChange={handleChange} 
      maxTags={maxTags} 
    />
  );
}

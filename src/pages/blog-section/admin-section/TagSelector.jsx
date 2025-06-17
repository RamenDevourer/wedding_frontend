import { useState, useEffect } from 'react';
import { useGetAllTagsQuery, useAddTagMutation } from '../../../redux/blogSlice';

/**
 * TagSelector component for selecting multiple tags
 * @param {Object} props - Component props
 * @param {Array} props.selectedTags - Array of currently selected tag names
 * @param {Function} props.onTagsChange - Callback function when tags are changed
 * @param {Function} props.onChange - Alternative callback function when tags are changed (for backward compatibility)
 * @param {number} props.maxTags - Maximum number of tags that can be selected
 * @param {boolean} props.showSuggestions - Whether to show tag suggestions
 * @param {boolean} props.allowNewTags - Whether to allow creating new tags
 */
export default function TagSelector({ 
  selectedTags = [], 
  onTagsChange, 
  onChange, 
  maxTags = 10,
  showSuggestions = false,
  allowNewTags = true
}) {
  // Use either onTagsChange or onChange callback
  const handleTagsChange = onTagsChange || onChange;
  const { data: tagsData, isLoading, refetch } = useGetAllTagsQuery();
  const [addTag] = useAddTagMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  
  // Filter tags based on search term
  const filteredTags = tagsData?.data?.filter(tag => 
    tag.tagName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Check if searched tag exists
  const tagExists = searchTerm && filteredTags.some(tag => 
    tag.tagName.toLowerCase() === searchTerm.toLowerCase()
  );  // Handle tag selection
  const handleTagToggle = (tag) => {
    const tagName = tag.tagName;
    
    // Check if we've reached the maximum number of tags
    if (!selectedTags.includes(tagName) && selectedTags.length >= maxTags) {
      alert(`You can only select up to ${maxTags} tags`);
      return;
    }
    
    if (selectedTags.includes(tagName)) {
      // Remove tag if already selected
      handleTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      // Add tag if not selected
      handleTagsChange([...selectedTags, tagName]);
    }
  };
  
  // Handle creating a new tag
  const handleCreateNewTag = async () => {
    if (!searchTerm.trim()) return;
    
    // Check if the tag already exists (case insensitive)
    if (tagsData?.data?.some(tag => 
      tag.tagName.toLowerCase() === searchTerm.toLowerCase()
    )) {
      // Tag exists, just add it to selected
      const existingTag = tagsData.data.find(tag => 
        tag.tagName.toLowerCase() === searchTerm.toLowerCase()
      );
      if (!selectedTags.includes(existingTag.tagName) && selectedTags.length < maxTags) {
        handleTagsChange([...selectedTags, existingTag.tagName]);
      }
      return;
    }
    
    try {
      setIsCreatingTag(true);
      // Create new tag in the database
      await addTag({ tagName: searchTerm.trim() }).unwrap();
      
      // Refresh tags list
      await refetch();
      
      // Add the new tag to selected tags
      if (selectedTags.length < maxTags) {
        handleTagsChange([...selectedTags, searchTerm.trim()]);
      }
      
      // Clear search term
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert('Failed to create new tag. Please try again.');
    } finally {
      setIsCreatingTag(false);
    }
  };

  return (
    <div className="tag-selector-container">      {/* Search input */}
      <div className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search tags..."
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {allowNewTags && searchTerm.trim() && !tagExists && (
            <button
              type="button"
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
              onClick={handleCreateNewTag}
              disabled={isCreatingTag}
            >
              {isCreatingTag ? 'Creating...' : 'Create Tag'}
            </button>
          )}
        </div>
      </div>
      
      {/* Tags list */}
      <div className="tags-list">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">
            <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-indigo-500 rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading tags...</p>
          </div>
        ) : filteredTags.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                onClick={() => handleTagToggle(tag)}
                className={`cursor-pointer py-2 px-3 rounded-md text-sm transition-all duration-300 ${
                  selectedTags.includes(tag.tagName)
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${
                      selectedTags.includes(tag.tagName) ? 'bg-indigo-500' : 'bg-gray-400'
                    }`}
                  ></span>
                  <span className="flex-1 truncate">{tag.tagName}</span>
                  {tag.blogCount !== undefined && (
                    <span className="text-xs ml-1 text-gray-500">({tag.blogCount})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {searchTerm ? (
              <p className="text-sm">No tags match your search</p>
            ) : (
              <p className="text-sm">No tags available</p>
            )}
          </div>
        )}
      </div>
      
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Selected tags:</div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagName) => (
              <div
                key={tagName}
                className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center"
              >
                {tagName}                <button
                  type="button"
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                  onClick={() => handleTagsChange(selectedTags.filter((t) => t !== tagName))}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
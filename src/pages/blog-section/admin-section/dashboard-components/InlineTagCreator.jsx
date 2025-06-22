import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiX, FiLoader } from 'react-icons/fi';
import { useGetAllTagsQuery, useAddTagMutation } from '../../../../redux/blogSlice';
import { useSelector } from 'react-redux';

const InlineTagCreator = ({ selectedTags = [], onChange, maxTags = 10 }) => {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Get user from Redux store
  const user = useSelector(state => state.auth?.user);
  
  // RTK Query hooks
  const { data: tagsData, isLoading: isTagsLoading } = useGetAllTagsQuery({ 
    user,
    sort: 'name' 
  }, { refetchOnMountOrArgChange: true });
  
  // Get add tag mutation
  const [addTag, { isLoading: isAddTagLoading }] = useAddTagMutation();

  // Filter tags based on input
  useEffect(() => {
    if (!tagsData?.data || !Array.isArray(tagsData.data)) return;
    
    if (inputValue.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = tagsData.data.filter(tag => 
      tag.tagName.toLowerCase().includes(inputValue.toLowerCase())
    );
    setSearchResults(filtered);
  }, [inputValue, tagsData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(e.target) && 
        e.target !== inputRef.current
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleSelectTag = (tagName) => {
    // Check if we've already reached the maximum
    if (!selectedTags.includes(tagName) && selectedTags.length >= maxTags) {
      alert(`You can only select up to ${maxTags} tags`);
      return;
    }

    // Add tag if it's not already selected
    if (!selectedTags.includes(tagName)) {
      const updatedTags = [...selectedTags, tagName];
      onChange(updatedTags);
    }
    
    setInputValue('');
    setShowResults(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    onChange(updatedTags);
  };

  const handleCreateNewTag = async () => {
    if (!inputValue.trim()) return;
    
    // Check if tag already exists
    const tagExists = tagsData?.data?.some(tag => 
      tag.tagName.toLowerCase() === inputValue.toLowerCase()
    );
    
    if (tagExists) {
      handleSelectTag(inputValue);
      return;
    }

    setIsCreatingTag(true);
    
    try {
      const result = await addTag({ tagName: inputValue.trim() }).unwrap();
      if (result.success) {
        // Add the new tag to selected tags
        handleSelectTag(inputValue.trim());
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
      alert(`Failed to create tag: ${error.data?.message || 'Unknown error'}`);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (searchResults.length === 1) {
        // If there's exactly one result, select it
        handleSelectTag(searchResults[0].tagName);
      } else if (searchResults.length === 0 && inputValue.trim()) {
        // If no results, create a new tag
        handleCreateNewTag();
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  // Check if a tag with the current input value already exists
  const exactTagExists = searchResults.some(tag => 
    tag.tagName.toLowerCase() === inputValue.toLowerCase()
  );

  return (
    <div className="w-full">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag, index) => (
            <span 
              key={index}
              className="bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full text-sm flex items-center border border-pink-200"
            >
              {tag}
              <button 
                type="button" 
                onClick={() => handleRemoveTag(tag)}
                className="ml-1.5 text-pink-600 hover:text-pink-800 focus:outline-none"
              >
                <FiX className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag selection input */}
      <div className="relative">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            placeholder={selectedTags.length >= maxTags ? "Maximum tags reached" : "Add a tag..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={selectedTags.length >= maxTags || isCreatingTag}
          />
          <button
            type="button"
            className="flex items-center px-3 py-2 bg-pink-500 text-white rounded-r-md hover:bg-pink-600 focus:outline-none disabled:opacity-50 disabled:bg-gray-400"
            onClick={handleCreateNewTag}
            disabled={!inputValue.trim() || selectedTags.length >= maxTags || isCreatingTag}
          >
            {isCreatingTag ? (
              <FiLoader className="h-5 w-5 animate-spin" />
            ) : (
              <FiPlus className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Search results dropdown */}
        {showResults && inputValue.trim() && (
          <div 
            ref={resultsRef}
            className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200"
          >
            {isTagsLoading ? (
              <div className="flex items-center justify-center py-4">
                <FiLoader className="animate-spin h-5 w-5 text-pink-500" />
                <span className="ml-2 text-gray-600">Loading tags...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="py-1">
                {searchResults.map((tag) => (
                  <li 
                    key={tag.id} 
                    className={`cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                      selectedTags.includes(tag.tagName) ? 'bg-pink-50 text-pink-700' : 'text-gray-800'
                    }`}
                    onClick={() => handleSelectTag(tag.tagName)}
                  >
                    <div className="flex items-center">
                      <span>{tag.tagName}</span>
                      {selectedTags.includes(tag.tagName) && (
                        <span className="ml-2 text-xs font-medium text-pink-600">(selected)</span>
                      )}
                    </div>
                    {tag.blogCount > 0 && (
                      <span className="text-xs text-gray-500">Used in {tag.blogCount} posts</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-700">
                {inputValue.trim() ? (
                  <div>
                    <p>No existing tags found.</p>
                    <button
                      type="button"
                      className="mt-1 text-pink-600 hover:text-pink-700 font-medium flex items-center"
                      onClick={handleCreateNewTag}
                    >
                      <FiPlus className="mr-1" />
                      Create "{inputValue}" as new tag
                    </button>
                  </div>
                ) : (
                  <p>Start typing to search or create tags</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tag info */}
      <p className="mt-1.5 text-xs text-gray-500">
        {selectedTags.length >= maxTags ? (
          <span className="text-amber-600">Maximum tags reached ({maxTags}).</span>
        ) : (
          <>You can add up to {maxTags} tags. {selectedTags.length}/{maxTags} used.</>
        )}
      </p>
    </div>
  );
};

export default InlineTagCreator;

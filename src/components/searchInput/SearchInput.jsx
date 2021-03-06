import React from 'react';
import './SearchInput.scss';
import Suggestion from '../suggestion/Suggestion';
import PropTypes from 'prop-types';

const SearchInput = ({
	searchPlaceholder, 
	searchValue, 
	onChangeSearchValue, 
	suggestionCity, 
	closeSuggestion, 
	addToFavorite
}) => {
    let suggestionElement = null;
    if (suggestionCity !== undefined) {
        suggestionElement = (
            <Suggestion cityId={suggestionCity.cityId} 
                cityName={suggestionCity.cityName} 
                country={suggestionCity.country}
                closeSuggestion={closeSuggestion}
                addToFavorite={addToFavorite} 
            />
        )
    }
    
    return (
        <div className='search-form__search-input search-input'>
            <input className='search-input__input' 
                type="text" 
                value={searchValue}
                placeholder={searchPlaceholder}
                onChange={onChangeSearchValue} 
            />
            <div className='search-input__suggestions'>
                {suggestionElement}
            </div>
        </div>
    )
}

SearchInput.propTypes = {
	searchPlaceholder: PropTypes.string,
	searchValue: PropTypes.string,
	onChangeSearchValue: PropTypes.func,
	suggestionCity: PropTypes.object,
	closeSuggestion: PropTypes.func,
	addToFavorite: PropTypes.func,
}

export default SearchInput;
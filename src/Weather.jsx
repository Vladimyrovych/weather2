import React, { Component } from 'react';
import './Weather.scss';
import Header from './components/header/Header';
import Main from './pages/main/Main';
import Menu from './components/menu/Menu';
import RequestWeather from './components/requests/requestWeather';

export default class Weather extends Component {
	state = {
		isMenuShow: false,
		currentCityWeather: undefined,
		isCurrentLocationWeatherShow: true,
		favoritesCities: undefined,
		favoritesCitiesWeather: undefined,
		searchValue: '',
		searchPlaceholder: 'Example: London',
		searchCityWeather: undefined,
		titleHeader: undefined,
	}

	weatherRequest = new RequestWeather();

	toggleMenu = () => {
		this.setState((state) => {
			return {
				isMenuShow: !state.isMenuShow,
			}
		})
	}

	getCurrentLocation = () => {
		const setLocationWeatherToState = (response) => {
			this.setState({currentCityWeather: response});
		}

		navigator.geolocation.getCurrentPosition((position) => {
			this.weatherRequest.getWeatherCityByCoords(position.coords.latitude, position.coords.longitude, setLocationWeatherToState);
		}, () => {
			this.setState({isCurrentLocationWeatherShow: false})
		})
	}

	parseCurrentCityWeather = () => {
		if (this.state.isCurrentLocationWeatherShow === false || this.state.currentCityWeather === undefined) {
			return undefined;
		} else {
			return {
				cityName: this.state.currentCityWeather.name,
				cityId: this.state.currentCityWeather.id,
				temperature: Math.round(this.state.currentCityWeather.main.temp),
				weatherMain: this.state.currentCityWeather.weather[0].main,
				weatherId: this.state.currentCityWeather.weather[0].id,
			}	
		}
	}

	getWeatherForLocalStoregeCities = () => {
		const favoritesCities = Object.assign({}, JSON.parse(localStorage.getItem('favoriteCities')));

		this.setState(() => {
			return {
				favoritesCities: favoritesCities,
			}
		},
		() => {
			if (this.state.favoritesCitiesWeather === undefined) {
				this.getFavoritesCityWeather();
			}
		}
		)
	}	

	removeFavoriteCity = (cityId) => {
		let favoriteCitiesStorage = JSON.parse(localStorage.getItem('favoriteCities'));
		delete favoriteCitiesStorage[cityId];
		if (Object.keys(favoriteCitiesStorage).length === 0) {
			localStorage.removeItem('favoriteCities');
			this.setState({
				favoritesCities: undefined,
				favoritesCitiesWeather: undefined,
			});
		} else {
			const favoriteCities = Object.assign({}, favoriteCitiesStorage)
			localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));

			this.setState(({favoritesCitiesWeather}) => {
				const index = favoritesCitiesWeather.findIndex((element) => element.id == cityId);
				const before = favoritesCitiesWeather.slice(0, index);
				const after = favoritesCitiesWeather.slice(index + 1);
				const newFavoritesCitiesWeather = [...before, ...after];
				return {
					favoritesCities: favoriteCities,
					favoritesCitiesWeather: newFavoritesCitiesWeather,
				}
			})
		}
	}

	getFavoritesCityWeather = () => {
		const setWeatherToState = (response) => {
			this.setState({
				favoritesCitiesWeather: response.list,
			})
		}

		let cityIds = Object.keys(this.state.favoritesCities);
		this.weatherRequest.getCitiesWeather(cityIds, setWeatherToState);
	}

	parseFavoritesCitiesWeather = () => {
		let favoritesCitiesWeather;
		if (this.state.favoritesCitiesWeather !== undefined) {
			favoritesCitiesWeather = this.state.favoritesCitiesWeather.map((cityWeather) => {
				return {
					cityName: cityWeather.name,
					cityId: cityWeather.id,
					temperature: Math.round(cityWeather.main.temp),
					weatherMain: cityWeather.weather[0].main,
					weatherId: cityWeather.weather[0].id,	
				}
			})
		}
		return favoritesCitiesWeather;
	}

	onChangeSearchValue = (event) => {
		this.setState({
			searchValue: event.target.value,
		})
	}

	getSearchCityWeather = () => {
		const setCityWeatherToState = (response) => {
			this.setState({
				searchCityWeather: response,
			})
		}
		const cityNotFound = () => {
			this.setState({
				searchValue: 'City not found',
			})
		}

		this.weatherRequest.getSearchCityWeather(this.state.searchValue, setCityWeatherToState, cityNotFound);
	}

	parseSearchCityWeather = () => {
		if (this.state.searchCityWeather === undefined) {
			return undefined
		} else {
			return {
				cityId: this.state.searchCityWeather.id,
				cityName: this.state.searchCityWeather.name,
				country: this.state.searchCityWeather.sys.country,
			}	
		}
	}

	closeSuggestion = () => {
		this.setState({
			searchCityWeather: undefined,
			searchValue: '',
		})
	}

	addToFavorite = (cityId, cityName) => {	
		if (this.state.favoritesCities !== undefined && this.state.favoritesCities[cityId] !== undefined) {
			this.closeSuggestion();
		} else {
			let favoriteCitiesStorage = JSON.parse(localStorage.getItem('favoriteCities'));
			if (favoriteCitiesStorage === null) {
				favoriteCitiesStorage = {}
			}
			favoriteCitiesStorage[cityId] = cityName;
			const favoriteCities = Object.assign({}, favoriteCitiesStorage)
			localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
	
			this.setState(({searchCityWeather, favoritesCitiesWeather}) => {
				let newFavoritesCitiesWeather = [];
				if (favoritesCitiesWeather === undefined) {
					newFavoritesCitiesWeather.push(searchCityWeather);
				} else {
					newFavoritesCitiesWeather = [searchCityWeather, ...favoritesCitiesWeather];
				}
				
				return {
					favoritesCities: favoriteCities,
					favoritesCitiesWeather: newFavoritesCitiesWeather,
				}
			}, () => {
				this.closeSuggestion();
			})	
		}
	}

	changeHeaderTtitle = (titleHeader) => {
		this.setState(() => {
			return {
				titleHeader: titleHeader,
			}
		})
	}

	componentDidMount() {
		if (this.state.isCurrentLocationWeatherShow === true) {
			if (this.state.currentCityWeather === undefined) {
				this.getCurrentLocation();
			}	
		}

		if (localStorage.getItem('favoriteCities') !== null && this.state.favoritesCities === undefined) {
			this.getWeatherForLocalStoregeCities();
		}
	}

    render() {		
        return (
            <div className="weather">
                <Header url={'https://images.unsplash.com/photo-1553969196-73b12db1c2ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80'} title={this.state.titleHeader} />
				<Main currentCityWeather={this.parseCurrentCityWeather()} 
					favoritesCitiesWeather={this.parseFavoritesCitiesWeather()}
					changeHeaderTtitle={this.changeHeaderTtitle}
				/>
				<Menu isMenuShow={this.state.isMenuShow} 
					toggleMenu={this.toggleMenu} 
					favoritesCities={this.state.favoritesCities}
					removeFavoriteCity={this.removeFavoriteCity}
					searchPlaceholder={this.state.searchPlaceholder}
					searchValue={this.state.searchValue}
					onChangeSearchValue={this.onChangeSearchValue}
					getSearchCityWeather={this.getSearchCityWeather}
					suggestionCity={this.parseSearchCityWeather()}
					closeSuggestion={this.closeSuggestion}
					addToFavorite={this.addToFavorite}
				/>
            </div>
        );
    }
}

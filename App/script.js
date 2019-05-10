class SearchField {
	constructor(wrapper, maxSelectNum) {
		this.wrapper = wrapper;
		this.maxSelectNum = maxSelectNum;
        
        this.state = {
            searchResult: false,
      	}

		this.init();
	}

	set searchResult (value) {
		this.state.searchResult = value;
		this.renderDropdownBox();
	}
    
    init () {
    	this.build();
    	this.addTypeHandler();
    }

    build () {
    	this.box = document.createElement('div');
    	this.box.classList.add('search-field');
    	this.wrapper.innerHTML = '';
    	this.wrapper.appendChild(this.box);

    	this.searchInputWrapper = document.createElement('div');
    	this.searchInputWrapper.classList.add('search-field__input-wrapper');
    	this.searchInputWrapper.classList.add('search-field__base--tabbed');
    	this.box.appendChild(this.searchInputWrapper);

    	this.searchInput = document.createElement('input');
    	this.searchInput.classList.add('search-field__input');
    	this.searchInput.placeholder = 'Начните вводить ...'
    	this.searchInputWrapper.appendChild(this.searchInput);
    	this.searchInputWrapper.tabIndex = 0;

    	this.selectedBox = document.createElement('ul');
    	this.selectedBox.classList.add('search-field__selected-box');
    	this.box.appendChild(this.selectedBox);

    	this.dropdownBox = document.createElement('ul');
    	this.dropdownBox.classList.add('search-field__dropdown-box');
    	this.dropdownBox.classList.add('hidden');
    	this.searchInputWrapper.appendChild(this.dropdownBox);
    }

    addTypeHandler () {
    	this.searchInput.onfocus = () => {
    		if(!this.data)
                this.data = this.getData();
    	}
		this.searchInput.onkeyup = (e) => {
			this.searchResult = this.getFilterData(e.target.value);
		}
	}

	addArrowHandler () {
		   
			this.searchInputWrapper.onkeydown = (e) => {

			if(e.key == 'ArrowDown')
			{
				const activeElem = this.searchInputWrapper.
				    querySelector(':focus');
				let nextElem = null;
				if(activeElem.tagName == 'INPUT')
					 nextElem = this.dropdownBox
				        .children[0];
				else
					 nextElem = activeElem.nextElementSibling;
				
				if(!nextElem)
					return;
			
				nextElem.focus();

				return;
				
			}

			if(e.key == 'ArrowUp')
			{
				const activeElem = this.searchInputWrapper.
				    querySelector(':focus');

				if(activeElem.tagName == 'INPUT')
					return;

				let prevElem = activeElem.previousElementSibling;
				if(!prevElem)
					prevElem = this.searchInput;
				
				prevElem.focus();

				return;
			}

			this.searchInput.focus();
		}
	}

	getData () {
		const xhr = new XMLHttpRequest();
		const url = 'https://api.hh.ru/metro/1';
		xhr.open('GET', url);
		xhr.send();
		xhr.onload = () => {
			this.data = [];
			JSON.parse(xhr.response).lines.forEach((line) => {
				const color = line.hex_color;
				line.stations.forEach((station) => {
					this.data.push({
						name: station.name,
						color: color
					})
				})
			})
		}
	}

	renderDropdownBox () {
		if(!this.state.searchResult)
		{
			this.dropdownBox.classList.add('hidden');
			return;
		}

		if(this.dropdownBox.classList.contains('hidden'))
		    this.dropdownBox.classList.remove('hidden');
		this.dropdownBox.innerHTML = '';
        this.state.searchResult.forEach((item) => {
            this.appendDropdownItem(item);
        })

        this.addArrowHandler();

	}

	appendDropdownItem (item) {
		const itemLi = document.createElement('li');
		itemLi.classList.add('search-field__dropdown-item');
		this.dropdownBox.appendChild(itemLi);
		itemLi.innerHTML = item.name;
		itemLi.tabIndex = 0;
		itemLi.classList.add('search-field__base--tabbed');


		
	}


/////////////////////////filter methods//////////////////////////////////

	getFilterData(str) {
		str = this.getCleanStr(str);

		if(str.length == 0)
			return false;

        const result = this.data.filter(item => 
        	 this.getRegisterVariants(str)
        	 .some(variant => item.name
        	 	    .indexOf(variant, 0) == 0));

        if(result.length == 0)
        	return false;

        return result;
	}

	getRegisterVariants (str) {
        return [str, this.getUCWords(str),
            this.getUCFirst(str)];
	}

	getCleanStr (str) {
		str = str.replace(/\s+/g, ' ');
		str = str.replace(/\s-\s/g, '-');
		str = str.trim(/\s+/);
		return str;
	}

	getUCWords (str) {
		str = str.replace(/(^.|-.|\s.)/g, (match) =>
			{
				return match.toUpperCase();
			});
		return str;
	}

	getUCFirst (str) {
		str = str[0].toUpperCase() + 
		    str.slice(1).toLowerCase();
		return str;
	}

////////////////////////////////////////////////////////////////////////////

}

new SearchField(document.querySelector('.search-field-wrapper'));
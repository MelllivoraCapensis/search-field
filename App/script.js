class SearchField {
	constructor(wrapper, maxSelectNum) {
		this.wrapper = wrapper;
		this.maxSelectNum = maxSelectNum;
        
        this.state = {
            searchResult: false,
            selectedItems: []
      	}

		this.init();
	}

	set searchResult (value) {
		this.state.searchResult = value;
		this.renderDropdownBox();
	}
    
    init () {
    	this.build();
    	this.addInputHandler();
    	this.addClearHandler();
    }

/////////////////////build static part//////////////////////////////////

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
    	this.selectedBox.classList.add('hidden');
    	this.box.appendChild(this.selectedBox);

    	this.dropdownBox = document.createElement('div');
    	this.dropdownBox.classList.add('search-field__dropdown-box');
    	this.dropdownBox.classList.add('hidden');
    	this.searchInputWrapper.appendChild(this.dropdownBox);
    }

//////////////////////////////////////////////////////////////////////////

   

///////////////////////////handlers method/////////////////////////////////

    addInputHandler () {

    	this.searchInput.onfocus = () => {
    		if(!this.data)
                this.data = this.getData();
        }
   
        this.searchInput.onwheel = (e) => {

			if(e.deltaY > 0 && this.searchInput.value == '')
				{
					if(!this.state.searchResult)
					    this.searchResult = this.data;
					this.moveFocusDown();
					return;
				}

			if(e.deltaY < 0 && this.searchInput.value == '')
			{
				if(!this.state.searchResult)
				    this.searchResult = this.data;
				this.moveFocusUp();
				return;
			}
		}

		this.searchInput.onkeyup = (e) => {
			if(e.key == 'ArrowDown' && this.searchInput.value == '')
				{
					this.searchResult = this.data;
					return;
				}

				this.searchResult = this.getFilterData(e.target.value);
		}

    }

	addClearHandler () {
		window.onkeyup = (e) => {
			if(e.key == 'Escape')
			this.clear();
		}

		this.box.onmouseleave = () => {
			this.clear();
		}
	}

	moveFocusDown () {

		let activeElem = this.searchInputWrapper.
				    querySelector(':focus');

	    if(!activeElem)
	    	activeElem = this.searchInput;
		let nextElem = null;
		if(activeElem.tagName == 'INPUT')
			 nextElem = this.dropdownBox
		        .children[0];
		else
			 nextElem = activeElem.nextElementSibling;
		
		if(!nextElem)
			return;

		nextElem.focus();

	}

	moveFocusUp () {
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


   	addBoxNavHandler () {

		this.searchInputWrapper.onkeydown = (e) => {

			if(e.key == 'ArrowDown')
			{

				this.moveFocusDown();
				return;
			}

			if(e.key == 'ArrowUp')
			{
				this.moveFocusUp();
				return;
			}

			this.searchInput.focus();
		}

		this.dropdownBox.onwheel = (e) => {

            if(e.deltaY > 0)
            	{
          	  		this.moveFocusDown();
            	}

            if(e.deltaY < 0)
            	{
            		this.moveFocusUp();
            	}
		}
	}
    
///////////////////////////////////////////////////////////////////////////



/////////////////////logic methods////////////////////////////////////////

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

			this.data = this.data.sort((item1, item2) => {
                    return item1.name[0].charCodeAt() -
                        item2.name[0].charCodeAt();
				})
		}
	}

	addSelectedItem (newItem) {
		if(this.state.selectedItems.some((item) => 
			item.name == newItem.name && item.color == newItem.color))
			return false;
		this.state.selectedItems.push(newItem);
		this.renderSelectedBox();
	}

	 clear () {
    		this.searchInput.value = '';
			this.searchResult = false;
		    this.renderDropdownBox();
    }

/////////////////////////////////////////////////////////////////////////////



//////////////////////////render methods/////////////////////////////////////

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

        this.addBoxNavHandler();

	}

	appendDropdownItem (item) {
		const itemLi = document.createElement('li');
		itemLi.classList.add('search-field__dropdown-item');
		this.dropdownBox.appendChild(itemLi);
		itemLi.innerHTML = item.name;
		itemLi.style.color = '#' + item.color;
		itemLi.tabIndex = 0;

		itemLi.onclick = () => {
            this.addSelectedItem(item);
            this.clear();
		}
		itemLi.onkeydown = (e) => {
			if(e.key == 'Enter')
			{
				this.addSelectedItem(item);
                this.clear();
			}
            
		}
	}

	renderSelectedBox () {
		if(this.state.selectedItems.length == 0)
		{
			this.selectedBox.classList.add('hidden');
			return;
		}

		this.selectedBox.classList.remove('hidden');

		this.selectedBox.innerHTML = '';
		this.state.selectedItems.forEach((item, ind) => {

			const itemLi = document.createElement('li');
			this.selectedBox.appendChild(itemLi);
			itemLi.innerHTML = item.name;
			itemLi.classList.add('search-field__selected-item');
			itemLi.style.color = '#' + item.color;

			const closer = document.createElement('span');
			closer.classList.add('search-field__selected-closer');
			itemLi.appendChild(closer);
			closer.innerHTML ='&#x02717;';
			closer.onclick = (e) => {
                this.state.selectedItems.splice(ind, 1);
                this.renderSelectedBox();
			}
		})

	}

/////////////////////////////////////////////////////////////////////////


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
		str = str.replace(/-\s*/g, '-');
		str = str.replace(/\s*-/g, '-');
		str = str.trim(/\s+/);
		return str;
	}

	getUCWords (str) {
		str = str.toLowerCase();
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
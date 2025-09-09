/* eslint-disable */
function xSearchDropDown(dropdownInputID, dropdownListId, addNewItemId, listItems) {
    const input = document.getElementById(dropdownInputID);
    const dropdownList = document.getElementById(dropdownListId);
    const addNewItem = document.getElementById(addNewItemId);

    // Sample data - you can replace this with your own data
    // let items = ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pineapple', 'Strawberry', 'Watermelon'];

    // Track currently highlighted item index
    let highlightedIndex = -1;

    // Initialize dropdown
    renderDropdownItems(listItems);

    // Input event handlers
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('focus', showDropdown);
    input.addEventListener('blur', () => {
        // Use setTimeout to allow click events on dropdown items to fire first
        setTimeout(hideDropdown, 200);
    });

     // Render items in dropdown
    function renderDropdownItems(itemsToRender) {
        // Clear existing items (except the "add new" option)
        const existingItems = dropdownList.querySelectorAll('.dropdown-item:not(#add-new-item)');
        existingItems.forEach((item) => item.remove());

        // Add new items
        itemsToRender.forEach((item) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'dropdown-item';
            itemElement.textContent = item;

            itemElement.addEventListener('click', () => {
                input.value = item;
                hideDropdown();
            });

            itemElement.addEventListener('mouseover', () => {
                // Update highlighted index when mouse hovers over an item
                const items = dropdownList.querySelectorAll('.dropdown-item:not(#add-new-item)');
                highlightedIndex = Array.from(items).indexOf(itemElement);
                updateHighlight();
            });

            dropdownList.insertBefore(itemElement, addNewItem);
        });

        // Reset highlight
        highlightedIndex = -1;
        updateHighlight();
    }

    // Show dropdown when input is focused
    function showDropdown() {
        if (input.value.trim() === '') {
            renderDropdownItems(listItems);
        }
        dropdownList.style.display = 'block';
    }

    // Hide dropdown
    function hideDropdown() {
        dropdownList.style.display = 'none';
        highlightedIndex = -1;
    }

    // Handle input changes
    function handleInput() {
        const searchTerm = input.value.toLowerCase();

        if (searchTerm === '') {
            renderDropdownItems(listItems);
            addNewItem.style.display = 'none';
            return;
        }

        const filteredItems = listItems.filter((item) =>
            item.toLowerCase().includes(searchTerm),
        );

        renderDropdownItems(filteredItems);

        // Show "add new" option if input doesn't match any existing item
        if (filteredItems.length === 0 || !listItems.some((item) =>
            item.toLowerCase() === searchTerm)) {
            addNewItem.textContent = `Add "${input.value}"`;
            addNewItem.style.display = 'block';
        } else {
            addNewItem.style.display = 'none';
        }
    }

    // Update highlighted item
    function updateHighlight() {
        const items = dropdownList.querySelectorAll('.dropdown-item:not(#add-new-item)');
        const addNewVisible = addNewItem.style.display === 'block';

        // Remove highlight from all items
        items.forEach((item) => item.classList.remove('highlight'));
        if (addNewVisible) addNewItem.classList.remove('highlight');

        // Add highlight to selected item
        if (highlightedIndex >= 0) {
            if (addNewVisible && highlightedIndex === items.length) {
                addNewItem.classList.add('highlight');
            } else if (highlightedIndex < items.length) {
                items[highlightedIndex].classList.add('highlight');
            }
        }
    }

    // Handle keyboard navigation
    function handleKeyDown(e) {
        const items = dropdownList.querySelectorAll('.dropdown-item:not(#add-new-item)');
        const addNewVisible = addNewItem.style.display === 'block';
        const totalItems = items.length + (addNewVisible ? 1 : 0);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedIndex = (highlightedIndex + 1) % totalItems;
            updateHighlight();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedIndex = (highlightedIndex - 1 + totalItems) % totalItems;
            updateHighlight();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0) {
                if (addNewVisible && highlightedIndex === items.length) {
                    // Add new item
                    addNewItem.click();
                } else {
                    // Select existing item
                    items[highlightedIndex].click();
                }
            }
        }
    }



   

    // Handle adding new item
    addNewItem.addEventListener('click', () => {
        const newItem = input.value.trim();
        if (newItem && !listItems.includes(newItem)) {
            listItems.push(newItem);
            listItems.sort(); // Optional: keep items sorted
            input.value = newItem;
            hideDropdown();

            // You might want to save the updated items array to a server here
            // console.log('Added new item:', newItem);
            // console.log('All items:', listItems);
        }
    });
}

function initLabelDropdownList() {
    document.addEventListener('DOMContentLoaded', () => {

        xSearchDropDown('dropdown-input', 'dropdown-list','add-new-item', ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pineapple', 'Strawberry', 'Watermelon']);
    });
}
export default initLabelDropdownList;

console.log('scripts.js loaded!');
let total = 0;

function addItem() {
    const service = document.getElementById('service').value;
    const price = parseFloat(document.getElementById('price').value);

    if (service && !isNaN(price)) {
        const itemList = document.getElementById('itemList');
        const listItem = document.createElement('li');
        listItem.textContent = `${service}: $${price.toFixed(2)}`;
        itemList.appendChild(listItem);

        total += price;
        document.getElementById('totalrice').textContent = total.toFixed(2);

        // Clear the input fields
        document.getElementById('service').value = '';
        document.getElementById('price').value = '';
    } else {
        alert('Please enter a valid service and price.');
    }
}

// JavaScript to trigger print

// document.getElementById('receiptForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     alert('Receipt saved!');
//     // Add your form submission logic here
// });

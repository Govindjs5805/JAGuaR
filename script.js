document.addEventListener('DOMContentLoaded', () => {
    const balanceElem = document.querySelector('.balance');
    const transactionTable = document.getElementById('transactionTable');
    const expForm = document.getElementById('expForm');
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    const historyCtx = document.getElementById('historyChart').getContext('2d');
    const BOUNDARY_AMOUNT = 20000; // INR 20,000 boundary
    let balance = 0;
    let incomeTotal = 0;
    let expenseTotal = 0;
    let transactions = [];
    let expenseChart, historyChart;

    // Initialize balance and transactions from localStorage if available
    if (localStorage.getItem('balance')) {
        balance = parseFloat(localStorage.getItem('balance'));
        balanceElem.textContent = balance.toFixed(2);
    }

    if (localStorage.getItem('incomeTotal')) {
        incomeTotal = parseFloat(localStorage.getItem('incomeTotal'));
    }

    if (localStorage.getItem('expenseTotal')) {
        expenseTotal = parseFloat(localStorage.getItem('expenseTotal'));
    }

    if (localStorage.getItem('transactions')) {
        transactions = JSON.parse(localStorage.getItem('transactions'));
        transactions.forEach(transaction => addTransactionToTable(transaction.type, transaction.name, transaction.amount));
    }

    // Initialize the pie chart
    function initializeExpenseChart() {
        expenseChart = new Chart(expenseCtx, {
            type: 'pie',
            data: {
                labels: ['Remaining Cash', 'Total Expenses'],
                datasets: [{
                    label: 'Expense Breakdown',
                    data: [balance, expenseTotal],
                    backgroundColor: ['#36a2eb', '#ff6384'],
                    borderColor: ['#fff', '#fff'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ₹' + context.raw.toFixed(2);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize the history chart
    function initializeHistoryChart() {
        historyChart = new Chart(historyCtx, {
            type: 'line',
            data: {
                labels: transactions.map((_, index) => `Transaction ${index + 1}`),
                datasets: [{
                    label: 'Balance Over Time',
                    data: transactions.reduce((acc, transaction) => {
                        if (transaction.type === 'income') {
                            acc.push((acc[acc.length - 1] || 0) + transaction.amount);
                        } else if (transaction.type === 'expense') {
                            acc.push((acc[acc.length - 1] || 0) - transaction.amount);
                        }
                        return acc;
                    }, []),
                    fill: false,
                    borderColor: '#4CAF50',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Balance: ₹${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Update the pie chart data
    function updateExpenseChart() {
        expenseChart.data.datasets[0].data = [balance, expenseTotal];
        expenseChart.update();
    }

    // Update the history chart data
    function updateHistoryChart() {
        historyChart.data.labels = transactions.map((_, index) => `Transaction ${index + 1}`);
        historyChart.data.datasets[0].data = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                acc.push((acc[acc.length - 1] || 0) + transaction.amount);
            } else if (transaction.type === 'expense') {
                acc.push((acc[acc.length - 1] || 0) - transaction.amount);
            }
            return acc;
        }, []);
        historyChart.update();
    }

    // Initialize charts on page load
    initializeExpenseChart();
    initializeHistoryChart();

    // Handle form submission
    expForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const type = document.getElementById('type').value;
        const name = document.getElementById('name').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);

        if (!name || isNaN(amount) || amount <= 0) {
            alert('Please enter valid transaction details.');
            return;
        }

        // Update balance
        if (type === 'income') {
            balance += amount;
            incomeTotal += amount;
        } else if (type === 'expense') {
            balance -= amount;
            expenseTotal += amount;
        }

        // Save balance, income, expense totals, and transactions to localStorage
        transactions.push({ type, name, amount });
        localStorage.setItem('balance', balance.toFixed(2));
        localStorage.setItem('incomeTotal', incomeTotal.toFixed(2));
        localStorage.setItem('expenseTotal', expenseTotal.toFixed(2));
        localStorage.setItem('transactions', JSON.stringify(transactions));

        // Update balance display
        balanceElem.textContent = balance.toFixed(2);

        

        // Update charts
        updateExpenseChart();
        updateHistoryChart();

        // Add transaction to table
        addTransactionToTable(type, name, amount);

        // Alert if balance falls below the boundary amount
        if (balance < BOUNDARY_AMOUNT) {
            alert('Warning: Your balance is below INR 20,000!');
        }
    });

    // Add transaction to table
    function addTransactionToTable(type, name, amount) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>${name}</td>
            <td>₹${amount.toFixed(2)}</td>
        `;
        transactionTable.appendChild(row);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const balanceElem = document.querySelector('.balance');
    const transactionTable = document.getElementById('transactionTable');
    const expForm = document.getElementById('expForm');
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    const historyCtx = document.getElementById('historyChart').getContext('2d');
    const alertBox = document.getElementById('alertBox');
    const BOUNDARY_AMOUNT = 20000; // INR 20,000 boundary
    let balance = 0;
    let incomeTotal = 0;
    let expenseTotal = 0;
    let transactions = [];
    let expenseChart, historyChart;

    // Initialize balance and transactions from localStorage if available
    if (localStorage.getItem('balance')) {
        balance = parseFloat(localStorage.getItem('balance'));
        balanceElem.textContent = balance.toFixed(2);
    }

    if (localStorage.getItem('incomeTotal')) {
        incomeTotal = parseFloat(localStorage.getItem('incomeTotal'));
    }

    if (localStorage.getItem('expenseTotal')) {
        expenseTotal = parseFloat(localStorage.getItem('expenseTotal'));
    }

    if (localStorage.getItem('transactions')) {
        transactions = JSON.parse(localStorage.getItem('transactions'));
        transactions.forEach(transaction => addTransactionToTable(transaction.type, transaction.name, transaction.amount));
    }

    // Initialize the pie chart
    function initializeExpenseChart() {
        expenseChart = new Chart(expenseCtx, {
            type: 'pie',
            data: {
                labels: ['Remaining Cash', 'Total Expenses'],
                datasets: [{
                    label: 'Expense Breakdown',
                    data: [balance, expenseTotal],
                    backgroundColor: ['#36a2eb', '#ff6384'],
                    borderColor: ['#fff', '#fff'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ₹' + context.raw.toFixed(2);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize the history chart
    function initializeHistoryChart() {
        historyChart = new Chart(historyCtx, {
            type: 'line',
            data: {
                labels: transactions.map((_, index) => `Transaction ${index + 1}`),
                datasets: [{
                    label: 'Balance Over Time',
                    data: transactions.reduce((acc, transaction) => {
                        if (transaction.type === 'income') {
                            acc.push((acc[acc.length - 1] || 0) + transaction.amount);
                        } else if (transaction.type === 'expense') {
                            acc.push((acc[acc.length - 1] || 0) - transaction.amount);
                        }
                        return acc;
                    }, []),
                    fill: false,
                    borderColor: '#4CAF50',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Balance: ₹${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Update the pie chart data
    function updateExpenseChart() {
        expenseChart.data.datasets[0].data = [balance, expenseTotal];
        expenseChart.update();
    }

    // Update the history chart data
    function updateHistoryChart() {
        historyChart.data.labels = transactions.map((_, index) => `Transaction ${index + 1}`);
        historyChart.data.datasets[0].data = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                acc.push((acc[acc.length - 1] || 0) + transaction.amount);
            } else if (transaction.type === 'expense') {
                acc.push((acc[acc.length - 1] || 0) - transaction.amount);
            }
            return acc;
        }, []);
        historyChart.update();
    }

    // Display alert box with a message
    function showAlert(message) {
        alertBox.textContent = message;
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 5000); // Hide after 5 seconds
    }

    // Initialize charts on page load
    initializeExpenseChart();
    initializeHistoryChart();

    // Handle form submission
    expForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const type = document.getElementById('type').value;
        const name = document.getElementById('name').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);

        if (!name || isNaN(amount) || amount <= 0) {
            alert('Please enter valid transaction details.');
            return;
        }

        // Update balance
        if (type === 'income') {
            balance += amount;
            incomeTotal += amount;
        } else if (type === 'expense') {
            balance -= amount;
            expenseTotal += amount;
        }
                // Check if balance is below zero
                if (balance < 0) {
                    sendNotification('Budget Alert', 'Your balance has gone below zero.');
                }

        // Save balance, income, expense totals, and transactions to localStorage
        transactions.push({ type, name, amount });
        localStorage.setItem('balance', balance.toFixed(2));
        localStorage.setItem('incomeTotal', incomeTotal.toFixed(2));
        localStorage.setItem('expenseTotal', expenseTotal.toFixed(2));
        localStorage.setItem('transactions', JSON.stringify(transactions));

        // Update balance display
        balanceElem.textContent = balance.toFixed(2);

        // Update charts
        updateExpenseChart();
        updateHistoryChart();

        // Add transaction to table
        addTransactionToTable(type, name, amount);

        // Alert if balance falls below the boundary amount
        if (balance < BOUNDARY_AMOUNT) {
            showAlert('Warning: Your balance is below INR 20,000!');
        }
    });

    // Add transaction to table
    function addTransactionToTable(type, name, amount) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${type}</td>
            <td>${name}</td>
            <td>₹${amount.toFixed(2)}</td>
        `;
        transactionTable.appendChild(row);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.querySelector(".report-content tbody");

    // Function to show popup
    function showPopup(content) {
        var popup = document.getElementById("popup");
        popup.innerHTML = `<span class="close-btn" onclick="closePopup()">×</span>` + content;
        popup.style.display = "block";
    }

    // Function to close popup
    window.closePopup = function() {
        var popup = document.getElementById("popup");
        popup.style.display = "none";
    }

    // Function to add click event listeners to rows
    function addRowClickListeners() {
        var rows = tbody.querySelectorAll("tr");
        rows.forEach(function(row) {
            row.addEventListener('click', function() {
                var cells = row.querySelectorAll("td");
                var popupContent = `
                    <h3>Break Summary for ${cells[0].innerText}</h3>
                    <p>Total Breaks Taken: ${cells[1].innerText}</p>
                    <p>Breaks Skipped: ${cells[2].innerText}</p>
                    <p>Status: ${cells[3].innerText}</p>
                `;
                showPopup(popupContent);
            });
        });
    }
    // Function to update the report table for all hours
    function updateReport() {
        chrome.storage.local.get({breakStats: {}}, function(data) {
            const breakStats = data.breakStats || {};

            // Clear the table body
            tbody.innerHTML = '';

            function formatHour(hour) {
                const hourFormatted = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
                const suffix = hour < 12 ? 'AM' : 'PM';
                return `${hourFormatted}:00 ${suffix}`;
            }

            // Display data for each hour
            for (let hour = 0; hour < 24; hour++) {
                const statsForHour = breakStats[hour] || { taken: 0, skipped: 0 };
                const status = statsForHour.taken >= 1 ? 'Well-Rested' : 'Needs More Breaks';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="Hour">${formatHour(hour)}</td>
                    <td data-label="Breaks Taken">${statsForHour.taken}</td>
                    <td data-label="Breaks Skipped">${statsForHour.skipped}</td>
                    <td data-label="Status">${status}</td>
                `;
                tbody.appendChild(tr);
            }
        
            var labels = [];
            var dataTaken = [];
            var dataSkipped = [];
            var totalTaken = 0;
            var totalSkipped = 0;
    
            for (var hour = 0; hour < 24; hour++) {
                labels.push(formatHour(hour));
                var statsForHour = data.breakStats[hour] || { taken: 0, skipped: 0 };
                dataTaken.push(statsForHour.taken);
                dataSkipped.push(statsForHour.skipped);
                totalTaken += statsForHour.taken;
                totalSkipped += statsForHour.skipped;
            }
    
            // Data for the bar chart
            var barData = {
                labels: labels,
                datasets: [{
                    label: 'Breaks Taken',
                    data: dataTaken,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                }, {
                    label: 'Breaks Skipped',
                    data: dataSkipped,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                }]
            };
    
            // Render the charts
            renderBarChart(barData);
        });
        addRowClickListeners();
    }
    addRowClickListeners();
    // Update the report initially
    updateReport();

    // Optionally, update the report at regular intervals
    setInterval(updateReport, 60000); // 60000 milliseconds = 1 minute
});

function renderBarChart(data) {
    var ctx = document.getElementById('breakBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
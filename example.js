// Load the CSV file
d3.csv("data/mock_stock_data.csv").then(data => {
    // Parse the date and convert prices to numbers
    data.forEach(d => {
        d.Date = new Date(d.Date);
        d.Price = +d.Price;
    });

    // Populate the stock select dropdown
    const stockNames = [...new Set(data.map(d => d.Stock))];
    const stockSelect = d3.select("#stock-select");
    stockSelect.selectAll("option")
        .data(stockNames)
        .enter()
        .append("option")
        .text(d => d);

    // Set up initial chart
    updateChart(data);

    // Add event listeners for filtering
    stockSelect.on("change", () => filterData(data));
    d3.select("#start-date").on("change", () => filterData(data));
    d3.select("#end-date").on("change", () => filterData(data));
});

function filterData(data) {
    const selectedStock = d3.select("#stock-select").property("value");
    const startDate = new Date(d3.select("#start-date").property("value"));
    const endDate = new Date(d3.select("#end-date").property("value"));

    const filteredData = data.filter(d => {
        return (!selectedStock || d.Stock === selectedStock) &&
               (!startDate || d.Date >= startDate) &&
               (!endDate || d.Date <= endDate);
    });

    updateChart(filteredData);
}

function updateChart(data) {
    // Clear existing chart
    d3.select("#chart").html("");

    // Set up dimensions and margins
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
          width = 600 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    // Append SVG element
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Price)])
        .range([height, 0]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add line
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Price));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Date))
        .attr("cy", d => y(d.Price))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Stock: ${d.Stock}<br>Date: ${d.Date.toLocaleDateString()}<br>Price: ${d.Price}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function loadGraphs() {
    // Global variables for state management
    let currentScene = 0;
    let worldBankData = [];
    let isAnimating = false;
    let animationInterval;

    // Color schemes for different regions
    const regionColors = {
        'Africa': '#e74c3c',
        'Asia': '#f39c12',
        'Europe': '#3498db',
        'North America': '#2ecc71',
        'South America': '#9b59b6',
        'Oceania': '#1abc9c'
    };

    // Generate synthetic World Bank-style data
    function generateWorldBankData() {
        const countries = [
            {name: 'United States', region: 'North America', code: 'USA'},
            {name: 'China', region: 'Asia', code: 'CHN'},
            {name: 'Japan', region: 'Asia', code: 'JPN'},
            {name: 'Germany', region: 'Europe', code: 'DEU'},
            {name: 'India', region: 'Asia', code: 'IND'},
            {name: 'United Kingdom', region: 'Europe', code: 'GBR'},
            {name: 'France', region: 'Europe', code: 'FRA'},
            {name: 'Brazil', region: 'South America', code: 'BRA'},
            {name: 'Italy', region: 'Europe', code: 'ITA'},
            {name: 'Canada', region: 'North America', code: 'CAN'},
            {name: 'South Korea', region: 'Asia', code: 'KOR'},
            {name: 'Russia', region: 'Europe', code: 'RUS'},
            {name: 'Australia', region: 'Oceania', code: 'AUS'},
            {name: 'Spain', region: 'Europe', code: 'ESP'},
            {name: 'Mexico', region: 'North America', code: 'MEX'},
            {name: 'Indonesia', region: 'Asia', code: 'IDN'},
            {name: 'Nigeria', region: 'Africa', code: 'NGA'},
            {name: 'South Africa', region: 'Africa', code: 'ZAF'},
            {name: 'Argentina', region: 'South America', code: 'ARG'},
            {name: 'Egypt', region: 'Africa', code: 'EGY'},
            {name: 'Sweden', region: 'Europe', code: 'SWE'},
            {name: 'Norway', region: 'Europe', code: 'NOR'},
            {name: 'Bangladesh', region: 'Asia', code: 'BGD'},
            {name: 'Pakistan', region: 'Asia', code: 'PAK'},
            {name: 'Vietnam', region: 'Asia', code: 'VNM'}
        ];

        const data = [];
        const years = d3.range(1960, 2025, 5);

        countries.forEach(country => {
            years.forEach(year => {
                // Generate realistic economic development trajectories
                const baseGDP = Math.random() * 50000 + 5000;
                const growthRate = 0.02 + Math.random() * 0.04;
                const gdpPerCapita = baseGDP * Math.pow(1 + growthRate, (year - 1960) / 10);

                const population = (Math.random() * 300000000 + 1000000) * (1 + (year - 1960) * 0.015);
                const lifeExpectancy = Math.min(85, 45 + (year - 1960) * 0.3 + Math.random() * 10);
                const literacyRate = Math.min(99, 30 + (year - 1960) * 0.8 + Math.random() * 20);
                const infantMortality = Math.max(2, 100 - (year - 1960) * 0.8 - Math.random() * 20);

                data.push({
                    country: country.name,
                    region: country.region,
                    code: country.code,
                    year: year,
                    gdpPerCapita: Math.round(gdpPerCapita),
                    population: Math.round(population),
                    lifeExpectancy: Math.round(lifeExpectancy * 10) / 10,
                    literacyRate: Math.round(literacyRate * 10) / 10,
                    infantMortality: Math.round(infantMortality * 10) / 10
                });
            });
        });

        return data;
    }

    // Initialize data
    worldBankData = generateWorldBankData();

    // Scene management
    function showScene(sceneIndex) {
        // Update navigation
        document.querySelectorAll('.nav-button').forEach((btn, index) => {
            btn.classList.toggle('active', index === sceneIndex);
        });

        // Update scenes
        document.querySelectorAll('.scene').forEach((scene, index) => {
            scene.classList.toggle('active', index === sceneIndex);
        });

        currentScene = sceneIndex;

        // Initialize the appropriate visualization
        setTimeout(() => {
            switch (sceneIndex) {
                case 0:
                    initBubbleChart();
                    break;
                case 1:
                    initWorldMap();
                    break;
                case 2:
                    initExplorerChart();
                    break;
            }
        }, 100);
    }

    // Bubble Chart (Scene 1)
    function initBubbleChart() {
        const container = d3.select('#bubble-chart');
        container.selectAll('*').remove();

        const margin = {top: 20, right: 50, bottom: 80, left: 80};
        const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleLog()
            .domain([500, 100000])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([30, 85])
            .range([height, 0]);

        const sizeScale = d3.scaleSqrt()
            .domain([0, 1500000000])
            .range([5, 50]);

        // Axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('.0s')));

        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));

        // Axis labels
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 20)
            .attr('x', -height / 2 - margin.top)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Life Expectancy (years)');

        svg.append('text')
            .attr('transform', `translate(${width / 2 + margin.left}, ${height + margin.top + 60})`)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('GDP per Capita (USD, log scale)');

        // Create legend
        createBubbleLegend();

        // Initial render
        updateBubbleChart();

        // Event listeners
        document.getElementById('year-slider').addEventListener('input', updateBubbleChart);
        document.getElementById('y-indicator').addEventListener('change', updateBubbleChart);
    }

    function updateBubbleChart() {
        const year = +document.getElementById('year-slider').value;
        const yIndicator = document.getElementById('y-indicator').value;

        document.getElementById('year-display').textContent = year;

        const container = d3.select('#bubble-chart');
        const svg = container.select('svg');
        const g = svg.select('g');

        // Filter data for the selected year
        const yearData = worldBankData.filter(d => d.year === year);

        // Update scales based on indicator
        let yDomain, yLabel;
        switch (yIndicator) {
            case 'lifeExpectancy':
                yDomain = [30, 85];
                yLabel = 'Life Expectancy (years)';
                break;
            case 'literacyRate':
                yDomain = [0, 100];
                yLabel = 'Literacy Rate (%)';
                break;
            case 'infantMortality':
                yDomain = [0, 150];
                yLabel = 'Infant Mortality (per 1000 births)';
                break;
        }

        const yScale = d3.scaleLinear()
            .domain(yDomain)
            .range([500, 0]);

        const sizeScale = d3.scaleSqrt()
            .domain(d3.extent(yearData, d => d.population))
            .range([5, 50]);

        // Update y-axis
        g.select('.y-axis')
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale));

        // Update y-axis label
        svg.select('text')
            .text(yLabel);

        // Bind data to circles
        const circles = g.selectAll('.bubble')
            .data(yearData, d => d.country);

        // Enter
        circles.enter()
            .append('circle')
            .attr('class', 'bubble')
            .attr('cx', d => d3.scaleLog().domain([500, 100000]).range([0, 1000])(d.gdpPerCapita))
            .attr('cy', d => yScale(d[yIndicator]))
            .attr('r', 0)
            .attr('fill', d => regionColors[d.region])
            .attr('opacity', 0.7)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip)
            .transition()
            .duration(500)
            .attr('r', d => sizeScale(d.population));

        // Update
        circles.transition()
            .duration(500)
            .attr('cy', d => yScale(d[yIndicator]))
            .attr('r', d => sizeScale(d.population));

        // Exit
        circles.exit()
            .transition()
            .duration(300)
            .attr('r', 0)
            .remove();

        // Add annotations for interesting points
        addBubbleAnnotations(yearData, yIndicator, yScale);
    }

    function createBubbleLegend() {
        const legend = d3.select('#bubble-legend');
        legend.selectAll('*').remove();

        Object.entries(regionColors).forEach(([region, color]) => {
            const item = legend.append('div').attr('class', 'legend-item');
            item.append('div')
                .attr('class', 'legend-color')
                .style('background-color', color);
            item.append('span').text(region);
        });
    }

    function addBubbleAnnotations(data, indicator, yScale) {
        // Remove existing annotations
        d3.select('#bubble-chart').selectAll('.annotation').remove();

        // Find interesting points
        const maxCountry = data.reduce((max, d) => d[indicator] > max[indicator] ? d : max);
        const minCountry = data.reduce((min, d) => d[indicator] < min[indicator] ? d : min);

        // Add annotation for highest value
        const container = d3.select('#bubble-chart');
        const xScale = d3.scaleLog().domain([500, 100000]).range([0, 1000]);

        if (indicator !== 'infantMortality') {
            container.append('div')
                .attr('class', 'annotation')
                .style('left', (xScale(maxCountry.gdpPerCapita) + 80) + 'px')
                .style('top', (yScale(maxCountry[indicator]) + 20) + 'px')
                .html(`<strong>${maxCountry.country}</strong><br/>
                           Highest ${indicator.replace(/([A-Z])/g, ' $1').toLowerCase()}<br/>
                           Value: ${maxCountry[indicator]}`);
        }
    }

    // World Map (Scene 2)
    function initWorldMap() {
        const container = d3.select('#world-map');
        container.selectAll('*').remove();

        // For this demo, we'll create a simplified world map representation
        // In a real implementation, you would load actual world topology data
        const width = container.node().getBoundingClientRect().width;
        const height = 600;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create a simple grid representation of countries
        const gridData = worldBankData
            .filter(d => d.year === 2020)
            .map((d, i) => ({
                ...d,
                x: (i % 10) * (width / 10),
                y: Math.floor(i / 10) * (height / 5)
            }));

        updateWorldMap();

        // Event listeners
        document.getElementById('map-indicator').addEventListener('change', updateWorldMap);
        document.getElementById('map-year').addEventListener('input', updateWorldMap);
    }

    function updateWorldMap() {
        const year = +document.getElementById('map-year').value;
        const indicator = document.getElementById('map-indicator').value;

        document.getElementById('map-year-display').textContent = year;

        const container = d3.select('#world-map');
        const svg = container.select('svg');
        const width = +svg.attr('width');
        const height = +svg.attr('height');

        // Filter data for the selected year
        const yearData = worldBankData.filter(d => d.year === year);

        // Create color scale
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain(d3.extent(yearData, d => d[indicator]));

        // Create grid layout
        const gridData = yearData.map((d, i) => ({
            ...d,
            x: (i % 10) * (width / 10),
            y: Math.floor(i / 10) * (height / 5)
        }));

        // Bind data to rectangles (representing countries)
        const countries = svg.selectAll('.country')
            .data(gridData, d => d.country);

        // Enter
        countries.enter()
            .append('rect')
            .attr('class', 'country')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', width / 10 - 5)
            .attr('height', height / 5 - 5)
            .attr('fill', d => colorScale(d[indicator]))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .attr('rx', 5)
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip)
            .on('click', d => showCountryDetails(d));

        // Update
        countries.transition()
            .duration(500)
            .attr('fill', d => colorScale(d[indicator]));

        // Exit
        countries.exit().remove();

        // Update metrics panel
        updateMetricsPanel(yearData, indicator);
    }

    function updateMetricsPanel(data, indicator) {
        const avgValue = d3.mean(data, d => d[indicator]);
        const maxCountry = data.reduce((max, d) => d[indicator] > max[indicator] ? d : max);

        document.getElementById('total-countries').textContent = data.length;
        document.getElementById('avg-gdp').textContent = `$${Math.round(d3.mean(data, d => d.gdpPerCapita)).toLocaleString()}`;
        document.getElementById('highest-country').textContent = maxCountry.country;
        document.getElementById('regional-clusters').textContent = new Set(data.map(d => d.region)).size;
    }

    // Explorer Chart (Scene 3)
    function initExplorerChart() {
        const container = d3.select('#explorer-chart');
        container.selectAll('*').remove();

        const margin = {top: 20, right: 50, bottom: 80, left: 80};
        const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Initialize with default values
        updateExplorerChart();

        // Event listeners
        document.getElementById('x-axis-select').addEventListener('change', updateExplorerChart);
        document.getElementById('y-axis-select').addEventListener('change', updateExplorerChart);
        document.getElementById('region-filter').addEventListener('change', updateExplorerChart);
        document.getElementById('explorer-year').addEventListener('input', updateExplorerChart);
    }

    function updateExplorerChart() {
        const year = +document.getElementById('explorer-year').value;
        const xIndicator = document.getElementById('x-axis-select').value;
        const yIndicator = document.getElementById('y-axis-select').value;
        const regionFilter = document.getElementById('region-filter').value;

        document.getElementById('explorer-year-display').textContent = year;

        const container = d3.select('#explorer-chart');
        const svg = container.select('svg');
        const margin = {top: 20, right: 50, bottom: 80, left: 80};
        const width = +svg.attr('width') - margin.left - margin.right;
        const height = +svg.attr('height') - margin.top - margin.bottom;
        const g = svg.select('g');

        // Clear previous content
        g.selectAll('*').remove();

        // Filter data
        let yearData = worldBankData.filter(d => d.year === year);
        if (regionFilter !== 'all') {
            yearData = yearData.filter(d => d.region === regionFilter);
        }

        // Create scales
        const xScale = getScale(xIndicator, yearData, [0, width]);
        const yScale = getScale(yIndicator, yearData, [height, 0]);
        const sizeScale = d3.scaleSqrt()
            .domain(d3.extent(yearData, d => d.population))
            .range([5, 30]);

        // Add axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(getTickFormat(xIndicator)));

        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale).tickFormat(getTickFormat(yIndicator)));

        // Add axis labels
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 20)
            .attr('x', -height / 2 - margin.top)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .text(getIndicatorLabel(yIndicator));

        svg.append('text')
            .attr('transform', `translate(${width / 2 + margin.left}, ${height + margin.top + 60})`)
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .text(getIndicatorLabel(xIndicator));

        // Add circles
        g.selectAll('.explorer-bubble')
            .data(yearData)
            .enter()
            .append('circle')
            .attr('class', 'explorer-bubble')
            .attr('cx', d => xScale(d[xIndicator]))
            .attr('cy', d => yScale(d[yIndicator]))
            .attr('r', d => sizeScale(d.population))
            .attr('fill', d => regionColors[d.region])
            .attr('opacity', 0.7)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip);
    }

    function getScale(indicator, data, range) {
        const domain = d3.extent(data, d => d[indicator]);

        if (indicator === 'gdpPerCapita') {
            return d3.scaleLog().domain([Math.max(domain[0], 100), domain[1]]).range(range);
        } else if (indicator === 'population') {
            return d3.scaleLog().domain([Math.max(domain[0], 1000), domain[1]]).range(range);
        } else {
            return d3.scaleLinear().domain(domain).range(range);
        }
    }

    function getTickFormat(indicator) {
        if (indicator === 'gdpPerCapita' || indicator === 'population') {
            return d3.format('.0s');
        }
        return d3.format('.1f');
    }

    function getIndicatorLabel(indicator) {
        const labels = {
            'gdpPerCapita': 'GDP per Capita (USD)',
            'population': 'Population',
            'lifeExpectancy': 'Life Expectancy (years)',
            'literacyRate': 'Literacy Rate (%)',
            'infantMortality': 'Infant Mortality (per 1000 births)'
        };
        return labels[indicator];
    }

    // Tooltip functions
    function showTooltip(event, d) {
        const tooltip = d3.select('#tooltip');
        tooltip.style('opacity', 1)
            .html(`
                    <strong>${d.country}</strong><br/>
                    Region: ${d.region}<br/>
                    Year: ${d.year}<br/>
                    GDP per Capita: $${d.gdpPerCapita.toLocaleString()}<br/>
                    Population: ${d.population.toLocaleString()}<br/>
                    Life Expectancy: ${d.lifeExpectancy} years<br/>
                    Literacy Rate: ${d.literacyRate}%<br/>
                    Infant Mortality: ${d.infantMortality}
                `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    function hideTooltip() {
        d3.select('#tooltip').style('opacity', 0);
    }

    function showCountryDetails(country) {
        alert(`Country Details:\n\nName: ${country.country}\nRegion: ${country.region}\nGDP per Capita: $${country.gdpPerCapita.toLocaleString()}\nPopulation: ${country.population.toLocaleString()}\nLife Expectancy: ${country.lifeExpectancy} years`);
    }

    // Animation functions
    function playAnimation() {
        if (isAnimating) return;

        isAnimating = true;
        const button = document.querySelector('.play-button');
        const originalText = button.textContent;
        button.textContent = 'Playing...';
        button.disabled = true;

        const slider = document.getElementById('year-slider');
        const startYear = +slider.min;
        const endYear = +slider.max;
        const step = +slider.step;
        let currentYear = startYear;

        animationInterval = setInterval(() => {
            slider.value = currentYear;
            updateBubbleChart();

            currentYear += step;
            if (currentYear > endYear) {
                clearInterval(animationInterval);
                isAnimating = false;
                button.textContent = originalText;
                button.disabled = false;
            }
        }, 800);
    }

    // Initialize the first scene on load
    document.addEventListener('DOMContentLoaded', function () {
        showScene(0);
        document.getElementById('play-animation').addEventListener('click', playAnimation);
        document.getElementsByClassName('nav-button')[0].addEventListener('click', () => showScene(0));
        document.getElementsByClassName('nav-button')[1].addEventListener('click', () => showScene(1));
        document.getElementsByClassName('nav-button')[2].addEventListener('click', () => showScene(2));
    });
}

loadGraphs();